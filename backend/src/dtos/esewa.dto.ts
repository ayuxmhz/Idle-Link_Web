import { z } from "zod";

export const InitiateEsewaDTO = z.object({
    amount: z.number().positive("Amount must be greater than 0")
});
export type InitiateEsewaDTO = z.infer<typeof InitiateEsewaDTO>;

export const VerifyEsewaDTO = z.object({
    transactionUuid: z.string().min(1, "Transaction UUID is required")
});
export type VerifyEsewaDTO = z.infer<typeof VerifyEsewaDTO>;
