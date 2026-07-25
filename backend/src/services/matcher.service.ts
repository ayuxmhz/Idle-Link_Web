import { GoogleGenAI, Type } from "@google/genai";
import { DeviceModel, IDevice } from "../models/device.model";
import { GEMINI_API_KEY } from "../configs/constant";
import { HttpException } from "../exceptions/http-exception";
import { MatchQueryDTO } from "../dtos/matcher.dto";

// The full "flash" tier (gemini-2.5-flash, gemini-flash-latest,
// gemini-2.0-flash) has no free-tier quota on many API keys/projects
// (confirmed via a 429 RESOURCE_EXHAUSTED with limit: 0), while the "lite"
// tier is available on the free tier and is more than capable for this
// ranking task. Two lite models are tried in order — the free tier
// occasionally returns a transient 503 UNAVAILABLE ("high demand") for a
// specific model, which a short retry usually clears; falling back to a
// second model covers the rest.
const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-flash-lite-latest"];
const RETRIES_PER_MODEL = 2;
const RETRY_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("UNAVAILABLE") || message.includes("503") || message.includes("RESOURCE_EXHAUSTED");
}

interface GeminiMatch {
    deviceId: string;
    matchPercent: number;
    explanation: string;
}

const RESPONSE_SCHEMA = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            deviceId: { type: Type.STRING, description: "The _id of the matched device" },
            matchPercent: { type: Type.NUMBER, description: "How well this device fits the task, 0-100" },
            explanation: { type: Type.STRING, description: "One short sentence on why this device fits" }
        },
        required: ["deviceId", "matchPercent", "explanation"]
    }
};

function buildPrompt(query: string, devices: IDevice[]): string {
    const deviceList = devices
        .map((d) => (
            `- id: ${d._id.toString()}, name: "${d.name}", type: ${d.type}, ` +
            `cpu: ${d.specs.cpu}, ram: ${d.specs.ramGB}GB, gpu: ${d.specs.gpu}, storage: ${d.specs.storageGB}GB, ` +
            `hourlyRate: NPR ${d.hourlyRate}, uptime: ${d.uptimePercent}%`
        ))
        .join("\n");

    return (
        `You are a compute-marketplace matching assistant. A user described a task they want to run. ` +
        `Given the list of currently available devices below, rank the devices that best fit the task ` +
        `(best fit first). Only include devices that are a reasonable fit — omit devices that clearly don't fit. ` +
        `Consider the task's likely CPU/GPU/RAM/storage needs against each device's specs.\n\n` +
        `User's task: "${query}"\n\n` +
        `Available devices:\n${deviceList}\n\n` +
        `Respond with a JSON array ranking the best-fitting devices, using each device's exact "id" as "deviceId".`
    );
}

export class MatcherService {
    async findMatches(dto: MatchQueryDTO): Promise<Array<Record<string, any>>> {
        if (!GEMINI_API_KEY) {
            throw new HttpException(503, "AI Matcher is not configured. Set GEMINI_API_KEY in the backend .env file.");
        }

        const devices = await DeviceModel.find({ status: "live" });
        if (devices.length === 0) {
            return [];
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const prompt = buildPrompt(dto.query, devices);

        let lastError: unknown;
        let matches: GeminiMatch[] | undefined;

        outer: for (const model of GEMINI_MODELS) {
            for (let attempt = 1; attempt <= RETRIES_PER_MODEL; attempt++) {
                try {
                    const response = await ai.models.generateContent({
                        model,
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: RESPONSE_SCHEMA
                        }
                    });
                    matches = JSON.parse(response.text ?? "[]") as GeminiMatch[];
                    break outer;
                } catch (error) {
                    lastError = error;
                    if (isTransientError(error) && attempt < RETRIES_PER_MODEL) {
                        await sleep(RETRY_DELAY_MS);
                        continue;
                    }
                    break; // non-transient, or out of retries for this model — try the next model
                }
            }
        }

        if (!matches) {
            const message = lastError instanceof Error ? lastError.message : "Unknown error";
            throw new HttpException(502, `AI Matcher request failed: ${message}`);
        }

        const deviceMap = new Map(devices.map((d) => [d._id.toString(), d]));

        return matches
            .filter((m) => deviceMap.has(m.deviceId))
            .map((m) => {
                const device = deviceMap.get(m.deviceId)!;
                return {
                    ...device.toObject(),
                    matchPercent: Math.max(0, Math.min(100, Math.round(m.matchPercent))),
                    explanation: m.explanation
                };
            });
    }
}
