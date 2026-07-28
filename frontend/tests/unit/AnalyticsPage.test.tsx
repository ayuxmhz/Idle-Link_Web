import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: { _id: "me" } }),
}));

vi.mock("@/components/SidebarContext", () => ({
    useSidebar: () => ({ toggle: vi.fn(), isOpen: false }),
}));

vi.mock("@/lib/api/notifications", () => ({
    listMyNotifications: vi.fn().mockResolvedValue({ data: [] }),
    getUnreadCount: vi.fn().mockResolvedValue({ data: { count: 0 } }),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
}));

const listMyBookingsMock = vi.fn();
vi.mock("@/lib/api/bookings", () => ({
    listMyBookings: (...args: unknown[]) => listMyBookingsMock(...args),
}));

const listDevicesMock = vi.fn();
vi.mock("@/lib/api/devices", () => ({
    listDevices: (...args: unknown[]) => listDevicesMock(...args),
}));

const getSummaryMock = vi.fn();
vi.mock("@/lib/api/transactions", () => ({
    getSummary: (...args: unknown[]) => getSummaryMock(...args),
}));

import AnalyticsPage from "@/app/dashboard/analytics/page";

beforeEach(() => {
    vi.clearAllMocks();
});

describe("AnalyticsPage", () => {
    it("shows the empty state when there's no data yet", async () => {
        listMyBookingsMock.mockResolvedValue({ data: [] });
        listDevicesMock.mockResolvedValue({ data: [] });
        getSummaryMock.mockResolvedValue({ data: { todayTotal: 0, weekTotal: 0, dailyBreakdown: [] } });

        render(<AnalyticsPage />);
        expect(await screen.findByText("No bookings yet.")).toBeInTheDocument();
        expect(screen.getByText(/haven't listed any devices/)).toBeInTheDocument();
    });

    it("computes totals from seller/buyer bookings and device stats", async () => {
        listMyBookingsMock.mockImplementation(({ role }: { role: string }) =>
            Promise.resolve({
                data:
                    role === "seller"
                        ? [{ _id: "b1", device: "d1", status: "completed", totalCost: 100, createdAt: "" }]
                        : [{ _id: "b2", device: "d2", status: "running", totalCost: 50, createdAt: "" }],
            })
        );
        listDevicesMock.mockResolvedValue({
            data: [{ _id: "d1", name: "GPU Rig", type: "GPU", uptimePercent: 90 }],
        });
        getSummaryMock.mockResolvedValue({ data: { todayTotal: 0, weekTotal: 0, dailyBreakdown: [] } });

        render(<AnalyticsPage />);
        expect((await screen.findAllByText("NPR 85")).length).toBeGreaterThan(0); // 85% of 100
        expect(screen.getByText("NPR 50")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument(); // total bookings
        expect(screen.getByText("90.0%")).toBeInTheDocument();
    });

    it("shows an error state when loading analytics fails", async () => {
        listMyBookingsMock.mockRejectedValue(new Error("Failed to load"));
        listDevicesMock.mockResolvedValue({ data: [] });
        getSummaryMock.mockResolvedValue({ data: { todayTotal: 0, weekTotal: 0, dailyBreakdown: [] } });

        render(<AnalyticsPage />);
        expect(await screen.findByText("Failed to load")).toBeInTheDocument();
    });
});
