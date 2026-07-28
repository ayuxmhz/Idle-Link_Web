import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setUserMock = vi.fn();
const fetchUserMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: { walletBalance: 1000 }, setUser: setUserMock, fetchUser: fetchUserMock }),
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

const listMyTransactionsMock = vi.fn();
const withdrawMock = vi.fn();
vi.mock("@/lib/api/transactions", () => ({
    listMyTransactions: (...args: unknown[]) => listMyTransactionsMock(...args),
    withdraw: (...args: unknown[]) => withdrawMock(...args),
}));

const initiateEsewaDepositMock = vi.fn();
vi.mock("@/lib/api/esewa", () => ({
    initiateEsewaDeposit: (...args: unknown[]) => initiateEsewaDepositMock(...args),
}));

const submitToEsewaMock = vi.fn();
vi.mock("@/lib/esewaRedirect", () => ({
    submitToEsewa: (...args: unknown[]) => submitToEsewaMock(...args),
}));

import WalletPage from "@/app/dashboard/wallet/page";

beforeEach(() => {
    vi.clearAllMocks();
    listMyTransactionsMock.mockResolvedValue({
        data: [
            { _id: "t1", type: "deposit", amount: 500, description: "Deposit via eSewa", createdAt: new Date().toISOString() },
            { _id: "t2", type: "job_payment", amount: -50, description: "Booking: job", createdAt: new Date().toISOString() },
        ],
    });
});

describe("WalletPage", () => {
    it("shows the wallet balance and transaction history", async () => {
        render(<WalletPage />);
        expect(await screen.findByText("Deposit")).toBeInTheDocument();
        expect(screen.getByText("NPR 1,000")).toBeInTheDocument();
        expect(screen.getByText("Job Payment")).toBeInTheDocument();
    });

    it("shows an error state when fetching transactions fails", async () => {
        listMyTransactionsMock.mockRejectedValue(new Error("Network error"));
        render(<WalletPage />);
        expect(await screen.findByText("Network error")).toBeInTheDocument();
    });

    it("shows an empty state when there are no transactions", async () => {
        listMyTransactionsMock.mockResolvedValue({ data: [] });
        render(<WalletPage />);
        expect(await screen.findByText("No transactions yet.")).toBeInTheDocument();
    });

    it("opens the eSewa deposit flow and submits the redirect form", async () => {
        initiateEsewaDepositMock.mockResolvedValue({ data: { paymentUrl: "https://esewa", fields: {} } });
        render(<WalletPage />);
        await screen.findByText("Deposit");

        await userEvent.click(screen.getByRole("button", { name: /Deposit with eSewa/i }));
        await userEvent.type(screen.getByRole("spinbutton"), "500");
        await userEvent.click(screen.getByRole("button", { name: "Continue to eSewa" }));

        await waitFor(() => expect(initiateEsewaDepositMock).toHaveBeenCalledWith(500));
        await waitFor(() => expect(submitToEsewaMock).toHaveBeenCalledWith("https://esewa", {}));
    });

    it("withdraws funds and updates the balance optimistically", async () => {
        withdrawMock.mockResolvedValue({ data: {} });
        render(<WalletPage />);
        await screen.findByText("Deposit");

        await userEvent.click(screen.getAllByRole("button", { name: "Withdraw" })[0]);
        await userEvent.type(screen.getByRole("spinbutton"), "200");
        await userEvent.type(screen.getByPlaceholderText(/98XXXXXXXX/), "9800000000");
        const withdrawButtons = screen.getAllByRole("button", { name: "Withdraw" });
        await userEvent.click(withdrawButtons[withdrawButtons.length - 1]);

        await waitFor(() => expect(withdrawMock).toHaveBeenCalledWith(200, "9800000000"));
        await waitFor(() => expect(setUserMock).toHaveBeenCalledWith({ walletBalance: 800 }));
    });
});
