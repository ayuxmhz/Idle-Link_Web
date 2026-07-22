import { NotificationModel, INotification } from "../models/notification.model";

export interface INotificationRepository {
    create(notification: Partial<INotification>): Promise<INotification>;
    getAllPaginated(userId: string, page: number, limit: number): Promise<{ data: INotification[], total: number }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<INotification | null>;
    markAllAsRead(userId: string): Promise<void>;
}

export class NotificationMongoRepository implements INotificationRepository {
    async create(notification: Partial<INotification>): Promise<INotification> {
        const created = await NotificationModel.create(notification);
        return created;
    }

    async getAllPaginated(userId: string, page: number, limit: number): Promise<{ data: INotification[], total: number }> {
        const query = { user: userId };
        const total = await NotificationModel.countDocuments(query);
        const data = await NotificationModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort("-createdAt");

        return { data, total };
    }

    async getUnreadCount(userId: string): Promise<number> {
        return NotificationModel.countDocuments({ user: userId, read: false });
    }

    async markAsRead(id: string, userId: string): Promise<INotification | null> {
        const updated = await NotificationModel.findOneAndUpdate(
            { _id: id, user: userId },
            { read: true },
            { returnDocument: "after" }
        );
        return updated;
    }

    async markAllAsRead(userId: string): Promise<void> {
        await NotificationModel.updateMany({ user: userId, read: false }, { read: true });
    }
}
