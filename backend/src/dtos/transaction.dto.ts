import { z } from "zod";

export const DepositDTO = z.object({
    amount: z.number().positive("Amount must be greater than 0")
});
export type DepositDTO = z.infer<typeof DepositDTO>;

export const WithdrawDTO = z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    destination: z.string().min(3, "Enter a valid eSewa ID or bank account number")
});
export type WithdrawDTO = z.infer<typeof WithdrawDTO>;
