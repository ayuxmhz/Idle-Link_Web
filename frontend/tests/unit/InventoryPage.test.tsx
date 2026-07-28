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
const createDeviceMock = vi.fn();
const updateDeviceMock = vi.fn();
const deleteDeviceMock = vi.fn();
vi.mock("@/lib/api/devices", () => ({
    listDevices: (...args: unknown[]) => listDevicesMock(...args),
    createDevice: (...args: unknown[]) => createDeviceMock(...args),
    updateDevice: (...args: unknown[]) => updateDeviceMock(...args),
    deleteDevice: (...args: unknown[]) => deleteDeviceMock(...args),
}));

import InventoryPage from "@/app/dashboard/inventory/page";

const myDevice = {
    _id: "d1",
    owner: "me",
    name: "My GPU Rig",
    type: "GPU" as const,
    specs: { cpu: "Ryzen 9", ramGB: 32, gpu: "RTX 4090", storageGB: 1000 },
    hourlyRate: 15,
    status: "offline" as const,
    uptimePercent: 98,
    createdAt: "",
    updatedAt: "",
};

beforeEach(() => {
    vi.clearAllMocks();
    listDevicesMock.mockResolvedValue({ data: [myDevice] });
});

describe("InventoryPage", () => {
    it("lists the user's own devices", async () => {
        render(<InventoryPage />);
        expect(await screen.findByText("My GPU Rig")).toBeInTheDocument();
        expect(listDevicesMock).toHaveBeenCalledWith({ owner: "me" });
    });

    it("shows an empty state when the user has no devices", async () => {
        listDevicesMock.mockResolvedValue({ data: [] });
        render(<InventoryPage />);
        expect(await screen.findByText(/haven't listed any devices/)).toBeInTheDocument();
    });

    it("shows an error state when fetching fails", async () => {
        listDevicesMock.mockRejectedValue(new Error("Server down"));
        render(<InventoryPage />);
        expect(await screen.findByText("Server down")).toBeInTheDocument();
    });

    it("creates a new device via the Add Device form", async () => {
        createDeviceMock.mockResolvedValue({ data: {} });
        const { container } = render(<InventoryPage />);
        await screen.findByText("My GPU Rig");

        await userEvent.click(screen.getByRole("button", { name: "Add Device" }));
        await userEvent.type(screen.getByPlaceholderText("RTX 4090 Rig"), "New GPU");
        await userEvent.type(screen.getByPlaceholderText("AMD Ryzen 9"), "Intel i9");
        await userEvent.type(screen.getByPlaceholderText("RTX 4090"), "RTX 3090");
        await userEvent.type(container.querySelector('input[name="hourlyRate"]')!, "10");
        await userEvent.type(screen.getByPlaceholderText("16GB"), "32GB");
        await userEvent.type(screen.getByPlaceholderText("512GB"), "500GB");
        await userEvent.click(screen.getByRole("button", { name: "Save Device" }));

        await waitFor(() => expect(createDeviceMock).toHaveBeenCalled());
    });

    it("toggles a device between live and offline", async () => {
        updateDeviceMock.mockResolvedValue({ data: {} });
        render(<InventoryPage />);
        await screen.findByText("My GPU Rig");

        await userEvent.click(screen.getByRole("button", { name: "Offline" }));
        await waitFor(() => expect(updateDeviceMock).toHaveBeenCalledWith("d1", { status: "live" }));
    });

    it("deletes a device after confirming", async () => {
        deleteDeviceMock.mockResolvedValue({ data: {} });
        render(<InventoryPage />);
        await screen.findByText("My GPU Rig");

        await userEvent.click(screen.getByTitle("Delete"));
        expect(await screen.findByText(/Are you sure you want to delete/)).toBeInTheDocument();
        const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
        await userEvent.click(deleteButtons[deleteButtons.length - 1]);

        await waitFor(() => expect(deleteDeviceMock).toHaveBeenCalledWith("d1"));
    });
});
