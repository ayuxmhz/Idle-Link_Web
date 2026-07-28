import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
    usePathname: () => "/dashboard",
}));

vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: { role: "user" }, logout: vi.fn() }),
}));

import DashboardLayout from "@/app/dashboard/layout";

describe("DashboardLayout", () => {
    it("renders the sidebar and page content", () => {
        render(
            <DashboardLayout>
                <p>Page content</p>
            </DashboardLayout>
        );
        expect(screen.getByText("Page content")).toBeInTheDocument();
        expect(screen.getByText("IdleLink")).toBeInTheDocument();
    });
});
