import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/axios-instance", () => ({
    default: { post: vi.fn() },
}));

import axiosInstance from "@/lib/api/axios-instance";
import { register, login, googleAuth, forgotPassword, resetPassword } from "@/lib/api/auth";
import type { RegisterFormData } from "@/app/(auth)/register/schema";
import type { LoginFormData } from "@/app/(auth)/login/schema";

const mockedAxios = axiosInstance as unknown as { post: ReturnType<typeof vi.fn> };

beforeEach(() => vi.clearAllMocks());

describe("auth api", () => {
    it("register posts data and returns response", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        const payload: RegisterFormData = {
            username: "u", email: "a@b.com", password: "Pass1234!", confirmPassword: "Pass1234!", firstName: "A", lastName: "B"
        };
        expect(await register(payload)).toEqual({ success: true });
    });

    it("register throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "email taken" } } });
        await expect(register({} as RegisterFormData)).rejects.toThrow("email taken");
    });

    it("login posts credentials and returns response", async () => {
        mockedAxios.post.mockResolvedValue({ data: { data: { token: "tok" } } });
        const result = await login({ email: "a@b.com", password: "x" });
        expect(result).toEqual({ data: { token: "tok" } });
    });

    it("login throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({});
        await expect(login({} as LoginFormData)).rejects.toThrow("Login failed");
    });

    it("googleAuth posts access token", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        expect(await googleAuth("tok")).toEqual({ success: true });
        expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/auth/google", { accessToken: "tok" });
    });

    it("googleAuth throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({});
        await expect(googleAuth("tok")).rejects.toThrow("Google sign-in failed");
    });

    it("forgotPassword posts email", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        expect(await forgotPassword("a@b.com")).toEqual({ success: true });
    });

    it("forgotPassword throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({});
        await expect(forgotPassword("a@b.com")).rejects.toThrow("Failed to send reset code");
    });

    it("resetPassword posts email/code/newPassword", async () => {
        mockedAxios.post.mockResolvedValue({ data: { success: true } });
        expect(await resetPassword("a@b.com", "123456", "NewPass1!")).toEqual({ success: true });
    });

    it("resetPassword throws on failure", async () => {
        mockedAxios.post.mockRejectedValue({ response: { data: { message: "bad code" } } });
        await expect(resetPassword("a@b.com", "000000", "NewPass1!")).rejects.toThrow("bad code");
    });
});
