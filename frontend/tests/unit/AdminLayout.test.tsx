import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const notFoundMock = vi.fn();
vi.mock("next/navigation", () => ({
    notFound: () => notFoundMock(),
    usePathname: () => "/admin",
}));

let mockUser: Record<string, unknown> | null = null;
let mockLoading = true;
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: mockUser, loading: mockLoading, logout: vi.fn() }),
}));

import AdminLayout from "@/app/admin/layout";

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockLoading = true;
});

describe("AdminLayout", () => {
    it("shows a loading spinner while the user context is loading", () => {
        const { container } = render(<AdminLayout><p>Content</p></AdminLayout>);
        expect(container.querySelector(".animate-spin")).toBeTruthy();
        expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("shows a 404 for a non-admin user instead of the admin content", () => {
        mockLoading = false;
        mockUser = { role: "user" };
        render(<AdminLayout><p>Content</p></AdminLayout>);
        expect(notFoundMock).toHaveBeenCalled();
        expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("shows a 404 for an anonymous visitor", () => {
        mockLoading = false;
        mockUser = null;
        render(<AdminLayout><p>Content</p></AdminLayout>);
        expect(notFoundMock).toHaveBeenCalled();
        expect(screen.queryByText("Content")).not.toBeInTheDocument();
    });

    it("renders the admin shell for an admin user", async () => {
        mockLoading = false;
        mockUser = { role: "admin" };
        render(<AdminLayout><p>Content</p></AdminLayout>);
        expect(await screen.findByText("Content")).toBeInTheDocument();
        expect(notFoundMock).not.toHaveBeenCalled();
    });
});
