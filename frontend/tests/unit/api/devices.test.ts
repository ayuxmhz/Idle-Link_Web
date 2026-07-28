import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

import axiosInstance from "@/lib/api/axios-instance";
import { listDevices, createDevice, updateDevice, deleteDevice } from "@/lib/api/devices";

const mockedAxios = axiosInstance as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("devices api", () => {
    it("listDevices returns response data on success", async () => {
        mockedAxios.get.mockResolvedValue({ data: { success: true, data: [] } });
        const result = await listDevices({ status: "live" });
        expect(result).toEqual({ success: true, data: [] });
        expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/devices", { params: { status: "live" } });
    });

    it("listDevices throws the server message on failure", async () => {
        mockedAxios.get.mockRejectedValue({ response: { data: { message: "boom" } } });
        await expect(listDevices()).rejects.toThrow("boom");
    });

    it("listDevices falls back to a default message when none is provided", async () => {
        mockedAxios.get.mockRejectedValue({});
        await expect(listDevices()).rejects.toThrow("Failed to fetch devices");
    });

    it("createDevice posts the payload and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true, data: { _id: "1" } } });
        const result = await createDevice({
            name: "GPU",
            type: "GPU",
            specs: { cpu: "x", ramGB: 8, gpu: "y", storageGB: 100 },
            hourlyRate: 5,
        });
        expect(result).toEqual({ success: true, data: { _id: "1" } });
    });

    it("createDevice throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "invalid" } } });
        await expect(
            createDevice({ name: "GPU", type: "GPU", specs: { cpu: "x", ramGB: 8, gpu: "y", storageGB: 100 }, hourlyRate: 5 })
        ).rejects.toThrow("invalid");
    });

    it("updateDevice puts the payload and returns data", async () => {
        mockedAxios.put.mockResolvedValue({ data: { success: true, data: { hourlyRate: 20 } } });
        const result = await updateDevice("1", { hourlyRate: 20 });
        expect(result).toEqual({ success: true, data: { hourlyRate: 20 } });
        expect(mockedAxios.put).toHaveBeenCalledWith("/api/v1/devices/1", { hourlyRate: 20 });
    });

    it("updateDevice throws on failure", async () => {
        mockedAxios.put.mockRejectedValue({ response: { data: { message: "not owner" } } });
        await expect(updateDevice("1", { hourlyRate: 20 })).rejects.toThrow("not owner");
    });

    it("deleteDevice deletes and returns data", async () => {
        mockedAxios.delete.mockResolvedValue({ data: { success: true } });
        const result = await deleteDevice("1");
        expect(result).toEqual({ success: true });
        expect(mockedAxios.delete).toHaveBeenCalledWith("/api/v1/devices/1");
    });

    it("deleteDevice throws on failure", async () => {
        mockedAxios.delete.mockRejectedValue({ response: { data: { message: "active booking" } } });
        await expect(deleteDevice("1")).rejects.toThrow("active booking");
    });
});
