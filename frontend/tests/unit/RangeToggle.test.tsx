import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RangeToggle from "@/components/RangeToggle";

describe("RangeToggle", () => {
    it("renders all three range options", () => {
        render(<RangeToggle value="week" onChange={() => {}} />);
        expect(screen.getByText("Day")).toBeInTheDocument();
        expect(screen.getByText("Week")).toBeInTheDocument();
        expect(screen.getByText("Month")).toBeInTheDocument();
    });

    it("calls onChange with the clicked range", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<RangeToggle value="week" onChange={onChange} />);

        await user.click(screen.getByText("Month"));
        expect(onChange).toHaveBeenCalledWith("month");

        await user.click(screen.getByText("Day"));
        expect(onChange).toHaveBeenCalledWith("day");
    });

    it("highlights the currently active range", () => {
        render(<RangeToggle value="day" onChange={() => {}} />);
        expect(screen.getByText("Day").className).toContain("bg-[#252644]");
        expect(screen.getByText("Week").className).not.toContain("bg-[#252644]");
    });
});
