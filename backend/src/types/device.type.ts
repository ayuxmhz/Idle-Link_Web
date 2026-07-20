import { z } from "zod";

export const SpecsSchema = z.object({
    cpu: z.string().min(1, "CPU spec is required"),
    ramGB: z.number().positive("RAM must be greater than 0"),
    gpu: z.string().min(1, "GPU spec is required"),
    storageGB: z.number().positive("Storage must be greater than 0")
});
export type SpecsType = z.infer<typeof SpecsSchema>;

export const DeviceSchema = z.object({
    owner: z.string(),
    name: z.string().min(1, "Device name is required"),
    type: z.enum(["GPU", "CPU", "ML-Ready", "Gaming"]),
    specs: SpecsSchema,
    hourlyRate: z.number().positive("Hourly rate must be greater than 0"),
    status: z.enum(["live", "offline"]).default("offline"),
    uptimePercent: z.number().min(0).max(100).default(0)
});
export type DeviceType = z.infer<typeof DeviceSchema>;
