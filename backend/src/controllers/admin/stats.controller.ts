import { Request, Response } from "express";
import { AdminStatsService } from "../../services/admin-stats.service";
import { ApiResponseHelper } from "../../utils/apihelper.util";

const adminStatsService = new AdminStatsService();

export class AdminStatsController {
    async getOverview(req: Request, res: Response) {
        try {
            const rangeParam = req.query.range as string;
            const range = rangeParam === "day" || rangeParam === "month" ? rangeParam : "week";
            const overview = await adminStatsService.getOverview(range);
            return ApiResponseHelper.success(res, overview, "Overview fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
