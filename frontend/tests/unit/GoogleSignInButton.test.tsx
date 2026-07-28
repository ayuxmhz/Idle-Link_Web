import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/context/UserContext", () => ({
    useUser: () => ({ setUser: vi.fn() }),
}));

import GoogleSignInButton from "@/components/GoogleSignInButton";

describe("GoogleSignInButton", () => {
    it("renders nothing when no Google client id is configured", () => {
        const { container } = render(<GoogleSignInButton />);
        if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
            expect(screen.getByRole("button", { name: /Continue with Google/ })).toBeInTheDocument();
        } else {
            expect(container).toBeEmptyDOMElement();
        }
    });
});
