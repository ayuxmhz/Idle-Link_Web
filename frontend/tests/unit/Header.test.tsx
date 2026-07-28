import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: { profilePicture: null } }),
}));

const toggleMock = vi.fn();
vi.mock("@/components/SidebarContext", () => ({
    useSidebar: () => ({ toggle: toggleMock }),
}));

const listMyNotificationsMock = vi.fn();
const getUnreadCountMock = vi.fn();
const markNotificationAsReadMock = vi.fn();
const markAllNotificationsAsReadMock = vi.fn();
vi.mock("@/lib/api/notifications", () => ({
    listMyNotifications: (...args: unknown[]) => listMyNotificationsMock(...args),
    getUnreadCount: (...args: unknown[]) => getUnreadCountMock(...args),
    markNotificationAsRead: (...args: unknown[]) => markNotificationAsReadMock(...args),
    markAllNotificationsAsRead: (...args: unknown[]) => markAllNotificationsAsReadMock(...args),
}));

import Header from "@/components/dashboard/Header";

beforeEach(() => {
    vi.clearAllMocks();
    getUnreadCountMock.mockResolvedValue({ data: { count: 2 } });
    listMyNotificationsMock.mockResolvedValue({
        data: [
            { _id: "n1", type: "booking_created", message: "New booking", read: false, createdAt: new Date().toISOString() },
            { _id: "n2", type: "payment_received", message: "You got paid", read: true, createdAt: new Date(Date.now() - 90000000).toISOString() },
        ],
    });
});

describe("Header", () => {
    it("shows the unread count badge", async () => {
        render(<Header title="Wallet" />);
        expect(await screen.findByText("2")).toBeInTheDocument();
        expect(screen.getByText("Wallet")).toBeInTheDocument();
    });

    it("caps the badge at 9+", async () => {
        getUnreadCountMock.mockResolvedValue({ data: { count: 15 } });
        render(<Header />);
        expect(await screen.findByText("9+")).toBeInTheDocument();
    });

    it("opens the notification panel and lists notifications", async () => {
        render(<Header />);
        await userEvent.click(screen.getAllByRole("button")[1]);
        expect(await screen.findByText("New booking")).toBeInTheDocument();
        expect(screen.getByText("You got paid")).toBeInTheDocument();
    });

    it("marks a single unread notification as read on click", async () => {
        markNotificationAsReadMock.mockResolvedValue({ data: {} });
        render(<Header />);
        await userEvent.click(screen.getAllByRole("button")[1]);
        await screen.findByText("New booking");

        await userEvent.click(screen.getByText("New booking"));
        await waitFor(() => expect(markNotificationAsReadMock).toHaveBeenCalledWith("n1"));
    });

    it("marks all notifications as read", async () => {
        markAllNotificationsAsReadMock.mockResolvedValue({ data: {} });
        render(<Header />);
        await userEvent.click(screen.getAllByRole("button")[1]);
        await screen.findByText("New booking");

        await userEvent.click(screen.getByRole("button", { name: /Mark all read/ }));
        await waitFor(() => expect(markAllNotificationsAsReadMock).toHaveBeenCalled());
    });

    it("shows an empty state when there are no notifications", async () => {
        listMyNotificationsMock.mockResolvedValue({ data: [] });
        render(<Header />);
        await userEvent.click(screen.getAllByRole("button")[1]);
        expect(await screen.findByText("No notifications yet.")).toBeInTheDocument();
    });

    it("calls sidebar toggle on the mobile menu button", async () => {
        render(<Header />);
        const menuButtons = screen.getAllByRole("button");
        await userEvent.click(menuButtons[0]);
        expect(toggleMock).toHaveBeenCalled();
    });
});
