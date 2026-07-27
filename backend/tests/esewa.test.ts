import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { createUser } from "./helpers";

const generateContentMock = vi.fn();
vi.mock("@google/genai", () => ({
    GoogleGenAI: class {
        models = { generateContent: generateContentMock };
    },
    Type: { ARRAY: "ARRAY", OBJECT: "OBJECT", STRING: "STRING", NUMBER: "NUMBER" }
}));

afterEach(() => {
    vi.unstubAllGlobals();
    generateContentMock.mockReset();
});

describe("eSewa checkout initiation", () => {
    it("rejects initiation without auth", async () => {
        const res = await request(app).post("/api/v1/transactions/esewa/initiate").send({ amount: 500 });
        expect(res.status).toBe(401);
    });

    it("rejects a non-positive amount", async () => {
        const user = await createUser("esewabad");
        const res = await request(app)
            .post("/api/v1/transactions/esewa/initiate")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 0 });
        expect(res.status).toBe(400);
    });

    it("builds a signed checkout form with a unique transaction reference", async () => {
        const user = await createUser("esewaok");
        const res = await request(app)
            .post("/api/v1/transactions/esewa/initiate")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 500 });

        expect(res.status).toBe(200);
        expect(res.body.data.paymentUrl).toBeTruthy();
        expect(res.body.data.fields.total_amount).toBe("500");
        expect(res.body.data.fields.transaction_uuid).toBeTruthy();
        expect(res.body.data.fields.signature).toBeTruthy();
        expect(res.body.data.fields.signed_field_names).toBe("total_amount,transaction_uuid,product_code");
    });

    it("rejects verifying a transaction that was never initiated", async () => {
        const user = await createUser("esewaverifybad");
        const res = await request(app)
            .post("/api/v1/transactions/esewa/verify")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ transactionUuid: "not-a-real-transaction" });
        expect(res.status).toBe(404);
    });

    it("rejects verifying someone else's payment", async () => {
        const owner = await createUser("esewaowner");
        const intruder = await createUser("esewaintruder");
        const initiate = await request(app)
            .post("/api/v1/transactions/esewa/initiate")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ amount: 300 });

        const res = await request(app)
            .post("/api/v1/transactions/esewa/verify")
            .set("Authorization", `Bearer ${intruder.token}`)
            .send({ transactionUuid: initiate.body.data.fields.transaction_uuid });
        expect(res.status).toBe(403);
    });

    it("credits the wallet once eSewa confirms COMPLETE, and never double-credits", async () => {
        const user = await createUser("esewasuccess");
        const initiate = await request(app)
            .post("/api/v1/transactions/esewa/initiate")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 300 });
        const transactionUuid = initiate.body.data.fields.transaction_uuid;

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: "COMPLETE" })
        }));

        const res = await request(app)
            .post("/api/v1/transactions/esewa/verify")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ transactionUuid });
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("complete");

        const whoami = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);
        expect(whoami.body.data.walletBalance).toBe(300);

        const again = await request(app)
            .post("/api/v1/transactions/esewa/verify")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ transactionUuid });
        expect(again.status).toBe(200);

        const whoamiAfter = await request(app).get("/api/v1/auth/whoami").set("Authorization", `Bearer ${user.token}`);
        expect(whoamiAfter.body.data.walletBalance).toBe(300); // not double-credited
    });

    it("rejects verification when eSewa reports a non-COMPLETE status", async () => {
        const user = await createUser("esewapending");
        const initiate = await request(app)
            .post("/api/v1/transactions/esewa/initiate")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 300 });
        const transactionUuid = initiate.body.data.fields.transaction_uuid;

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: "PENDING" })
        }));

        const res = await request(app)
            .post("/api/v1/transactions/esewa/verify")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ transactionUuid });
        expect(res.status).toBe(400);
    });

    it("returns a 502 when eSewa's status endpoint is unreachable", async () => {
        const user = await createUser("esewaunreachable");
        const initiate = await request(app)
            .post("/api/v1/transactions/esewa/initiate")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ amount: 300 });
        const transactionUuid = initiate.body.data.fields.transaction_uuid;

        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

        const res = await request(app)
            .post("/api/v1/transactions/esewa/verify")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ transactionUuid });
        expect(res.status).toBe(502);
    });
});

describe("AI Job Matcher", () => {
    it("rejects a query that's too short", async () => {
        const user = await createUser("matcherbad");
        const res = await request(app)
            .post("/api/v1/matcher")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ query: "hi" });
        expect(res.status).toBe(400);
    });

    it("rejects a request without auth", async () => {
        const res = await request(app).post("/api/v1/matcher").send({ query: "I need a GPU for training" });
        expect(res.status).toBe(401);
    });

    it("returns [] when there are no live devices to match against", async () => {
        const user = await createUser("matchernodevices");
        const res = await request(app)
            .post("/api/v1/matcher")
            .set("Authorization", `Bearer ${user.token}`)
            .send({ query: "I need a GPU for training" });
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(generateContentMock).not.toHaveBeenCalled();
    });

    it("ranks live devices using Gemini's response", async () => {
        const owner = await createUser("matcherowner");
        const buyer = await createUser("matcherbuyer");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({
                name: "Matcher GPU",
                type: "GPU",
                specs: { cpu: "Ryzen 9", ramGB: 32, gpu: "RTX 4090", storageGB: 1000 },
                hourlyRate: 12
            });
        const deviceId = created.body.data._id;
        await request(app)
            .put(`/api/v1/devices/${deviceId}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });

        generateContentMock.mockResolvedValue({
            text: JSON.stringify([{ deviceId, matchPercent: 92, explanation: "Great GPU fit" }])
        });

        const res = await request(app)
            .post("/api/v1/matcher")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ query: "I need a GPU for deep learning training" });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].matchPercent).toBe(92);
        expect(res.body.data[0].explanation).toBe("Great GPU fit");
    });

    it("returns a 502 when Gemini fails on every model/attempt", async () => {
        const owner = await createUser("matcherfailowner");
        const buyer = await createUser("matcherfailbuyer");
        const created = await request(app)
            .post("/api/v1/devices")
            .set("Authorization", `Bearer ${owner.token}`)
            .send({
                name: "Matcher GPU 2",
                type: "GPU",
                specs: { cpu: "Ryzen 9", ramGB: 32, gpu: "RTX 4090", storageGB: 1000 },
                hourlyRate: 12
            });
        await request(app)
            .put(`/api/v1/devices/${created.body.data._id}`)
            .set("Authorization", `Bearer ${owner.token}`)
            .send({ status: "live" });

        generateContentMock.mockRejectedValue(new Error("permanent failure"));

        const res = await request(app)
            .post("/api/v1/matcher")
            .set("Authorization", `Bearer ${buyer.token}`)
            .send({ query: "I need a GPU for deep learning training" });
        expect(res.status).toBe(502);
    });
});
