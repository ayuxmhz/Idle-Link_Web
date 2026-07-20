import { z } from "zod";

export const BookingSchema = z.object({
    device: z.string(),
    seller: z.string(),
    buyer: z.string(),
    taskName: z.string().min(1, "Task name is required"),
    status: z.enum(["pending", "running", "completed", "cancelled"]).default("pending"),
    pricePerHour: z.number().positive(),
    startedAt: z.date(),
    estimatedCompletionAt: z.date(),
    totalCost: z.number().positive()
});
export type BookingType = z.infer<typeof BookingSchema>;
