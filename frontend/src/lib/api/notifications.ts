import axiosInstance from "./axios-instance";
import { AxiosError } from "axios";

export interface Notification {
    _id: string;
    user: string;
    type: "booking_created" | "booking_completed" | "payment_received" | "wallet_deposit" | "wallet_withdrawal";
    message: string;
    read: boolean;
    createdAt: string;
}

const extractMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || fallback);
};

export const listMyNotifications = async (params: { page?: number; limit?: number } = {}) => {
    try {
        const response = await axiosInstance.get("/api/v1/notifications", { params });
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to fetch notifications");
    }
};

export const getUnreadCount = async () => {
    try {
        const response = await axiosInstance.get("/api/v1/notifications/unread-count");
        return response.data as { success: boolean; data: { count: number } };
    } catch (error) {
        return extractMessage(error, "Failed to fetch unread count");
    }
};

export const markNotificationAsRead = async (id: string) => {
    try {
        const response = await axiosInstance.patch(`/api/v1/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to mark notification as read");
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await axiosInstance.post("/api/v1/notifications/mark-all-read");
        return response.data;
    } catch (error) {
        return extractMessage(error, "Failed to mark all notifications as read");
    }
};
