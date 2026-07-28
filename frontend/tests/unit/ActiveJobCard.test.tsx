import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActiveJobCard, { ActiveJobViewModel } from "@/components/dashboard/ActiveJobCard";

const job: ActiveJobViewModel = {
    taskName: "Train model",
    buyerUsername: "alice",
    progress: 42,
    cpuUtilPercent: 60,
    ramUsedGB: 8,
    ramTotalGB: 16,
    gpuLabel: "RTX 4090",
    gpuUtilPercent: 70,
    consoleLines: [{ text: "Epoch 1", level: "info" }, { text: "GPU hot", level: "warn" }],
};

describe("ActiveJobCard", () => {
    it("shows an empty state when there is no active job", () => {
        render(<ActiveJobCard />);
        expect(screen.getByText("No active jobs right now")).toBeInTheDocument();
    });

    it("renders job details when a job is provided", () => {
        render(<ActiveJobCard job={job} />);
        expect(screen.getByText("Train model")).toBeInTheDocument();
        expect(screen.getByText("alice")).toBeInTheDocument();
        expect(screen.getByText("42%")).toBeInTheDocument();
    });

    it("opens and closes the console modal", async () => {
        render(<ActiveJobCard job={job} />);
        await userEvent.click(screen.getByRole("button", { name: "View Console" }));
        expect(screen.getByText(/Live console output/)).toBeInTheDocument();

        const closeButtons = screen.getAllByRole("button").filter((b) => !b.textContent);
        await userEvent.click(closeButtons[closeButtons.length - 1]);
        expect(screen.queryByText(/Live console output/)).not.toBeInTheDocument();
    });
});
