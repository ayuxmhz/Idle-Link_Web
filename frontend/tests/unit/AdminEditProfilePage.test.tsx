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
let mockUser: Record<string, unknown> = { firstName: "Admin", lastName: "User", email: "admin@example.com", isEmailVerified: false };
let mockLoading = false;
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: mockUser, fetchUser: fetchUserMock, loading: mockLoading }),
}));

import AdminEditProfilePage from "@/app/admin/settings/edit/page";

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { firstName: "Admin", lastName: "User", email: "admin@example.com", isEmailVerified: false };
    mockLoading = false;
});

describe("AdminEditProfilePage", () => {
    it("pre-fills the form from the current admin user", () => {
        render(<AdminEditProfilePage />);
        expect(screen.getByDisplayValue("Admin")).toBeInTheDocument();
        expect(screen.getByDisplayValue("admin@example.com")).toBeInTheDocument();
    });

    it("saves profile changes", async () => {
        vi.mocked(axios.put).mockResolvedValue({ data: { success: true } });
        render(<AdminEditProfilePage />);
        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => expect(axios.put).toHaveBeenCalled());
        expect(fetchUserMock).toHaveBeenCalled();
    });

    it("shows an error message on save failure", async () => {
        vi.mocked(axios.put).mockRejectedValue({ response: { data: { message: "Server error" } } });
        render(<AdminEditProfilePage />);
        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
        expect(await screen.findByText(/Server error/)).toBeInTheDocument();
    });

    it("sends and confirms an email verification code", async () => {
        vi.mocked(axios.post).mockImplementation((url: string) => {
            if (url === "/api/v1/auth/send-verification-email") {
                return Promise.resolve({ data: { data: { devCode: "111111" } } });
            }
            return Promise.resolve({ data: { success: true } });
        });
        render(<AdminEditProfilePage />);

        await userEvent.click(screen.getByRole("button", { name: /Verify/ }));
        expect(await screen.findByText(/Dev Code: 111111/)).toBeInTheDocument();

        await userEvent.type(screen.getByPlaceholderText("123456"), "111111");
        await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

        await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
            "/api/v1/auth/verify-email", { code: "111111" }, expect.anything()
        ));
    });
});
