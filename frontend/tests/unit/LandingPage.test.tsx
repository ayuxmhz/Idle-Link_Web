import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserProvider } from "@/app/context/UserContext";
import LandingPage from "@/app/page";

describe("LandingPage", () => {
    it("renders the hero, stats, and feature sections", () => {
        render(
            <UserProvider>
                <LandingPage />
            </UserProvider>
        );
        expect(screen.getByText("For Sellers")).toBeInTheDocument();
        expect(screen.getByText("For Buyers")).toBeInTheDocument();
        expect(screen.getByText("Enterprise Security")).toBeInTheDocument();
        expect(screen.getByText(/Nodes Active/)).toBeInTheDocument();
    });
});
