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
const logoutMock = vi.fn();
let mockUser: Record<string, unknown> = { firstName: "Jane", lastName: "Doe", username: "janedoe", email: "jane@example.com", role: "user", isEmailVerified: false };
let mockLoading = false;
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: mockUser, fetchUser: fetchUserMock, loading: mockLoading, logout: logoutMock }),
}));

import ProfilePage from "@/app/(protected)/profile/page";

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { firstName: "Jane", lastName: "Doe", username: "janedoe", email: "jane@example.com", role: "user", isEmailVerified: false };
    mockLoading = false;
});

describe("ProfilePage", () => {
    it("shows a loading spinner while the user context loads", () => {
        mockLoading = true;
        const { container } = render(<ProfilePage />);
        expect(container.querySelector(".animate-spin")).toBeTruthy();
    });

    it("renders profile info and an unverified email prompt", () => {
        render(<ProfilePage />);
        expect(screen.getAllByText("Jane Doe").length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: "Verify Email" })).toBeInTheDocument();
    });

    it("shows a verified badge when the email is verified", () => {
        mockUser = { ...mockUser, isEmailVerified: true };
        render(<ProfilePage />);
        expect(screen.getByText("Verified")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Verify Email" })).not.toBeInTheDocument();
    });

    it("sends a verification code and submits it", async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });
        render(<ProfilePage />);

        await userEvent.click(screen.getByRole("button", { name: "Verify Email" }));
        await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
            "/api/v1/auth/send-verification-email", {}, expect.anything()
        ));

        const codeInput = await screen.findByPlaceholderText("Enter 6-digit code");
        await userEvent.type(codeInput, "123456");
        await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

        await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
            "/api/v1/auth/verify-email", { code: "123456" }, expect.anything()
        ));
        await waitFor(() => expect(fetchUserMock).toHaveBeenCalled());
    });

    it("shows an error when verification fails", async () => {
        vi.mocked(axios.post).mockRejectedValue({ response: { data: { message: "Invalid code" } } });
        render(<ProfilePage />);
        await userEvent.click(screen.getByRole("button", { name: "Verify Email" }));

        expect(await screen.findByText("Invalid code")).toBeInTheDocument();
    });

    it("has links to edit profile and change password", () => {
        render(<ProfilePage />);
        expect(screen.getByRole("link", { name: /Edit Profile/ })).toHaveAttribute("href", "/profile/edit");
        expect(screen.getByRole("link", { name: /Change Password/ })).toHaveAttribute("href", "/profile/password");
    });
});
