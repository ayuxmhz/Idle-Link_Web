import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let mockPathname = "/dashboard";
vi.mock("next/navigation", () => ({
    usePathname: () => mockPathname,
}));

const closeMock = vi.fn();
vi.mock("@/components/SidebarContext", () => ({
    useSidebar: () => ({ isOpen: false, close: closeMock }),
}));

const logoutMock = vi.fn();
let mockUser: Record<string, unknown> = { role: "user" };
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: mockUser, logout: logoutMock }),
}));

import Sidebar from "@/components/dashboard/Sidebar";

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { role: "user" };
    mockPathname = "/dashboard";
});

describe("Dashboard Sidebar", () => {
    it("highlights the active dashboard link", () => {
        render(<Sidebar />);
        expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveClass("bg-[#252538]");
    });

    it("does not show the admin panel link for a regular user", () => {
        render(<Sidebar />);
        expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    });

    it("shows the admin panel link for an admin user", () => {
        mockUser = { role: "admin" };
        render(<Sidebar />);
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    });

    it("calls logout when Logout is clicked", async () => {
        render(<Sidebar />);
        await userEvent.click(screen.getByRole("button", { name: /Logout/ }));
        expect(logoutMock).toHaveBeenCalled();
    });
});
