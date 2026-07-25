import { Request, Response } from "express";
import { z } from "zod";
import { EsewaService } from "../services/esewa.service";
import { InitiateEsewaDTO, VerifyEsewaDTO } from "../dtos/esewa.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";

const esewaService = new EsewaService();

export class EsewaController {
    async initiate(req: Request, res: Response) {
        try {
            const parsed = InitiateEsewaDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const result = await esewaService.initiate(user._id.toString(), parsed.data);
            return ApiResponseHelper.success(res, result, "Payment initiated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async verify(req: Request, res: Response) {
        try {
            const parsed = VerifyEsewaDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const result = await esewaService.verify(user._id.toString(), parsed.data.transactionUuid);
            return ApiResponseHelper.success(res, result, "Payment verified successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
