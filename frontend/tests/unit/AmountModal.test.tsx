import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AmountModal from "@/components/dashboard/AmountModal";

describe("AmountModal", () => {
    it("renders nothing when closed", () => {
        const { container } = render(
            <AmountModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} title="Deposit" actionLabel="Deposit" />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("submits the entered amount and closes on success", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();
        render(<AmountModal isOpen={true} onClose={onClose} onSubmit={onSubmit} title="Deposit" actionLabel="Deposit" />);

        const input = screen.getByRole("spinbutton");
        await userEvent.type(input, "500");
        await userEvent.click(screen.getByRole("button", { name: "Deposit" }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(500, ""));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it("shows the destination field when requireDestination is set", () => {
        render(<AmountModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} title="Withdraw" actionLabel="Withdraw" requireDestination />);
        expect(screen.getByPlaceholderText(/eSewa ID or account number|98XXXXXXXX/)).toBeInTheDocument();
    });

    it("shows an error message when onSubmit rejects", async () => {
        const onSubmit = vi.fn().mockRejectedValue(new Error("Insufficient balance"));
        render(<AmountModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} title="Withdraw" actionLabel="Withdraw" />);

        await userEvent.type(screen.getByRole("spinbutton"), "999999");
        await userEvent.click(screen.getByRole("button", { name: "Withdraw" }));

        expect(await screen.findByText("Insufficient balance")).toBeInTheDocument();
    });
});
