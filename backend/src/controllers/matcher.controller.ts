import { Request, Response } from "express";
import { z } from "zod";
import { MatcherService } from "../services/matcher.service";
import { MatchQueryDTO } from "../dtos/matcher.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const matcherService = new MatcherService();

export class MatcherController {
    async findMatches(req: Request, res: Response) {
        try {
            const parsed = MatchQueryDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const matches = await matcherService.findMatches(parsed.data);
            return ApiResponseHelper.success(res, matches, "Matches found successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
