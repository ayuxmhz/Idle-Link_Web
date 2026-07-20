import { z } from "zod";
import { DeviceSchema, SpecsSchema } from "../types/device.type";

export const CreateDeviceDTO = DeviceSchema.pick({
    name: true,
    type: true,
    specs: true,
    hourlyRate: true
});
export type CreateDeviceDTO = z.infer<typeof CreateDeviceDTO>;

export const UpdateDeviceDTO = z.object({
    name: z.string().min(1, "Device name is required").optional(),
    hourlyRate: z.number().positive("Hourly rate must be greater than 0").optional(),
    status: z.enum(["live", "offline"]).optional(),
    specs: SpecsSchema.partial().optional()
});
export type UpdateDeviceDTO = z.infer<typeof UpdateDeviceDTO>;
