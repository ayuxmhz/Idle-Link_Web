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

const findMatchingDevicesMock = vi.fn();
vi.mock("@/lib/api/matcher", () => ({
    findMatchingDevices: (...args: unknown[]) => findMatchingDevicesMock(...args),
}));

const createBookingMock = vi.fn();
vi.mock("@/lib/api/bookings", () => ({
    createBooking: (...args: unknown[]) => createBookingMock(...args),
}));

import MatcherPage from "@/app/dashboard/matcher/page";

const matchedDevice = {
    _id: "d1",
    owner: "other",
    name: "RTX 4090 Rig",
    type: "GPU" as const,
    specs: { cpu: "Ryzen 9", ramGB: 32, gpu: "RTX 4090", storageGB: 1000 },
    hourlyRate: 15,
    status: "live" as const,
    uptimePercent: 100,
    createdAt: "",
    updatedAt: "",
    matchPercent: 92,
    explanation: "Great fit for training",
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("MatcherPage", () => {
    it("does not search on an empty query", async () => {
        render(<MatcherPage />);
        expect(screen.getByRole("button", { name: /Find Devices/ })).toBeDisabled();
        expect(findMatchingDevicesMock).not.toHaveBeenCalled();
    });

    it("fills the query from an example prompt and searches", async () => {
        findMatchingDevicesMock.mockResolvedValue({ data: [matchedDevice] });
        render(<MatcherPage />);

        await userEvent.click(screen.getByText(/fine-tune a small language model/));
        await userEvent.click(screen.getByRole("button", { name: /Find Devices/ }));

        await waitFor(() => expect(findMatchingDevicesMock).toHaveBeenCalled());
        expect(await screen.findByText("RTX 4090 Rig")).toBeInTheDocument();
        expect(screen.getByText("92% match")).toBeInTheDocument();
    });

    it("shows an empty state when nothing matches", async () => {
        findMatchingDevicesMock.mockResolvedValue({ data: [] });
        render(<MatcherPage />);

        await userEvent.type(screen.getByPlaceholderText(/budget-friendly/), "obscure task");
        await userEvent.click(screen.getByRole("button", { name: /Find Devices/ }));

        expect(await screen.findByText(/No live devices matched/)).toBeInTheDocument();
    });

    it("shows an error message when the search fails", async () => {
        findMatchingDevicesMock.mockRejectedValue(new Error("AI Matcher is not configured"));
        render(<MatcherPage />);

        await userEvent.type(screen.getByPlaceholderText(/budget-friendly/), "obscure task");
        await userEvent.click(screen.getByRole("button", { name: /Find Devices/ }));

        expect(await screen.findByText("AI Matcher is not configured")).toBeInTheDocument();
    });

    it("books a matched device", async () => {
        findMatchingDevicesMock.mockResolvedValue({ data: [matchedDevice] });
        createBookingMock.mockResolvedValue({ data: {} });
        render(<MatcherPage />);

        await userEvent.type(screen.getByPlaceholderText(/budget-friendly/), "GPU for training");
        await userEvent.click(screen.getByRole("button", { name: /Find Devices/ }));
        await screen.findByText("RTX 4090 Rig");

        await userEvent.click(screen.getByRole("button", { name: "Book" }));
        await userEvent.type(screen.getByPlaceholderText("LLM Fine-tuning Task"), "Train a model");
        await userEvent.click(screen.getByRole("button", { name: "Confirm Booking" }));

        await waitFor(() => expect(createBookingMock).toHaveBeenCalledWith("d1", "Train a model", 1));
        expect(await screen.findByText(/Booked "RTX 4090 Rig" successfully/)).toBeInTheDocument();
    });
});
