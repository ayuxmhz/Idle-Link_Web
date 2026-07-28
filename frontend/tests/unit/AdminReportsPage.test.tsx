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

import AdminReportsPage from "@/app/admin/reports/page";

beforeEach(() => {
    vi.clearAllMocks();
});

describe("AdminReportsPage", () => {
    it("renders breakdowns from transactions, devices, and users", async () => {
        vi.mocked(axios.get).mockImplementation((url: string) => {
            if (url === "/api/v1/admin/transactions") {
                return Promise.resolve({ data: { data: [{ _id: "t1", type: "deposit", amount: 500, createdAt: new Date().toISOString() }] } });
            }
            if (url === "/api/v1/admin/devices") {
                return Promise.resolve({ data: { data: [{ _id: "d1", type: "GPU" }] } });
            }
            return Promise.resolve({ data: { data: [{ _id: "u1", createdAt: new Date().toISOString() }] } });
        });

        render(<AdminReportsPage />);
        await screen.findByText("Total Transactions");
        expect(screen.getByText("Deposits")).toBeInTheDocument();
        expect(screen.getByText("Total Inflow (Deposits)")).toBeInTheDocument();
    });

    it("shows empty states when there's no data", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });
        render(<AdminReportsPage />);
        expect(await screen.findByText("No transactions yet.")).toBeInTheDocument();
        expect(screen.getByText("No devices listed yet.")).toBeInTheDocument();
    });

    it("shows an error state when fetching fails", async () => {
        vi.mocked(axios.get).mockRejectedValue({ response: { data: { message: "Forbidden" } } });
        render(<AdminReportsPage />);
        expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    });

    it("switches the signup range toggle", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: [] } });
        render(<AdminReportsPage />);
        await screen.findByText("User Signups");

        await userEvent.click(screen.getByRole("button", { name: "Day" }));
        await waitFor(() => expect(screen.getByRole("button", { name: "Day" })).toHaveClass("bg-[#252644]"));
    });
});
