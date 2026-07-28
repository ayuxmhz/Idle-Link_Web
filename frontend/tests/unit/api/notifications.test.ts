import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import axiosInstance from "@/lib/api/axios-instance";
import {
    listMyNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/lib/api/notifications";

const mockedAxios = axiosInstance as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
};

beforeEach(() => vi.clearAllMocks());

describe("notifications api", () => {
    it("listMyNotifications returns data", async () => {
        mockedAxios.get.mockResolvedValue({ data: { data: [] } });
        expect(await listMyNotifications()).toEqual({ data: [] });
    });

    it("listMyNotifications throws on failure", async () => {
        mockedAxios.get.mockRejectedValue({});
        await expect(listMyNotifications()).rejects.toThrow("Failed to fetch notifications");
    });

    it("getUnreadCount returns data", async () => {
        mockedAxios.get.mockResolvedValue({ data: { success: true, data: { count: 3 } } });
        expect(await getUnreadCount()).toEqual({ success: true, data: { count: 3 } });
    });

    it("getUnreadCount throws on failure", async () => {
        mockedAxios.get.mockRejectedValue({});
        await expect(getUnreadCount()).rejects.toThrow("Failed to fetch unread count");
    });

    it("markNotificationAsRead patches and returns data", async () => {
        mockedAxios.patch.mockResolvedValue({ data: { data: { read: true } } });
        expect(await markNotificationAsRead("1")).toEqual({ data: { read: true } });
    });

    it("markNotificationAsRead throws on failure", async () => {
        mockedAxios.patch.mockRejectedValue({});
        await expect(markNotificationAsRead("1")).rejects.toThrow("Failed to mark notification as read");
    });

    it("markAllNotificationsAsRead posts and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        expect(await markAllNotificationsAsRead()).toEqual({ success: true });
    });

    it("markAllNotificationsAsRead throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({});
        await expect(markAllNotificationsAsRead()).rejects.toThrow("Failed to mark all notifications as read");
    });
});
