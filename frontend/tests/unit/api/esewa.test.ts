import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: { post: vi.fn() },
}));

import axiosInstance from "@/lib/api/axios-instance";
import { initiateEsewaDeposit, verifyEsewaPayment } from "@/lib/api/esewa";

const mockedAxios = axiosInstance as unknown as { post: ReturnType<typeof vi.fn> };

beforeEach(() => vi.clearAllMocks());

describe("esewa api", () => {
    it("initiateEsewaDeposit posts amount and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true, data: { paymentUrl: "url", fields: {} } } });
        const result = await initiateEsewaDeposit(500);
        expect(result.data.paymentUrl).toBe("url");
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/transactions/esewa/initiate", { amount: 500 });
    });

    it("initiateEsewaDeposit throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "bad amount" } } });
        await expect(initiateEsewaDeposit(0)).rejects.toThrow("bad amount");
    });

    it("verifyEsewaPayment posts transactionUuid and returns data", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true, data: { amount: 500, status: "complete" } } });
        const result = await verifyEsewaPayment("uuid-1");
        expect(result.data.status).toBe("complete");
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/transactions/esewa/verify", { transactionUuid: "uuid-1" });
    });

    it("verifyEsewaPayment throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({});
        await expect(verifyEsewaPayment("uuid-1")).rejects.toThrow("Failed to verify eSewa payment");
    });
});
