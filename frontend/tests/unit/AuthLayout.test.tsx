import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthLayout from "@/app/(auth)/layout";

describe("AuthLayout", () => {
    it("renders marketing copy and page content", () => {
        render(
            <AuthLayout>
                <p>Login form</p>
            </AuthLayout>
        );
        expect(screen.getByText("Login form")).toBeInTheDocument();
        expect(screen.getByText("Earn passive income")).toBeInTheDocument();
    });
});
