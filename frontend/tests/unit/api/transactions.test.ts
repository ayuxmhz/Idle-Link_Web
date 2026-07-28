import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: { get: vi.fn(), post: vi.fn() },
}));

import axiosInstance from "@/lib/api/axios-instance";
import { listMyTransactions, getSummary, deposit, withdraw } from "@/lib/api/transactions";

const mockedAxios = axiosInstance as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
};

beforeEach(() => vi.clearAllMocks());

describe("transactions api", () => {
    it("listMyTransactions returns data", async () => {
        mockedAxios.get.mockResolvedValue({ data: { data: [] } });
        expect(await listMyTransactions()).toEqual({ data: [] });
    });

    it("listMyTransactions throws on failure", async () => {
        mockedAxios.get.mockRejectedValue({});
        await expect(listMyTransactions()).rejects.toThrow("Failed to fetch transactions");
    });

    it("getSummary requests the given range and returns data", async () => {
        mockedAxios.get.mockResolvedValue({ data: { data: { todayTotal: 10 } } });
        const result = await getSummary("month");
        expect(result).toEqual({ data: { todayTotal: 10 } });
        expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/transactions/summary", { params: { range: "month" } });
    });

    it("getSummary throws on failure", async () => {
        mockedAxios.get.mockRejectedValue({});
        await expect(getSummary()).rejects.toThrow("Failed to fetch earnings summary");
    });

    it("deposit posts amount and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { data: { walletBalance: 100 } } });
        const result = await deposit(100);
        expect(result).toEqual({ data: { walletBalance: 100 } });
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/transactions/deposit", { amount: 100 });
    });

    it("deposit throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({});
        await expect(deposit(100)).rejects.toThrow("Failed to deposit funds");
    });

    it("withdraw posts amount and destination and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { data: { walletBalance: 0 } } });
        const result = await withdraw(100, "esewa");
        expect(result).toEqual({ data: { walletBalance: 0 } });
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/transactions/withdraw", { amount: 100, destination: "esewa" });
    });

    it("withdraw throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "insufficient" } } });
        await expect(withdraw(100, "esewa")).rejects.toThrow("insufficient");
    });
});
