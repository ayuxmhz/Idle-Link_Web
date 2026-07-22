import { Request, Response } from "express";
import { z } from "zod";
import { RatingService } from "../services/rating.service";
import { CreateRatingDTO } from "../dtos/rating.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const ratingService = new RatingService();

export class RatingController {
    async createRating(req: Request, res: Response) {
        try {
            const parsed = CreateRatingDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const rating = await ratingService.createRating(user._id.toString(), parsed.data);
            return ApiResponseHelper.success(res, rating, "Rating submitted successfully", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getDeviceRatings(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await ratingService.getDeviceRatings(req.params.deviceId as string, page, limit);
            return ApiResponseHelper.success(
                res,
                { ratings: result.data, summary: result.summary },
                "Ratings fetched successfully",
                200,
                result.meta
            );
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
