import { describe, it, expect, vi, beforeEach } from "vitest";

const store = new Map<string, string>();
const cookieStore = {
    set: vi.fn(({ name, value }: { name: string; value: string }) => {
        store.set(name, value);
    }),
    get: vi.fn((name: string) => (store.has(name) ? { value: store.get(name) } : undefined)),
    delete: vi.fn((name: string) => {
        store.delete(name);
    }),
};

vi.mock("next/headers", () => ({
    cookies: vi.fn(async () => cookieStore),
}));

import { setTokenCookie, getTokenCookie, storeUserData, getUserData, clearAuthCookies } from "@/lib/cookies";

beforeEach(() => {
    store.clear();
    vi.clearAllMocks();
});

describe("cookies", () => {
    it("sets and reads the auth token", async () => {
        await setTokenCookie("tok-123");
        expect(await getTokenCookie()).toBe("tok-123");
    });

    it("returns undefined when no token is set", async () => {
        expect(await getTokenCookie()).toBeUndefined();
    });

    it("stores and retrieves user data as JSON", async () => {
        await storeUserData({ id: "1", username: "alice" });
        expect(await getUserData()).toEqual({ id: "1", username: "alice" });
    });

    it("returns null when no user data is stored", async () => {
        expect(await getUserData()).toBeNull();
    });

    it("clears both auth cookies", async () => {
        await setTokenCookie("tok-123");
        await storeUserData({ id: "1" });
        await clearAuthCookies();
        expect(cookieStore.delete).toHaveBeenCalledWith("auth_token");
        expect(cookieStore.delete).toHaveBeenCalledWith("user_data");
    });
});
