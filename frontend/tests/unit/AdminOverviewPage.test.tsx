import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios", async (importOriginal) => {
    const actual = await importOriginal<typeof import("axios")>();
    return {
        ...actual,
        default: {
            ...actual.default,
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
    };
});

import AdminOverviewPage from "@/app/admin/page";

const overview = {
    totalRevenue: 5000,
    revenueChangePercent: 10,
    activeUsers: 42,
    activeUsersChangePercent: -5,
    liveNodes: 8,
    liveNodesChangePercent: 2,
    commissionEarned: 750,
    commissionChangePercent: 5,
    revenueChart: [{ day: "Mon", total: 100 }],
    topNodes: [{ name: "GPU Rig", uptimePercent: 99.9, earnings: 300 }],
    recentTransactions: [
        { _id: "abcdef123456", user: { username: "alice" }, type: "deposit", amount: 200, description: "Deposit", createdAt: new Date().toISOString() },
    ],
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("AdminOverviewPage", () => {
    it("renders metrics, top nodes, and recent transactions", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: overview } });
        render(<AdminOverviewPage />);

        expect(await screen.findByText("Rs 5,000.00")).toBeInTheDocument();
        expect(screen.getByText("GPU Rig")).toBeInTheDocument();
        expect(screen.getByText("@alice")).toBeInTheDocument();
    });

    it("shows an error state when the request fails", async () => {
        vi.mocked(axios.get).mockRejectedValue({ response: { data: { message: "Forbidden" } } });
        render(<AdminOverviewPage />);
        expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    });

    it("shows empty states for nodes and transactions", async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: { data: { ...overview, topNodes: [], recentTransactions: [] } },
        });
        render(<AdminOverviewPage />);
        expect(await screen.findByText("No earnings recorded yet.")).toBeInTheDocument();
        expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
    });

    it("re-fetches when the revenue range toggle changes", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: overview } });
        render(<AdminOverviewPage />);
        await screen.findByText("Rs 5,000.00");

        await userEvent.click(screen.getByRole("button", { name: "Month" }));
        await waitFor(() =>
            expect(axios.get).toHaveBeenLastCalledWith(
                "/api/v1/admin/stats/overview",
                expect.objectContaining({ params: { range: "month" } })
            )
        );
    });
});
