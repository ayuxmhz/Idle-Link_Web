import { NotificationMongoRepository } from "../repositories/notification.repository";
import { INotification } from "../models/notification.model";
import { HttpException } from "../exceptions/http-exception";

const notificationRepository = new NotificationMongoRepository();

export type NotificationType = INotification["type"];

export class NotificationService {
    // Internal helper used by other services (Booking/Transaction) to raise a
    // notification — never called directly from a controller/route.
    async notify(userId: string, type: NotificationType, message: string): Promise<void> {
        await notificationRepository.create({ user: userId as any, type, message, read: false });
    }

    async listMine(userId: string, page: number, limit: number) {
        const { data, total } = await notificationRepository.getAllPaginated(userId, page, limit);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getUnreadCount(userId: string): Promise<number> {
        return notificationRepository.getUnreadCount(userId);
    }

    async markAsRead(id: string, userId: string): Promise<INotification> {
        const updated = await notificationRepository.markAsRead(id, userId);
        if (!updated) {
            throw new HttpException(404, "Notification not found");
        }
        return updated;
    }

    async markAllAsRead(userId: string): Promise<void> {
        await notificationRepository.markAllAsRead(userId);
    }
}
