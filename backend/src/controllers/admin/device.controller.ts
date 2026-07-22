import { Request, Response } from "express";
import { DeviceService } from "../../services/device.service";
import { ApiResponseHelper } from "../../utils/apihelper.util";

const deviceService = new DeviceService();

export class AdminDeviceController {
    async getDevices(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await deviceService.listDevices(page, limit, {
                type: req.query.type as string | undefined,
                status: req.query.status as string | undefined,
                search: req.query.search as string | undefined
            });
            return ApiResponseHelper.success(res, result.data, "Devices fetched successfully", 200, result.meta);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteDevice(req: Request, res: Response) {
        try {
            await deviceService.adminDeleteDevice(req.params.id as string);
            return ApiResponseHelper.success(res, null, "Device deleted successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
