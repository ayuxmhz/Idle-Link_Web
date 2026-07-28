import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/login/LoginForm";

const setUserMock = vi.fn();

vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ setUser: setUserMock }),
}));

const handleLoginUserMock = vi.fn();
vi.mock("@/lib/actions/auth-action", () => ({
    handleLoginUser: (...args: unknown[]) => handleLoginUserMock(...args),
}));

describe("LoginForm", () => {
    beforeEach(() => {
        setUserMock.mockClear();
        handleLoginUserMock.mockReset();
    });

    it("shows validation errors when submitted empty", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.click(screen.getByRole("button", { name: /log in/i }));

        expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
        expect(handleLoginUserMock).not.toHaveBeenCalled();
    });

    it("submits valid credentials and stores the user on success", async () => {
        const user = userEvent.setup();
        handleLoginUserMock.mockResolvedValue({
            success: true,
            data: { token: "fake-token", user: { _id: "1", role: "user", email: "a@b.com" } },
        });

        render(<LoginForm />);
        await user.type(screen.getByPlaceholderText("name@company.com"), "a@b.com");
        await user.type(screen.getByPlaceholderText("••••••••"), "Test1234!");
        await user.click(screen.getByRole("button", { name: /log in/i }));

        await waitFor(() => {
            expect(handleLoginUserMock).toHaveBeenCalledWith({ email: "a@b.com", password: "Test1234!" });
        });
        await waitFor(() => {
            expect(setUserMock).toHaveBeenCalledWith({ _id: "1", role: "user", email: "a@b.com" });
        });
    });

    it("shows the server's error message on failed login", async () => {
        const user = userEvent.setup();
        handleLoginUserMock.mockResolvedValue({ success: false, message: "Invalid password" });

        render(<LoginForm />);
        await user.type(screen.getByPlaceholderText("name@company.com"), "a@b.com");
        await user.type(screen.getByPlaceholderText("••••••••"), "Test1234!");
        await user.click(screen.getByRole("button", { name: /log in/i }));

        expect(await screen.findByText("Invalid password")).toBeInTheDocument();
        expect(setUserMock).not.toHaveBeenCalled();
    });
});
