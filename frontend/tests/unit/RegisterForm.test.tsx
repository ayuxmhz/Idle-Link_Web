import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/register/RegisterForm";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/components/GoogleSignInButton", () => ({
    default: () => <div>Google Sign In</div>,
}));

const handleRegisterUserMock = vi.fn();
vi.mock("@/lib/actions/auth-action", () => ({
    handleRegisterUser: (...args: unknown[]) => handleRegisterUserMock(...args),
}));

beforeEach(() => vi.clearAllMocks());

const fillValidForm = async () => {
    await userEvent.type(screen.getByPlaceholderText("Enter First name"), "Alice");
    await userEvent.type(screen.getByPlaceholderText("Enter Last Name"), "Smith");
    await userEvent.type(screen.getByPlaceholderText("Enter username"), "alicesmith");
    await userEvent.type(screen.getByPlaceholderText("name@company.com"), "alice@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(passwordInputs[0], "Password1!");
    await userEvent.type(passwordInputs[1], "Password1!");
};

describe("RegisterForm", () => {
    it("shows validation errors when submitted empty", async () => {
        render(<RegisterForm />);
        await userEvent.click(screen.getByRole("button", { name: /Create Account/ }));
        expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument();
        expect(handleRegisterUserMock).not.toHaveBeenCalled();
    });

    it("shows a mismatch error for differing passwords", async () => {
        render(<RegisterForm />);
        await fillValidForm();
        await userEvent.clear(screen.getAllByPlaceholderText("••••••••")[1]);
        await userEvent.type(screen.getAllByPlaceholderText("••••••••")[1], "Different1!");
        await userEvent.click(screen.getByRole("button", { name: /Create Account/ }));

        expect(await screen.findByText(/do not match/i)).toBeInTheDocument();
        expect(handleRegisterUserMock).not.toHaveBeenCalled();
    });

    it("registers successfully and redirects to login", async () => {
        handleRegisterUserMock.mockResolvedValue({ success: true });
        render(<RegisterForm />);
        await fillValidForm();
        await userEvent.click(screen.getByRole("button", { name: /Create Account/ }));

        await waitFor(() => expect(handleRegisterUserMock).toHaveBeenCalled());
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/login"));
    });

    it("shows the server's error message on failed registration", async () => {
        handleRegisterUserMock.mockResolvedValue({ success: false, message: "Email already taken" });
        render(<RegisterForm />);
        await fillValidForm();
        await userEvent.click(screen.getByRole("button", { name: /Create Account/ }));

        expect(await screen.findByText("Email already taken")).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("toggles password visibility", async () => {
        render(<RegisterForm />);
        const passwordInput = screen.getAllByPlaceholderText("••••••••")[0];
        expect(passwordInput).toHaveAttribute("type", "password");
        const toggleButtons = screen.getAllByRole("button", { name: "" });
        await userEvent.click(toggleButtons[0]);
        expect(passwordInput).toHaveAttribute("type", "text");
    });
});
