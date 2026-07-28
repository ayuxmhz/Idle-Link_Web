import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";

describe("ConfirmDeleteModal", () => {
    it("renders nothing when closed", () => {
        const { container } = render(
            <ConfirmDeleteModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} title="Delete" message="Are you sure?" />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders the title and message when open", () => {
        render(<ConfirmDeleteModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Delete User" message="This cannot be undone." />);
        expect(screen.getByText("Delete User")).toBeInTheDocument();
        expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    });

    it("calls onClose when Cancel is clicked", async () => {
        const onClose = vi.fn();
        render(<ConfirmDeleteModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} title="Delete" message="Sure?" />);
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onClose).toHaveBeenCalled();
    });

    it("calls onConfirm when Delete is clicked", async () => {
        const onConfirm = vi.fn();
        render(<ConfirmDeleteModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} title="Delete" message="Sure?" />);
        await userEvent.click(screen.getByRole("button", { name: "Delete" }));
        expect(onConfirm).toHaveBeenCalled();
    });

    it("shows a Deleting state and disables the buttons", () => {
        render(<ConfirmDeleteModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Delete" message="Sure?" isDeleting />);
        expect(screen.getByRole("button", { name: /Deleting/ })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });
});
