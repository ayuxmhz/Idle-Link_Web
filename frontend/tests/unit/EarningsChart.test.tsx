import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EarningsChart from "@/components/dashboard/EarningsChart";

describe("EarningsChart", () => {
    it("renders the Mon/Sun axis labels with no data", () => {
        render(<EarningsChart />);
        expect(screen.getByText("Mon")).toBeInTheDocument();
        expect(screen.getByText("Sun")).toBeInTheDocument();
        expect(screen.getByText("Earnings Overview")).toBeInTheDocument();
    });

    it("falls back to a 7-day zero series when data doesn't have exactly 7 entries", () => {
        const { container } = render(<EarningsChart data={[{ day: "Mon", total: 100 }]} />);
        // Falls back to DAY_LABELS (Mon..Sun) — 7 bars either way
        const bars = container.querySelectorAll(".rounded-t-sm");
        expect(bars).toHaveLength(7);
    });

    it("renders one bar per day when given a full week of data", () => {
        const data = [
            { day: "Mon", total: 100 },
            { day: "Tue", total: 200 },
            { day: "Wed", total: 0 },
            { day: "Thu", total: 50 },
            { day: "Fri", total: 300 },
            { day: "Sat", total: 0 },
            { day: "Sun", total: 10 },
        ];
        const { container } = render(<EarningsChart data={data} />);
        const bars = container.querySelectorAll(".rounded-t-sm");
        expect(bars).toHaveLength(7);
    });
});
