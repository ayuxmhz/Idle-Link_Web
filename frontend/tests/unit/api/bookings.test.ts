import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

import axiosInstance from "@/lib/api/axios-instance";
import { listMyBookings, getBooking, createBooking, cancelBooking, completeBooking } from "@/lib/api/bookings";

const mockedAxios = axiosInstance as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
};

beforeEach(() => vi.clearAllMocks());

describe("bookings api", () => {
    it("listMyBookings returns data", async () => {
        mockedAxios.get.mockResolvedValue({ data: { data: [] } });
        expect(await listMyBookings({ role: "buyer" })).toEqual({ data: [] });
    });

    it("listMyBookings throws on failure", async () => {
        mockedAxios.get.mockRejectedValue({ response: { data: { message: "err" } } });
        await expect(listMyBookings()).rejects.toThrow("err");
    });

    it("getBooking returns data", async () => {
        mockedAxios.get.mockResolvedValue({ data: { data: { _id: "1" } } });
        expect(await getBooking("1")).toEqual({ data: { _id: "1" } });
    });

    it("getBooking throws on failure", async () => {
        mockedAxios.get.mockRejectedValue({});
        await expect(getBooking("1")).rejects.toThrow("Failed to fetch booking");
    });

    it("createBooking posts and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { data: { _id: "1" } } });
        const result = await createBooking("dev1", "task", 2);
        expect(result).toEqual({ data: { _id: "1" } });
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/bookings", { deviceId: "dev1", taskName: "task", estimatedHours: 2 });
    });

    it("createBooking throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "insufficient" } } });
        await expect(createBooking("dev1", "task", 2)).rejects.toThrow("insufficient");
    });

    it("cancelBooking patches with cancelled status and reason", async () => {
        mockedAxios.patch.mockResolvedValue({ data: { data: { status: "cancelled" } } });
        const result = await cancelBooking("1", "changed mind");
        expect(result).toEqual({ data: { status: "cancelled" } });
        expect(mockedAxios.patch).toHaveBeenCalledWith("/api/v1/bookings/1", { status: "cancelled", reason: "changed mind" });
    });

    it("cancelBooking throws on failure", async () => {
        mockedAxios.patch.mockRejectedValue({});
        await expect(cancelBooking("1", "reason")).rejects.toThrow("Failed to cancel booking");
    });

    it("completeBooking patches with completed status", async () => {
        mockedAxios.patch.mockResolvedValue({ data: { data: { status: "completed" } } });
        const result = await completeBooking("1");
        expect(result).toEqual({ data: { status: "completed" } });
        expect(mockedAxios.patch).toHaveBeenCalledWith("/api/v1/bookings/1", { status: "completed" });
    });

    it("completeBooking throws on failure", async () => {
        mockedAxios.patch.mockRejectedValue({});
        await expect(completeBooking("1")).rejects.toThrow("Failed to update booking");
    });
});
