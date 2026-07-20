import { z } from "zod";

export const TransactionSchema = z.object({
    user: z.string(),
    booking: z.string().optional(),
    type: z.enum(["job_payment", "commission", "deposit", "withdrawal"]),
    amount: z.number(), // signed: positive = credit, negative = debit
    description: z.string().min(1, "Description is required")
});
export type TransactionType = z.infer<typeof TransactionSchema>;
