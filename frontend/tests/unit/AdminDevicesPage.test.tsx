import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios", async (importOriginal) => {
    const actual = await importOriginal<typeof import("axios")>();
    return {
        ...actual,
        default: { ...actual.default, get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
    };
});

import AdminDevicesPage from "@/app/admin/devices/page";

const sampleDevice = {
    _id: "d1",
    name: "GPU Rig",
    type: "GPU",
    hourlyRate: 15,
    status: "live" as const,
    uptimePercent: 99,
    ownerUsername: "seller1",
    createdAt: new Date().toISOString(),
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [sampleDevice], meta: { total: 1, totalPages: 1 } } });
});

describe("AdminDevicesPage", () => {
    it("lists devices across all users", async () => {
        render(<AdminDevicesPage />);
        expect(await screen.findByText("GPU Rig")).toBeInTheDocument();
        expect(screen.getByText("@seller1")).toBeInTheDocument();
    });

    it("shows an empty state when there are no devices", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: [], meta: { total: 0, totalPages: 1 } } });
        render(<AdminDevicesPage />);
        expect(await screen.findByText(/No devices found/)).toBeInTheDocument();
    });

    it("shows an error state when fetching fails", async () => {
        vi.mocked(axios.get).mockRejectedValue({ response: { data: { message: "Forbidden" } } });
        render(<AdminDevicesPage />);
        expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    });

    it("deletes a device after confirming", async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: { success: true } });
        render(<AdminDevicesPage />);
        await screen.findByText("GPU Rig");

        await userEvent.click(screen.getByTitle("Delete Device"));
        expect(await screen.findByText(/Are you sure you want to delete "GPU Rig"/)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        await waitFor(() => expect(axios.delete).toHaveBeenCalledWith("/api/v1/admin/devices/d1", expect.anything()));
    });

    it("re-fetches when the type filter changes", async () => {
        render(<AdminDevicesPage />);
        await screen.findByText("GPU Rig");

        await userEvent.selectOptions(screen.getByDisplayValue("All Types"), "CPU");
        await waitFor(() =>
            expect(axios.get).toHaveBeenLastCalledWith(
                "/api/v1/admin/devices",
                expect.objectContaining({ params: expect.objectContaining({ type: "CPU" }) })
            )
        );
    });
});
