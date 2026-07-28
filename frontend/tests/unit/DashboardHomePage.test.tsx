import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let mockUser: Record<string, unknown> = { _id: "me" };
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: mockUser }),
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

const listMyTransactionsMock = vi.fn();
const getSummaryMock = vi.fn();
vi.mock("@/lib/api/transactions", () => ({
    listMyTransactions: (...args: unknown[]) => listMyTransactionsMock(...args),
    getSummary: (...args: unknown[]) => getSummaryMock(...args),
}));

import DashboardPage from "@/app/dashboard/page";

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { _id: "me" };
    listMyBookingsMock.mockResolvedValue({ success: true, data: [] });
    listDevicesMock.mockResolvedValue({ success: true, data: [] });
    listMyTransactionsMock.mockResolvedValue({ success: true, data: [] });
    getSummaryMock.mockResolvedValue({ success: true, data: { todayTotal: 0, weekTotal: 0, dailyBreakdown: [] } });
});

describe("DashboardPage (home)", () => {
    it("renders the empty-state dashboard when there's no activity", async () => {
        render(<DashboardPage />);
        expect(await screen.findByText("No active jobs right now")).toBeInTheDocument();
        expect(screen.getByText("Add Device")).toBeInTheDocument();
    });

    it("shows the active job and recent transactions when present", async () => {
        listMyBookingsMock.mockResolvedValue({
            success: true,
            data: [{ taskName: "Train model", buyerUsername: "bob", progress: 50, consoleLines: [] }],
        });
        listMyTransactionsMock.mockResolvedValue({
            success: true,
            data: [{ type: "deposit", amount: 500, description: "Deposit via eSewa" }],
        });

        render(<DashboardPage />);
        expect(await screen.findByText("Train model")).toBeInTheDocument();
        expect(screen.getByText("Deposit")).toBeInTheDocument();
    });

    it("shows dashes when there's no user yet", () => {
        mockUser = null;
        render(<DashboardPage />);
        expect(screen.getByText("No active jobs right now")).toBeInTheDocument();
        expect(listMyBookingsMock).not.toHaveBeenCalled();
    });
});
