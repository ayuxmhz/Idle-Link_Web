import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CancelBookingModal from "@/components/dashboard/CancelBookingModal";

describe("CancelBookingModal", () => {
    it("requires a reason before it will submit", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(<CancelBookingModal isOpen onClose={() => {}} onSubmit={onSubmit} taskName="train model" />);

        // The textarea has the `required` HTML attribute, so submitting an
        // empty form is blocked by the browser before our own onSubmit runs.
        await user.click(screen.getByRole("button", { name: /cancel booking/i }));
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submits the typed reason", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(<CancelBookingModal isOpen onClose={() => {}} onSubmit={onSubmit} taskName="train model" />);

        await user.type(screen.getByPlaceholderText(/found a cheaper device/i), "Found a better price");
        await user.click(screen.getByRole("button", { name: /cancel booking/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith("Found a better price");
        });
    });
});
