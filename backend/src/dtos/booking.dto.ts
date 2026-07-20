import { z } from "zod";

export const CreateBookingDTO = z.object({
    deviceId: z.string().min(1, "Device is required"),
    taskName: z.string().min(1, "Task name is required"),
    estimatedHours: z.number().positive("Estimated hours must be greater than 0")
});
export type CreateBookingDTO = z.infer<typeof CreateBookingDTO>;

export const UpdateBookingStatusDTO = z.object({
    status: z.enum(["cancelled", "completed"])
});
export type UpdateBookingStatusDTO = z.infer<typeof UpdateBookingStatusDTO>;
