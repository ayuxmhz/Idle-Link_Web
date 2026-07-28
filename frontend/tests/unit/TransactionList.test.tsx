import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TransactionList from "@/components/dashboard/TransactionList";

describe("TransactionList", () => {
    it("shows an empty state when there are no transactions", () => {
        render(<TransactionList transactions={[]} />);
        expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    });

    it("shows an empty state when transactions is omitted", () => {
        render(<TransactionList />);
        expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    });

    it("renders each transaction with type, details, and amount", () => {
        render(
            <TransactionList
                transactions={[
                    { type: "Deposit", details: "via eSewa", amount: "+NPR 500", positive: true },
                    { type: "Withdrawal", details: "to bank", amount: "-NPR 100", positive: false },
                ]}
            />
        );
        expect(screen.getByText("Deposit")).toBeInTheDocument();
        expect(screen.getByText("+NPR 500")).toBeInTheDocument();
        expect(screen.getByText("Withdrawal")).toBeInTheDocument();
        expect(screen.getByText("-NPR 100")).toBeInTheDocument();
    });
});
