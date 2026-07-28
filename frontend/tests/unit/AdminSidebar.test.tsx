import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let mockPathname = "/admin";
vi.mock("next/navigation", () => ({
    usePathname: () => mockPathname,
}));

const closeMock = vi.fn();
vi.mock("@/components/SidebarContext", () => ({
    useSidebar: () => ({ isOpen: false, close: closeMock }),
}));

const logoutMock = vi.fn();
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ logout: logoutMock }),
}));

import AdminSidebar from "@/components/admin/Sidebar";

beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/admin";
});

describe("Admin Sidebar", () => {
    it("highlights the Overview link on /admin", () => {
        render(<AdminSidebar />);
        expect(screen.getByRole("link", { name: /Overview/ })).toHaveClass("bg-[#252538]");
    });

    it("highlights Settings when on an /admin/settings/* route", () => {
        mockPathname = "/admin/settings/edit";
        render(<AdminSidebar />);
        expect(screen.getByRole("link", { name: /Settings/ })).toHaveClass("bg-[#252538]");
    });

    it("calls logout when Logout is clicked", async () => {
        render(<AdminSidebar />);
        await userEvent.click(screen.getByRole("button", { name: /Logout/ }));
        expect(logoutMock).toHaveBeenCalled();
    });
});
