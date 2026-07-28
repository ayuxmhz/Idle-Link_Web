import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import axios from "axios";
import Cookies from "js-cookie";

vi.mock("axios", async (importOriginal) => {
    const actual = await importOriginal<typeof import("axios")>();
    return {
        ...actual,
        default: { ...actual.default, get: vi.fn() },
    };
});

vi.mock("js-cookie", () => ({
    default: { get: vi.fn(), remove: vi.fn() },
}));

const clearAuthCookiesMock = vi.fn();
vi.mock("@/lib/cookies", () => ({
    clearAuthCookies: () => clearAuthCookiesMock(),
}));

import { UserProvider, useUser } from "@/app/context/UserContext";

function Consumer() {
    const { user, loading, logout } = useUser();
    if (loading) return <p>Loading…</p>;
    return (
        <div>
            <p>{user ? `Hello ${user.firstName}` : "No user"}</p>
            <button onClick={logout}>Log out</button>
        </div>
    );
}

const originalLocation = window.location;

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Cookies.get).mockReturnValue(undefined);
    Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...originalLocation, href: "" },
    });
});

describe("UserProvider", () => {
    it("shows no user when there is no auth token", async () => {
        render(
            <UserProvider>
                <Consumer />
            </UserProvider>
        );
        expect(await screen.findByText("No user")).toBeInTheDocument();
        expect(axios.get).not.toHaveBeenCalled();
    });

    it("confirms the session via whoami using the stored token", async () => {
        vi.mocked(Cookies.get).mockImplementation((key: string) => {
            if (key === "auth_token") return "token123";
            if (key === "user_data") return JSON.stringify({ firstName: "Cached" });
            return undefined;
        });
        vi.mocked(axios.get).mockResolvedValue({ data: { data: { firstName: "Jane" } } });

        render(
            <UserProvider>
                <Consumer />
            </UserProvider>
        );

        expect(await screen.findByText("Hello Jane")).toBeInTheDocument();
        expect(axios.get).toHaveBeenCalledWith(
            "/api/v1/auth/whoami",
            expect.objectContaining({ headers: { Authorization: "Bearer token123" } })
        );
    });

    it("clears the session on a 401 from whoami", async () => {
        vi.mocked(Cookies.get).mockImplementation((key: string) => (key === "auth_token" ? "expired" : undefined));
        vi.mocked(axios.get).mockRejectedValue({ response: { status: 401 } });

        render(
            <UserProvider>
                <Consumer />
            </UserProvider>
        );

        await waitFor(() => expect(screen.getByText("No user")).toBeInTheDocument());
        expect(Cookies.remove).toHaveBeenCalledWith("auth_token");
        expect(Cookies.remove).toHaveBeenCalledWith("user_data");
    });

    it("keeps the session on a non-401 error (e.g. server hiccup)", async () => {
        vi.mocked(Cookies.get).mockImplementation((key: string) => {
            if (key === "auth_token") return "token123";
            if (key === "user_data") return JSON.stringify({ firstName: "Cached" });
            return undefined;
        });
        vi.mocked(axios.get).mockRejectedValue({ response: { status: 500 } });

        render(
            <UserProvider>
                <Consumer />
            </UserProvider>
        );

        await screen.findByText("Hello Cached");
        expect(Cookies.remove).not.toHaveBeenCalled();
    });

    it("clears cookies and redirects to /login on logout", async () => {
        render(
            <UserProvider>
                <Consumer />
            </UserProvider>
        );
        await screen.findByText("No user");

        await act(async () => {
            screen.getByRole("button", { name: "Log out" }).click();
        });

        expect(Cookies.remove).toHaveBeenCalledWith("auth_token");
        expect(clearAuthCookiesMock).toHaveBeenCalled();
        expect(window.location.href).toBe("/login");
    });
});
