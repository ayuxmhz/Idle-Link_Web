import { describe, it, expect } from "vitest";
import { passwordSchema } from "@/lib/passwordSchema";

describe("passwordSchema", () => {
    it("accepts a password with letters, digits, and a special character", () => {
        const result = passwordSchema.safeParse("Test1234!");
        expect(result.success).toBe(true);
    });

    it("rejects a password shorter than 8 characters", () => {
        const result = passwordSchema.safeParse("Ab1!");
        expect(result.success).toBe(false);
    });

    it("rejects a password with no digit", () => {
        const result = passwordSchema.safeParse("Abcdefgh!");
        expect(result.success).toBe(false);
    });

    it("rejects a password with no special character", () => {
        const result = passwordSchema.safeParse("Abcdefgh1");
        expect(result.success).toBe(false);
    });

    it("rejects a purely numeric password like 000000", () => {
        const result = passwordSchema.safeParse("000000");
        expect(result.success).toBe(false);
    });

    it("rejects a purely alphabetic password like aaaaa", () => {
        const result = passwordSchema.safeParse("aaaaa");
        expect(result.success).toBe(false);
    });
});
