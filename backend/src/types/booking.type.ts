import { z } from "zod";

export const BookingSchema = z.object({
    device: z.string(),
    seller: z.string(),
    buyer: z.string(),
    taskName: z.string().min(1, "Task name is required"),
    status: z.enum(["running", "completed", "cancelled"]).default("running"),
    pricePerHour: z.number().positive(),
    startedAt: z.date(),
    estimatedCompletionAt: z.date(),
    totalCost: z.number().positive(),
    cancelReason: z.string().optional()
});
export type BookingType = z.infer<typeof BookingSchema>;
