import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: { post: vi.fn() },
}));

import axiosInstance from "@/lib/api/axios-instance";
import { findMatchingDevices } from "@/lib/api/matcher";

const mockedAxios = axiosInstance as unknown as { post: ReturnType<typeof vi.fn> };

beforeEach(() => vi.clearAllMocks());

describe("matcher api", () => {
    it("returns matched devices on success", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true, message: "ok", data: [] } });
        const result = await findMatchingDevices("GPU for training");
        expect(result.data).toEqual([]);
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/matcher", { query: "GPU for training" });
    });

    it("throws the server message on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "not configured" } } });
        await expect(findMatchingDevices("hi")).rejects.toThrow("not configured");
    });

    it("falls back to a default message", async () => {
        mockedAxios.post.mockRejectedValue({});
        await expect(findMatchingDevices("hi")).rejects.toThrow("Failed to find matching devices");
    });
});
