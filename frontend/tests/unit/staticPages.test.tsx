import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserProvider } from "@/app/context/UserContext";
import PrivacyPage from "@/app/privacy/page";
import DocumentationPage from "@/app/documentation/page";
import SupportPage from "@/app/support/page";
import RoadmapPage from "@/app/roadmap/page";

const withUser = (ui: React.ReactElement) => <UserProvider>{ui}</UserProvider>;

describe("static content pages", () => {
    it("renders the privacy page", () => {
        render(withUser(<PrivacyPage />));
        expect(screen.getByRole("heading", { name: /Privacy Policy/i })).toBeInTheDocument();
    });

    it("renders the documentation page", () => {
        render(withUser(<DocumentationPage />));
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it("renders the support page", () => {
        render(withUser(<SupportPage />));
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it("renders the roadmap page", () => {
        render(withUser(<RoadmapPage />));
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });
});
