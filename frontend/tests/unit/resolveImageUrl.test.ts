import { describe, it, expect } from "vitest";
import { resolveImageUrl } from "@/lib/api/axios-instance";

describe("resolveImageUrl", () => {
    it("returns null for a falsy path", () => {
        expect(resolveImageUrl(null)).toBeNull();
        expect(resolveImageUrl(undefined)).toBeNull();
        expect(resolveImageUrl("")).toBeNull();
    });

    it("returns absolute http(s) URLs unchanged", () => {
        expect(resolveImageUrl("https://example.com/avatar.png")).toBe("https://example.com/avatar.png");
        expect(resolveImageUrl("http://example.com/avatar.png")).toBe("http://example.com/avatar.png");
    });

    it("prepends the backend origin to a relative path", () => {
        const result = resolveImageUrl("/uploads/pic.jpg");
        expect(result).toMatch(/\/uploads\/pic\.jpg$/);
    });
});
