import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
const cancelBookingMock = vi.fn();
vi.mock("@/lib/api/bookings", () => ({
    listMyBookings: (...args: unknown[]) => listMyBookingsMock(...args),
    cancelBooking: (...args: unknown[]) => cancelBookingMock(...args),
}));

const createRatingMock = vi.fn();
vi.mock("@/lib/api/ratings", () => ({
    createRating: (...args: unknown[]) => createRatingMock(...args),
}));

import BookingsPage from "@/app/dashboard/bookings/page";

const runningBooking = {
    _id: "b1",
    device: "d1",
    seller: "s1",
    buyer: "me",
    taskName: "Train model",
    status: "running" as const,
    pricePerHour: 10,
    startedAt: "",
    estimatedCompletionAt: "",
    totalCost: 10,
    createdAt: new Date().toISOString(),
    progress: 40,
};

const completedBooking = {
    _id: "b2",
    device: "d1",
    seller: "s1",
    buyer: "me",
    taskName: "Old job",
    status: "completed" as const,
    pricePerHour: 10,
    startedAt: "",
    estimatedCompletionAt: "",
    totalCost: 10,
    createdAt: new Date().toISOString(),
    rating: null,
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("BookingsPage", () => {
    it("shows an empty state when there are no bookings", async () => {
        listMyBookingsMock.mockResolvedValue({ data: [] });
        render(<BookingsPage />);
        expect(await screen.findByText(/No bookings made yet/)).toBeInTheDocument();
    });

    it("shows an error state when fetching fails", async () => {
        listMyBookingsMock.mockRejectedValue(new Error("Network error"));
        render(<BookingsPage />);
        expect(await screen.findByText("Network error")).toBeInTheDocument();
    });

    it("renders active and history sections", async () => {
        listMyBookingsMock.mockResolvedValue({ data: [runningBooking, completedBooking] });
        render(<BookingsPage />);
        expect(await screen.findByText("Train model")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
        expect(screen.getByText("History")).toBeInTheDocument();
        expect(screen.getByText("Old job")).toBeInTheDocument();
    });

    it("cancels a running booking with a reason", async () => {
        listMyBookingsMock.mockResolvedValue({ data: [runningBooking] });
        cancelBookingMock.mockResolvedValue({ data: {} });
        render(<BookingsPage />);
        await screen.findByText("Train model");

        await userEvent.click(screen.getByRole("button", { name: /^Cancel$/ }));
        await userEvent.type(screen.getByRole("textbox"), "Changed my mind");
        await userEvent.click(screen.getByRole("button", { name: "Cancel Booking" }));

        await waitFor(() => expect(cancelBookingMock).toHaveBeenCalledWith("b1", "Changed my mind"));
    });

    it("rates a completed booking", async () => {
        listMyBookingsMock.mockResolvedValue({ data: [completedBooking] });
        createRatingMock.mockResolvedValue({ data: {} });
        render(<BookingsPage />);
        await screen.findByText("Old job");

        await userEvent.click(screen.getByRole("button", { name: "Rate" }));
        await userEvent.click(screen.getByRole("button", { name: "4 stars" }));
        await userEvent.click(screen.getByRole("button", { name: "Submit Rating" }));

        await waitFor(() => expect(createRatingMock).toHaveBeenCalledWith("b2", 4, undefined));
    });

    it("switches between buyer and seller views", async () => {
        listMyBookingsMock.mockResolvedValue({ data: [] });
        render(<BookingsPage />);
        await screen.findByText(/No bookings made yet/);

        await userEvent.click(screen.getByRole("button", { name: "As Seller" }));
        await waitFor(() => expect(listMyBookingsMock).toHaveBeenLastCalledWith({ role: "seller", limit: 50 }));
        expect(await screen.findByText(/No bookings received yet/)).toBeInTheDocument();
    });
});
