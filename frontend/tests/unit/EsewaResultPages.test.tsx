import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import EsewaFailurePage from "@/app/dashboard/wallet/esewa/failure/page";

vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(mockSearch),
}));

const fetchUserMock = vi.fn();
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ fetchUser: fetchUserMock }),
}));

const verifyEsewaPaymentMock = vi.fn();
vi.mock("@/lib/api/esewa", () => ({
    verifyEsewaPayment: (...args: unknown[]) => verifyEsewaPaymentMock(...args),
}));

import EsewaSuccessContent from "@/app/dashboard/wallet/esewa/success/EsewaSuccessContent";

let mockSearch = "";

beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = "";
});

describe("EsewaFailurePage", () => {
    it("shows a cancelled-payment message with a link back to wallet", () => {
        render(<EsewaFailurePage />);
        expect(screen.getByText("Payment cancelled")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Back to Wallet/ })).toHaveAttribute("href", "/dashboard/wallet");
    });
});

describe("EsewaSuccessContent", () => {
    it("shows an error when no payment data is present in the URL", async () => {
        render(<EsewaSuccessContent />);
        expect(await screen.findByText("Verification failed")).toBeInTheDocument();
        expect(screen.getByText("Missing payment data from eSewa.")).toBeInTheDocument();
    });

    it("verifies the payment and shows success", async () => {
        const encoded = btoa(JSON.stringify({ transaction_uuid: "uuid-1", total_amount: "500" }));
        mockSearch = `data=${encoded}`;
        verifyEsewaPaymentMock.mockResolvedValue({ data: { amount: 500, status: "complete" } });

        render(<EsewaSuccessContent />);
        expect(await screen.findByText("Payment successful")).toBeInTheDocument();
        expect(screen.getByText(/500/)).toBeInTheDocument();
        expect(fetchUserMock).toHaveBeenCalled();
    });

    it("shows an error when verification fails", async () => {
        const encoded = btoa(JSON.stringify({ transaction_uuid: "uuid-1" }));
        mockSearch = `data=${encoded}`;
        verifyEsewaPaymentMock.mockRejectedValue(new Error("Payment not completed"));

        render(<EsewaSuccessContent />);
        expect(await screen.findByText("Verification failed")).toBeInTheDocument();
        expect(screen.getByText("Payment not completed")).toBeInTheDocument();
    });
});
