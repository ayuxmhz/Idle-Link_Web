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
let mockUser: Record<string, unknown> = {
    firstName: "Jane", lastName: "Doe", email: "jane@example.com", phoneNumber: "",
    isEmailVerified: false, isPhoneVerified: false,
};
let mockLoading = false;
vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ user: mockUser, fetchUser: fetchUserMock, loading: mockLoading }),
}));

import EditProfilePage from "@/app/(protected)/profile/edit/page";

beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
        firstName: "Jane", lastName: "Doe", email: "jane@example.com", phoneNumber: "",
        isEmailVerified: false, isPhoneVerified: false,
    };
    mockLoading = false;
});

describe("EditProfilePage", () => {
    it("shows a loading spinner while the user context loads", () => {
        mockLoading = true;
        const { container } = render(<EditProfilePage />);
        expect(container.querySelector(".animate-spin")).toBeTruthy();
    });

    it("pre-fills the form from the current user", () => {
        render(<EditProfilePage />);
        expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
    });

    it("saves basic profile changes", async () => {
        vi.mocked(axios.put).mockResolvedValue({ data: { success: true } });
        render(<EditProfilePage />);

        const firstNameInput = screen.getByDisplayValue("Jane");
        await userEvent.clear(firstNameInput);
        await userEvent.type(firstNameInput, "Janet");
        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));

        await waitFor(() => expect(axios.put).toHaveBeenCalled());
        expect(await screen.findByText(/Profile details updated successfully!/)).toBeInTheDocument();
        expect(fetchUserMock).toHaveBeenCalled();
    });

    it("shows an error message on save failure", async () => {
        vi.mocked(axios.put).mockRejectedValue({ response: { data: { message: "Email taken" } } });
        render(<EditProfilePage />);
        await userEvent.click(screen.getByRole("button", { name: "Save Changes" }));
        expect(await screen.findByText(/Email taken/)).toBeInTheDocument();
    });

    it("sends and confirms an email verification code", async () => {
        vi.mocked(axios.post).mockImplementation((url: string) => {
            if (url === "/api/v1/auth/send-verification-email") {
                return Promise.resolve({ data: { data: { devCode: "111111" } } });
            }
            return Promise.resolve({ data: { success: true } });
        });
        render(<EditProfilePage />);

        await userEvent.click(screen.getByRole("button", { name: /Verify/ }));
        expect(await screen.findByText(/Dev Code: 111111/)).toBeInTheDocument();

        await userEvent.type(screen.getByPlaceholderText("123456"), "111111");
        await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

        await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
            "/api/v1/auth/verify-email", { code: "111111" }, expect.anything()
        ));
        expect(await screen.findByText(/Email address verified successfully!/)).toBeInTheDocument();
    });

    it("shows a note about phone verification when no phone is on file", () => {
        render(<EditProfilePage />);
        expect(screen.getByText(/Adding a phone number allows SMS-based verification/)).toBeInTheDocument();
    });

    it("offers phone verification once a phone number exists", async () => {
        mockUser = { ...mockUser, phoneNumber: "9800000000" };
        vi.mocked(axios.post).mockResolvedValue({ data: { data: { devCode: "222222" } } });
        render(<EditProfilePage />);

        const verifyButtons = screen.getAllByRole("button", { name: /Verify/ });
        await userEvent.click(verifyButtons[verifyButtons.length - 1]);
        expect(await screen.findByText(/Dev Code: 222222/)).toBeInTheDocument();
    });
});
