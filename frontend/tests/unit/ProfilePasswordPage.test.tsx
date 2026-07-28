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

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

import PasswordUpdatePage from "@/app/(protected)/profile/password/page";

beforeEach(() => vi.clearAllMocks());

const fillForm = async (current: string, next: string, confirm: string) => {
    const [currentInput, newInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(currentInput, current);
    await userEvent.type(newInput, next);
    await userEvent.type(confirmInput, confirm);
};

describe("PasswordUpdatePage (user profile)", () => {
    it("updates the password and redirects to profile", async () => {
        vi.mocked(axios.put).mockResolvedValue({ data: { success: true } });
        render(<PasswordUpdatePage />);
        await fillForm("Old1234!", "NewPass1!", "NewPass1!");
        await userEvent.click(screen.getByRole("button", { name: /Update Password/ }));

        expect(await screen.findByText(/Password updated successfully/)).toBeInTheDocument();
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/profile"), { timeout: 3000 });
    });

    it("shows the server's error message on failure", async () => {
        vi.mocked(axios.put).mockRejectedValue({ response: { data: { message: "Incorrect current password" } } });
        render(<PasswordUpdatePage />);
        await fillForm("WrongPass1!", "NewPass1!", "NewPass1!");
        await userEvent.click(screen.getByRole("button", { name: /Update Password/ }));

        expect(await screen.findByText(/Incorrect current password/)).toBeInTheDocument();
    });
});
