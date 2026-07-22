import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

const notificationService = new NotificationService();

export class NotificationController {
    async listMine(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const user = req.user as any;

            const result = await notificationService.listMine(user._id.toString(), page, limit);
            return ApiResponseHelper.success(res, result.data, "Notifications fetched successfully", 200, result.meta);
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async getUnreadCount(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const count = await notificationService.getUnreadCount(user._id.toString());
            return ApiResponseHelper.success(res, { count }, "Unread count fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const notification = await notificationService.markAsRead(req.params.id as string, user._id.toString());
            return ApiResponseHelper.success(res, notification, "Notification marked as read");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            const user = req.user as any;
            await notificationService.markAllAsRead(user._id.toString());
            return ApiResponseHelper.success(res, null, "All notifications marked as read");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }
}
