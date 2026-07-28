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

const listDevicesMock = vi.fn();
vi.mock("@/lib/api/devices", () => ({
    listDevices: (...args: unknown[]) => listDevicesMock(...args),
}));

const createBookingMock = vi.fn();
vi.mock("@/lib/api/bookings", () => ({
    createBooking: (...args: unknown[]) => createBookingMock(...args),
}));

import MarketplacePage from "@/app/dashboard/marketplace/page";

const sampleDevice = {
    _id: "d1",
    owner: "other-user",
    ownerUsername: "seller1",
    name: "RTX 4090 Rig",
    type: "GPU" as const,
    specs: { cpu: "Ryzen 9", ramGB: 32, gpu: "RTX 4090", storageGB: 1000 },
    hourlyRate: 15,
    status: "live" as const,
    uptimePercent: 100,
    hasActiveBooking: false,
    avgRating: 4.5,
    ratingCount: 3,
    createdAt: "",
    updatedAt: "",
};

beforeEach(() => {
    vi.clearAllMocks();
    listDevicesMock.mockResolvedValue({ data: [sampleDevice] });
});

describe("MarketplacePage", () => {
    it("lists live devices after the debounce", async () => {
        render(<MarketplacePage />);
        expect(await screen.findByText("RTX 4090 Rig")).toBeInTheDocument();
        expect(screen.getByText("@seller1")).toBeInTheDocument();
    });

    it("shows an empty state when no devices match", async () => {
        listDevicesMock.mockResolvedValue({ data: [] });
        render(<MarketplacePage />);
        expect(await screen.findByText(/No live devices match/)).toBeInTheDocument();
    });

    it("shows an error state when fetching devices fails", async () => {
        listDevicesMock.mockRejectedValue(new Error("Server down"));
        render(<MarketplacePage />);
        expect(await screen.findByText("Server down")).toBeInTheDocument();
    });

    it("marks the caller's own device instead of offering a book button", async () => {
        listDevicesMock.mockResolvedValue({ data: [{ ...sampleDevice, owner: "me" }] });
        render(<MarketplacePage />);
        expect(await screen.findByText("Your Device")).toBeInTheDocument();
    });

    it("books a device through the modal", async () => {
        createBookingMock.mockResolvedValue({ data: {} });
        render(<MarketplacePage />);
        await screen.findByText("RTX 4090 Rig");

        await userEvent.click(screen.getByRole("button", { name: "Book" }));
        await userEvent.type(screen.getByPlaceholderText("LLM Fine-tuning Task"), "Train a model");
        await userEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

        await waitFor(() => expect(createBookingMock).toHaveBeenCalledWith("d1", "Train a model", 1));
        expect(await screen.findByText(/Booked "RTX 4090 Rig" successfully/)).toBeInTheDocument();
    });
});
