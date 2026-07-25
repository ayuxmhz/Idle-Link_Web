import { Request, Response } from "express";
import { z } from "zod";
import { DeviceService } from "../services/device.service";
import { CreateDeviceDTO, UpdateDeviceDTO } from "../dtos/device.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { buildDeviceLinks } from "../utils/hateoas.util";

const deviceService = new DeviceService();

export class DeviceController {
    async createDevice(req: Request, res: Response) {
        try {
            const parsed = CreateDeviceDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const device = await deviceService.createDevice(user._id.toString(), parsed.data);
            const data = { ...device.toObject(), _links: buildDeviceLinks(device, user._id.toString()) };
            return ApiResponseHelper.success(res, data, "Device created successfully", 201);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async listDevices(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const user = req.user as any;

            const ownerQuery = req.query.owner as string | undefined;
            const owner = ownerQuery === "me" ? user._id.toString() : ownerQuery;

            const result = await deviceService.listDevices(page, limit, {
                owner,
                type: req.query.type as string | undefined,
                status: req.query.status as string | undefined,
                sort: req.query.sort as string | undefined,
                search: req.query.search as string | undefined
            });
            const data = result.data.map((device: any) => ({
                ...device,
                _links: buildDeviceLinks(device, user._id.toString())
            }));
            return ApiResponseHelper.success(res, data, "Devices fetched successfully", 200, result.meta);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getDevice(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const device = await deviceService.getDeviceById(req.params.id as string);
            const data = { ...device.toObject(), _links: buildDeviceLinks(device, user?._id?.toString()) };
            return ApiResponseHelper.success(res, data, "Device fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async updateDevice(req: Request, res: Response) {
        try {
            const parsed = UpdateDeviceDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = req.user as any;
            const device = await deviceService.updateDevice(req.params.id as string, user._id.toString(), parsed.data);
            const data = { ...device.toObject(), _links: buildDeviceLinks(device, user._id.toString()) };
            return ApiResponseHelper.success(res, data, "Device updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async deleteDevice(req: Request, res: Response) {
        try {
            const user = req.user as any;
            await deviceService.deleteDevice(req.params.id as string, user._id.toString());
            return ApiResponseHelper.success(res, null, "Device deleted successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
