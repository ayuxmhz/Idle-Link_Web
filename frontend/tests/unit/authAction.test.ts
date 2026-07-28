import { describe, it, expect, vi, beforeEach } from "vitest";

const registerMock = vi.fn();
const loginMock = vi.fn();
const googleAuthMock = vi.fn();
vi.mock("@/lib/api/auth", () => ({
    register: (...args: unknown[]) => registerMock(...args),
    login: (...args: unknown[]) => loginMock(...args),
    googleAuth: (...args: unknown[]) => googleAuthMock(...args),
}));

const setTokenCookieMock = vi.fn();
const storeUserDataMock = vi.fn();
vi.mock("@/lib/cookies", () => ({
    setTokenCookie: (...args: unknown[]) => setTokenCookieMock(...args),
    storeUserData: (...args: unknown[]) => storeUserDataMock(...args),
}));

import { handleRegisterUser, handleLoginUser, handleGoogleAuth } from "@/lib/actions/auth-action";
import type { RegisterFormData } from "@/app/(auth)/register/schema";
import type { LoginFormData } from "@/app/(auth)/login/schema";

beforeEach(() => vi.clearAllMocks());

describe("handleRegisterUser", () => {
    it("returns success on a successful registration", async () => {
        registerMock.mockResolvedValue({ success: true, message: "ok", data: { _id: "1" } });
        const result = await handleRegisterUser({} as RegisterFormData);
        expect(result).toEqual({ success: true, message: "ok", data: { _id: "1" } });
    });

    it("returns failure when the backend reports failure", async () => {
        registerMock.mockResolvedValue({ success: false, message: "Email taken" });
        const result = await handleRegisterUser({} as RegisterFormData);
        expect(result).toEqual({ success: false, message: "Email taken" });
    });

    it("returns failure when register throws", async () => {
        registerMock.mockRejectedValue(new Error("Network error"));
        const result = await handleRegisterUser({} as RegisterFormData);
        expect(result).toEqual({ success: false, message: "Network error" });
    });
});

describe("handleLoginUser", () => {
    it("stores cookies and returns success on successful login", async () => {
        loginMock.mockResolvedValue({ success: true, message: "ok", data: { token: "tok", user: { _id: "1" } } });
        const result = await handleLoginUser({} as LoginFormData);
        expect(setTokenCookieMock).toHaveBeenCalledWith("tok");
        expect(storeUserDataMock).toHaveBeenCalledWith({ _id: "1" });
        expect(result.success).toBe(true);
    });

    it("does not store cookies on failed login", async () => {
        loginMock.mockResolvedValue({ success: false, message: "Invalid password" });
        const result = await handleLoginUser({} as LoginFormData);
        expect(setTokenCookieMock).not.toHaveBeenCalled();
        expect(result).toEqual({ success: false, message: "Invalid password" });
    });

    it("returns failure when login throws", async () => {
        loginMock.mockRejectedValue(new Error("Server down"));
        const result = await handleLoginUser({} as LoginFormData);
        expect(result).toEqual({ success: false, message: "Server down" });
    });
});

describe("handleGoogleAuth", () => {
    it("stores cookies and returns success", async () => {
        googleAuthMock.mockResolvedValue({ success: true, message: "ok", data: { token: "tok", user: { _id: "1" } } });
        const result = await handleGoogleAuth("access-token");
        expect(setTokenCookieMock).toHaveBeenCalledWith("tok");
        expect(result.success).toBe(true);
    });

    it("returns failure when google auth throws", async () => {
        googleAuthMock.mockRejectedValue(new Error("Bad token"));
        const result = await handleGoogleAuth("access-token");
        expect(result).toEqual({ success: false, message: "Bad token" });
    });
});
