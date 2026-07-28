import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserProvider } from "@/app/context/UserContext";
import HeroSection from "@/components/HeroSection";
import GetStartedSection from "@/components/GetStartedSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RecommendedActions from "@/components/dashboard/RecommendedActions";

const withUser = (ui: React.ReactElement) => <UserProvider>{ui}</UserProvider>;

describe("static marketing / layout components", () => {
    it("renders HeroSection", () => {
        render(<HeroSection />);
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it("renders GetStartedSection", () => {
        render(<GetStartedSection />);
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it("renders HowItWorksSection", () => {
        render(<HowItWorksSection />);
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it("renders Footer", () => {
        render(<Footer />);
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it("renders Navbar", () => {
        render(withUser(<Navbar />));
        expect(document.body.textContent?.length).toBeGreaterThan(0);
    });

    it("renders RecommendedActions with Add Device and View Earnings links", () => {
        render(<RecommendedActions />);
        expect(screen.getByText("Add Device")).toBeInTheDocument();
        expect(screen.getByText("View Earnings")).toBeInTheDocument();
    });
});
