import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios", async (importOriginal) => {
    const actual = await importOriginal<typeof import("axios")>();
    return {
        ...actual,
        default: { ...actual.default, get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
    };
});

const fetchUserMock = vi.fn();
let mockUser: Record<string, unknown> = { firstName: "Admin", lastName: "User", username: "adminuser", email: "admin@example.com", role: "admin" };
let mockLoading = false;
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: mockUser, fetchUser: fetchUserMock, loading: mockLoading }),
}));

import AdminSettingsPage from "@/app/admin/settings/page";

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { firstName: "Admin", lastName: "User", username: "adminuser", email: "admin@example.com", role: "admin" };
    mockLoading = false;
});

describe("AdminSettingsPage", () => {
    it("shows a loading spinner while the user context loads", () => {
        mockLoading = true;
        const { container } = render(<AdminSettingsPage />);
        expect(container.querySelector(".animate-spin")).toBeTruthy();
    });

    it("renders the admin's profile info", () => {
        render(<AdminSettingsPage />);
        expect(screen.getAllByText("Admin User").length).toBeGreaterThan(0);
        expect(screen.getByText("admin@example.com")).toBeInTheDocument();
        expect(screen.getAllByText("@adminuser").length).toBeGreaterThan(0);
    });

    it("uploads a new profile photo", async () => {
        vi.mocked(axios.put).mockResolvedValue({ data: { success: true } });
        const { container } = render(<AdminSettingsPage />);

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(["img"], "avatar.png", { type: "image/png" });
        await userEvent.upload(fileInput, file);

        await userEvent.click(await screen.findByRole("button", { name: "Apply" }));
        await userEvent.click(await screen.findByRole("button", { name: "Save Photo" }));
        await waitFor(() => expect(axios.put).toHaveBeenCalled());
        expect(await screen.findByText(/Profile photo updated!/)).toBeInTheDocument();
        expect(fetchUserMock).toHaveBeenCalled();
    });

    it("cancels a selected photo without uploading", async () => {
        const { container } = render(<AdminSettingsPage />);
        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(["img"], "avatar.png", { type: "image/png" });
        await userEvent.upload(fileInput, file);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(screen.queryByRole("button", { name: "Save Photo" })).not.toBeInTheDocument();
        expect(axios.put).not.toHaveBeenCalled();
    });

    it("has links to edit profile and change password", () => {
        render(<AdminSettingsPage />);
        expect(screen.getByRole("link", { name: /Edit Profile/ })).toHaveAttribute("href", "/admin/settings/edit");
        expect(screen.getByRole("link", { name: /Change Password/ })).toHaveAttribute("href", "/admin/settings/password");
    });
});
