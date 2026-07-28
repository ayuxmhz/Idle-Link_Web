import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "@/app/(auth)/reset-password/ResetPasswordForm";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
    useSearchParams: () => new URLSearchParams("email=a%40b.com"),
}));

const resetPasswordMock = vi.fn();
vi.mock("@/lib/api/auth", () => ({
    resetPassword: (...args: unknown[]) => resetPasswordMock(...args),
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
});

describe("ResetPasswordForm", () => {
    it("pre-fills the email from the query string", () => {
        render(<ResetPasswordForm />);
        expect(screen.getByDisplayValue("a@b.com")).toBeInTheDocument();
    });

    it("rejects a weak new password client-side", async () => {
        render(<ResetPasswordForm />);
        await userEvent.type(screen.getByPlaceholderText("123456"), "123456");
        await userEvent.type(screen.getByPlaceholderText("••••••••"), "weak");
        await userEvent.click(screen.getByRole("button", { name: /Reset Password/ }));

        expect(await screen.findByText("Password must be at least 8 characters long")).toBeInTheDocument();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    it("resets the password and redirects to login", async () => {
        resetPasswordMock.mockResolvedValue({ success: true });
        render(<ResetPasswordForm />);
        await userEvent.type(screen.getByPlaceholderText("123456"), "123456");
        await userEvent.type(screen.getByPlaceholderText("••••••••"), "NewPass1!");
        await userEvent.click(screen.getByRole("button", { name: /Reset Password/ }));

        expect(await screen.findByText("Password reset!")).toBeInTheDocument();
        expect(resetPasswordMock).toHaveBeenCalledWith("a@b.com", "123456", "NewPass1!");
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"), { timeout: 3000 });
    });

    it("shows the server's error message on failure", async () => {
        resetPasswordMock.mockRejectedValue(new Error("Invalid code"));
        render(<ResetPasswordForm />);
        await userEvent.type(screen.getByPlaceholderText("123456"), "000000");
        await userEvent.type(screen.getByPlaceholderText("••••••••"), "NewPass1!");
        await userEvent.click(screen.getByRole("button", { name: /Reset Password/ }));

        expect(await screen.findByText("Invalid code")).toBeInTheDocument();
    });
});
