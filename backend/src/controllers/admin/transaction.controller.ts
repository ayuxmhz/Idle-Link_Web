import { Request, Response } from "express";
import { TransactionService } from "../../services/transaction.service";
import { ApiResponseHelper } from "../../utils/apihelper.util";

const transactionService = new TransactionService();

export class AdminTransactionController {
    async getTransactions(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await transactionService.adminListAll(page, limit, {
                type: req.query.type as string | undefined
            });
            return ApiResponseHelper.success(res, result.data, "Transactions fetched successfully", 200, result.meta);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
