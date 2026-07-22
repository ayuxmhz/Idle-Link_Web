import { z } from "zod";

export const CreateBookingDTO = z.object({
    deviceId: z.string().min(1, "Device is required"),
    taskName: z.string().min(1, "Task name is required"),
    estimatedHours: z.number().positive("Estimated hours must be greater than 0")
});
export type CreateBookingDTO = z.infer<typeof CreateBookingDTO>;

export const UpdateBookingStatusDTO = z.discriminatedUnion("status", [
    z.object({
        status: z.literal("cancelled"),
        reason: z.string().min(1, "Please provide a reason for cancelling").max(300, "Reason must be 300 characters or fewer")
    }),
    z.object({
        status: z.literal("completed")
    })
]);
export type UpdateBookingStatusDTO = z.infer<typeof UpdateBookingStatusDTO>;
