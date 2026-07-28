import { describe, it, expect } from "vitest";
import { registerSchema } from "@/app/(auth)/register/schema";
import { loginSchema } from "@/app/(auth)/login/schema";

const validRegister = {
    email: "a@b.com",
    firstName: "A",
    lastName: "B",
    username: "abcuser",
    password: "Password1!",
    confirmPassword: "Password1!",
};

describe("registerSchema", () => {
    it("accepts valid data", () => {
        expect(registerSchema.safeParse(validRegister).success).toBe(true);
    });

    it("rejects an invalid email", () => {
        const result = registerSchema.safeParse({ ...validRegister, email: "notanemail" });
        expect(result.success).toBe(false);
    });

    it("rejects a username shorter than 3 characters", () => {
        const result = registerSchema.safeParse({ ...validRegister, username: "ab" });
        expect(result.success).toBe(false);
    });

    it("rejects mismatched passwords", () => {
        const result = registerSchema.safeParse({ ...validRegister, confirmPassword: "Different1!" });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].path).toContain("confirmPassword");
        }
    });

    it("rejects a missing first name", () => {
        const result = registerSchema.safeParse({ ...validRegister, firstName: "" });
        expect(result.success).toBe(false);
    });
});

describe("loginSchema", () => {
    it("accepts valid credentials", () => {
        expect(loginSchema.safeParse({ email: "a@b.com", password: "secret1" }).success).toBe(true);
    });

    it("rejects an invalid email", () => {
        expect(loginSchema.safeParse({ email: "nope", password: "secret1" }).success).toBe(false);
    });

    it("rejects a short password", () => {
        expect(loginSchema.safeParse({ email: "a@b.com", password: "abc" }).success).toBe(false);
    });
});
