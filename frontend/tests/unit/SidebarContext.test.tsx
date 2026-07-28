import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

function Probe() {
    const { isOpen, toggle, close } = useSidebar();
    return (
        <div>
            <span>{isOpen ? "open" : "closed"}</span>
            <button onClick={toggle}>toggle</button>
            <button onClick={close}>close</button>
        </div>
    );
}

describe("SidebarContext", () => {
    it("throws when useSidebar is used outside a provider", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<Probe />)).toThrow("useSidebar must be used within a SidebarProvider");
        consoleError.mockRestore();
    });

    it("toggles and closes the sidebar state", async () => {
        render(
            <SidebarProvider>
                <Probe />
            </SidebarProvider>
        );
        expect(screen.getByText("closed")).toBeInTheDocument();

        await userEvent.click(screen.getByText("toggle"));
        expect(screen.getByText("open")).toBeInTheDocument();

        await userEvent.click(screen.getByText("close"));
        expect(screen.getByText("closed")).toBeInTheDocument();
    });
});
