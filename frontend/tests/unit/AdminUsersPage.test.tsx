import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

vi.mock("axios", async (importOriginal) => {
    const actual = await importOriginal<typeof import("axios")>();
    return {
        ...actual,
        default: {
            ...actual.default,
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
    };
});

import AdminUsersPage from "@/app/admin/users/page";

const sampleUser = {
    _id: "u1",
    firstName: "Alice",
    lastName: "Smith",
    username: "alicesmith",
    email: "alice@example.com",
    role: "user",
    createdAt: new Date().toISOString(),
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockResolvedValue({ data: { data: [sampleUser], meta: { total: 1, totalPages: 1 } } });
});

describe("AdminUsersPage", () => {
    it("lists users from the admin API", async () => {
        render(<AdminUsersPage />);
        expect(await screen.findByText("Alice Smith")).toBeInTheDocument();
        expect(screen.getByText(/@alicesmith/)).toBeInTheDocument();
    });

    it("shows an empty state when there are no users", async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { data: [], meta: { total: 0, totalPages: 1 } } });
        render(<AdminUsersPage />);
        expect(await screen.findByText(/No users found/)).toBeInTheDocument();
    });

    it("shows an error state when fetching fails", async () => {
        vi.mocked(axios.get).mockRejectedValue({ response: { data: { message: "Forbidden" } } });
        render(<AdminUsersPage />);
        expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    });

    it("creates a new user via the Add User form", async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });
        const { container } = render(<AdminUsersPage />);
        await screen.findByText("Alice Smith");

        await userEvent.click(screen.getByRole("button", { name: "Add User" }));
        await userEvent.type(container.querySelector('input[name="firstName"]')!, "Bob");
        await userEvent.type(container.querySelector('input[name="lastName"]')!, "Jones");
        await userEvent.type(container.querySelector('input[name="username"]')!, "bobjones");
        await userEvent.type(container.querySelector('input[name="email"]')!, "bob@example.com");
        await userEvent.type(container.querySelector('input[name="password"]')!, "Password1!");

        await userEvent.click(screen.getByRole("button", { name: "Save User" }));
        await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
            "/api/v1/admin/users",
            expect.objectContaining({ username: "bobjones" }),
            expect.anything()
        ));
    });

    it("deletes a user after confirming", async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: { success: true } });
        render(<AdminUsersPage />);
        await screen.findByText("Alice Smith");

        await userEvent.click(screen.getByTitle("Delete User"));
        expect(await screen.findByText(/Are you sure you want to delete Alice Smith/)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
            "/api/v1/admin/users/u1",
            expect.anything()
        ));
    });
});
