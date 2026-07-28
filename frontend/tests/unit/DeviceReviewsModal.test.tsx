import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const getDeviceRatingsMock = vi.fn();
vi.mock("@/lib/api/ratings", () => ({
    getDeviceRatings: (...args: unknown[]) => getDeviceRatingsMock(...args),
}));

import DeviceReviewsModal from "@/components/dashboard/DeviceReviewsModal";

beforeEach(() => vi.clearAllMocks());

describe("DeviceReviewsModal", () => {
    it("renders nothing when closed", () => {
        const { container } = render(
            <DeviceReviewsModal isOpen={false} onClose={vi.fn()} deviceId="d1" deviceName="GPU Rig" />
        );
        expect(container).toBeEmptyDOMElement();
        expect(getDeviceRatingsMock).not.toHaveBeenCalled();
    });

    it("does not fetch when deviceId is null", () => {
        render(<DeviceReviewsModal isOpen={true} onClose={vi.fn()} deviceId={null} />);
        expect(getDeviceRatingsMock).not.toHaveBeenCalled();
    });

    it("fetches and displays ratings with a summary", async () => {
        getDeviceRatingsMock.mockResolvedValue({
            data: {
                summary: { avgRating: 4.5, count: 2 },
                ratings: [
                    { _id: "r1", stars: 5, review: "Great device", buyerUsername: "alice", createdAt: new Date().toISOString() },
                    { _id: "r2", stars: 4, buyerUsername: "bob", createdAt: new Date().toISOString() },
                ],
            },
        });

        render(<DeviceReviewsModal isOpen={true} onClose={vi.fn()} deviceId="d1" deviceName="GPU Rig" />);

        expect(await screen.findByText("Great device")).toBeInTheDocument();
        expect(screen.getByText("@alice")).toBeInTheDocument();
        expect(screen.getByText("@bob")).toBeInTheDocument();
        expect(screen.getByText("4.5")).toBeInTheDocument();
        expect(screen.getByText("Reviews — GPU Rig")).toBeInTheDocument();
    });

    it("shows an empty state when there are no reviews", async () => {
        getDeviceRatingsMock.mockResolvedValue({ data: { summary: { avgRating: 0, count: 0 }, ratings: [] } });
        render(<DeviceReviewsModal isOpen={true} onClose={vi.fn()} deviceId="d1" />);
        expect(await screen.findByText("No reviews yet.")).toBeInTheDocument();
    });

    it("shows an error state when the fetch fails", async () => {
        getDeviceRatingsMock.mockRejectedValue(new Error("Failed to load"));
        render(<DeviceReviewsModal isOpen={true} onClose={vi.fn()} deviceId="d1" />);
        expect(await screen.findByText("Failed to load")).toBeInTheDocument();
    });

    it("calls onClose when the close button is clicked", async () => {
        const onClose = vi.fn();
        getDeviceRatingsMock.mockResolvedValue({ data: { summary: null, ratings: [] } });
        render(<DeviceReviewsModal isOpen={true} onClose={onClose} deviceId="d1" />);
        await screen.findByText("No reviews yet.");
        await userEvent.click(screen.getByRole("button"));
        expect(onClose).toHaveBeenCalled();
    });
});
