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

import AdminTransactionsPage from "@/app/admin/transactions/page";

const sampleTx = {
    _id: "t1",
    user: { username: "alice", firstName: "Alice", lastName: "Smith" },
    type: "deposit" as const,
    amount: 500,
    description: "Deposit via eSewa",
    createdAt: new Date().toISOString(),
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [sampleTx], meta: { total: 1, totalPages: 1 } } });
});

describe("AdminTransactionsPage", () => {
    it("lists transactions across all users", async () => {
        render(<AdminTransactionsPage />);
        expect(await screen.findByText("Deposit")).toBeInTheDocument();
        expect(screen.getByText("@alice")).toBeInTheDocument();
        expect(screen.getByText("+NPR 500")).toBeInTheDocument();
    });

    it("shows an empty state when there are no transactions", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: [], meta: { total: 0, totalPages: 1 } } });
        render(<AdminTransactionsPage />);
        expect(await screen.findByText("No transactions found.")).toBeInTheDocument();
    });

    it("shows an error state when fetching fails", async () => {
        vi.mocked(axios.get).mockRejectedValue({ response: { data: { message: "Forbidden" } } });
        render(<AdminTransactionsPage />);
        expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    });

    it("shows a deleted-user placeholder when the user is gone", async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: { data: [{ ...sampleTx, user: null }], meta: { total: 1, totalPages: 1 } },
        });
        render(<AdminTransactionsPage />);
        expect(await screen.findByText("@deleted-user")).toBeInTheDocument();
    });

    it("re-fetches when the type filter changes", async () => {
        render(<AdminTransactionsPage />);
        await screen.findByText("Deposit");

        await userEvent.selectOptions(screen.getByDisplayValue("All Types"), "commission");
        await waitFor(() =>
            expect(axios.get).toHaveBeenLastCalledWith(
                "/api/v1/admin/transactions",
                expect.objectContaining({ params: expect.objectContaining({ type: "commission" }) })
            )
        );
    });
});
