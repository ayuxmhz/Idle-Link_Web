import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const clearAuthCookiesMock = vi.fn();
vi.mock("@/lib/cookies", () => ({
    clearAuthCookies: (...args: unknown[]) => clearAuthCookiesMock(...args),
}));

import LogoutButton from "@/app/dashboard/LogoutButton";

beforeEach(() => vi.clearAllMocks());

describe("LogoutButton", () => {
    it("clears cookies and navigates home on click", async () => {
        render(<LogoutButton />);
        await userEvent.click(screen.getByRole("button", { name: /Log Out/ }));

        await waitFor(() => expect(clearAuthCookiesMock).toHaveBeenCalled());
        await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
        expect(refreshMock).toHaveBeenCalled();
    });
});
