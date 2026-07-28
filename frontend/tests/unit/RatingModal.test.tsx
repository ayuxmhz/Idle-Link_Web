import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RatingModal from "@/components/dashboard/RatingModal";

describe("RatingModal", () => {
    it("does not render when isOpen is false", () => {
        render(<RatingModal isOpen={false} onClose={() => {}} onSubmit={vi.fn()} taskName="train model" />);
        expect(screen.queryByText("Rate this booking")).not.toBeInTheDocument();
    });

    it("shows an error if submitted without selecting a star", async () => {
        const user = userEvent.setup();
        render(<RatingModal isOpen onClose={() => {}} onSubmit={vi.fn()} taskName="train model" />);

        await user.click(screen.getByRole("button", { name: /submit rating/i }));
        expect(await screen.findByText(/please select a star rating/i)).toBeInTheDocument();
    });

    it("submits the selected star count and review text", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(<RatingModal isOpen onClose={() => {}} onSubmit={onSubmit} taskName="train model" />);

        await user.click(screen.getByRole("button", { name: "3 stars" }));

        const reviewBox = screen.getByPlaceholderText(/how was this device/i);
        await user.type(reviewBox, "Worked great");

        await user.click(screen.getByRole("button", { name: /submit rating/i }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(3, "Worked great");
        });
    });
});
