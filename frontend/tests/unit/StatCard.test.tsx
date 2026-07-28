import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "@/components/dashboard/StatCard";

describe("StatCard", () => {
    it("renders the title and value", () => {
        render(<StatCard title="Today's Earnings" value="NPR 500" />);
        expect(screen.getByText("Today's Earnings")).toBeInTheDocument();
        expect(screen.getByText("NPR 500")).toBeInTheDocument();
    });

    it("renders a badge when provided", () => {
        render(<StatCard title="This Week" value="NPR 1,000" badge="+12%" />);
        expect(screen.getByText("+12%")).toBeInTheDocument();
    });

    it("does not render a badge element when none is provided", () => {
        render(<StatCard title="Active Jobs" value="2" />);
        expect(screen.queryByText("+")).not.toBeInTheDocument();
    });
});
