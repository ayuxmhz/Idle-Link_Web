import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

import axiosInstance from "@/lib/api/axios-instance";
import { createRating, getDeviceRatings } from "@/lib/api/ratings";

const mockedAxios = axiosInstance as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
};

beforeEach(() => vi.clearAllMocks());

describe("ratings api", () => {
    it("createRating posts and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { data: { stars: 5 } } });
        const result = await createRating("b1", 5, "great");
        expect(result).toEqual({ data: { stars: 5 } });
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/ratings", { bookingId: "b1", stars: 5, review: "great" });
    });

    it("createRating throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "already rated" } } });
        await expect(createRating("b1", 5)).rejects.toThrow("already rated");
    });

    it("getDeviceRatings returns data", async () => {
        mockedAxios.get.mockResolvedValue({ data: { data: [] } });
        expect(await getDeviceRatings("d1", { page: 1 })).toEqual({ data: [] });
    });

    it("getDeviceRatings throws on failure", async () => {
        mockedAxios.get.mockRejectedValue({});
        await expect(getDeviceRatings("d1")).rejects.toThrow("Failed to fetch ratings");
    });
});
