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

import AdminPasswordUpdatePage from "@/app/admin/settings/password/page";

beforeEach(() => vi.clearAllMocks());

const fillForm = async (current: string, next: string, confirm: string) => {
    const [currentInput, newInput, confirmInput] = screen.getAllByPlaceholderText("••••••••");
    await userEvent.type(currentInput, current);
    await userEvent.type(newInput, next);
    await userEvent.type(confirmInput, confirm);
};

describe("AdminPasswordUpdatePage", () => {
    it("rejects a weak new password client-side", async () => {
        render(<AdminPasswordUpdatePage />);
        await fillForm("Old1234!", "weak", "weak");
        await userEvent.click(screen.getByRole("button", { name: /Update Password/ }));

        expect(await screen.findByText(/at least 8 characters/)).toBeInTheDocument();
        expect(axios.put).not.toHaveBeenCalled();
    });

    it("rejects mismatched new passwords", async () => {
        render(<AdminPasswordUpdatePage />);
        await fillForm("Old1234!", "NewPass1!", "Different1!");
        await userEvent.click(screen.getByRole("button", { name: /Update Password/ }));

        expect(await screen.findByText(/New passwords do not match\./)).toBeInTheDocument();
        expect(axios.put).not.toHaveBeenCalled();
    });

    it("updates the password and redirects to admin settings", async () => {
        vi.mocked(axios.put).mockResolvedValue({ data: { success: true } });
        render(<AdminPasswordUpdatePage />);
        await fillForm("Old1234!", "NewPass1!", "NewPass1!");
        await userEvent.click(screen.getByRole("button", { name: /Update Password/ }));

        expect(await screen.findByText(/Password updated successfully/)).toBeInTheDocument();
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/settings"), { timeout: 3000 });
    });

    it("shows the server's error message on failure", async () => {
        vi.mocked(axios.put).mockRejectedValue({ response: { data: { message: "Incorrect current password" } } });
        render(<AdminPasswordUpdatePage />);
        await fillForm("WrongPass1!", "NewPass1!", "NewPass1!");
        await userEvent.click(screen.getByRole("button", { name: /Update Password/ }));

        expect(await screen.findByText(/Incorrect current password/)).toBeInTheDocument();
    });
});
