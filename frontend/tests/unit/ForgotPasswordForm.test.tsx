import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "@/app/(auth)/forgot-password/ForgotPasswordForm";

const forgotPasswordMock = vi.fn();
vi.mock("@/lib/api/auth", () => ({
    forgotPassword: (...args: unknown[]) => forgotPasswordMock(...args),
}));

beforeEach(() => vi.clearAllMocks());

describe("ForgotPasswordForm", () => {
    it("sends a reset code and shows the confirmation screen", async () => {
        forgotPasswordMock.mockResolvedValue({ success: true });
        render(<ForgotPasswordForm />);

        await userEvent.type(screen.getByPlaceholderText("name@company.com"), "a@b.com");
        await userEvent.click(screen.getByRole("button", { name: /Send Reset Code/ }));

        expect(await screen.findByText("Check your email")).toBeInTheDocument();
        expect(forgotPasswordMock).toHaveBeenCalledWith("a@b.com");
        expect(screen.getByRole("link", { name: /Enter Reset Code/ })).toHaveAttribute(
            "href",
            "/reset-password?email=a%40b.com"
        );
    });

    it("shows an error message when the request fails", async () => {
        forgotPasswordMock.mockRejectedValue(new Error("Server unavailable"));
        render(<ForgotPasswordForm />);

        await userEvent.type(screen.getByPlaceholderText("name@company.com"), "a@b.com");
        await userEvent.click(screen.getByRole("button", { name: /Send Reset Code/ }));

        expect(await screen.findByText("Server unavailable")).toBeInTheDocument();
    });
});
