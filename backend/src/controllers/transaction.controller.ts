import { Request, Response } from "express";
import { z } from "zod";
import { TransactionService } from "../services/transaction.service";
import { DepositDTO, WithdrawDTO } from "../dtos/transaction.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const transactionService = new TransactionService();

export class TransactionController {
    async listMine(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const user = req.user as any;

            const result = await transactionService.listMine(user._id.toString(), page, limit);
            return ApiResponseHelper.success(res, result.data, "Transactions fetched successfully", 200, result.meta);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getSummary(req: Request, res: Response) {
        try {
            const user = req.user as any;

            const summary = await transactionService.getSummary(user._id.toString());
            return ApiResponseHelper.success(res, summary, "Summary fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deposit(req: Request, res: Response) {
        try {
            const parsed = DepositDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const transaction = await transactionService.deposit(user._id.toString(), parsed.data);
            return ApiResponseHelper.success(res, transaction, "Deposit successful", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async withdraw(req: Request, res: Response) {
        try {
            const parsed = WithdrawDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const transaction = await transactionService.withdraw(user._id.toString(), parsed.data);
            return ApiResponseHelper.success(res, transaction, "Withdrawal successful", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
