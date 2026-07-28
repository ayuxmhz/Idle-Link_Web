import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserFormModal, { AdminUser } from "@/components/admin/UserFormModal";

const existingUser: AdminUser = {
    _id: "u1",
    firstName: "Jane",
    lastName: "Doe",
    username: "janedoe",
    email: "jane@example.com",
    role: "user",
    createdAt: "",
};

const field = (container: HTMLElement, name: string) =>
    container.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement;

describe("UserFormModal", () => {
    it("renders nothing when closed", () => {
        const { container } = render(
            <UserFormModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} initialData={null} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("shows 'Add New User' with blank, required password field when creating", () => {
        const { container } = render(
            <UserFormModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} initialData={null} />
        );
        expect(screen.getByText("Add New User")).toBeInTheDocument();
        expect(field(container, "password")).toBeRequired();
    });

    it("pre-fills fields and shows 'Edit User' when editing", () => {
        const { container } = render(
            <UserFormModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} initialData={existingUser} />
        );
        expect(screen.getByText("Edit User")).toBeInTheDocument();
        expect(field(container, "firstName")).toHaveValue("Jane");
        expect(field(container, "username")).toHaveValue("janedoe");
        expect(field(container, "email")).toHaveValue("jane@example.com");
        expect(field(container, "password")).not.toBeRequired();
    });

    it("submits the create form with entered values", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();
        const { container } = render(
            <UserFormModal isOpen onClose={onClose} onSubmit={onSubmit} initialData={null} />
        );

        await userEvent.type(field(container, "firstName"), "John");
        await userEvent.type(field(container, "lastName"), "Smith");
        await userEvent.type(field(container, "username"), "johnsmith");
        await userEvent.type(field(container, "email"), "john@example.com");
        await userEvent.type(field(container, "password"), "Sup3r$ecret");
        await userEvent.selectOptions(field(container, "role"), "admin");
        await userEvent.click(screen.getByRole("button", { name: "Save User" }));

        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith({
                firstName: "John",
                lastName: "Smith",
                username: "johnsmith",
                email: "john@example.com",
                password: "Sup3r$ecret",
                role: "admin",
            })
        );
        expect(onClose).toHaveBeenCalled();
    });

    it("omits the password field on edit when left blank", async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);
        render(<UserFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} initialData={existingUser} />);

        await userEvent.click(screen.getByRole("button", { name: "Save User" }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        const payload = onSubmit.mock.calls[0][0];
        expect(payload).not.toHaveProperty("password");
        expect(payload.email).toBe("jane@example.com");
    });

    it("shows an error message when submission fails", async () => {
        const onSubmit = vi.fn().mockRejectedValue(new Error("Username already taken"));
        const { container } = render(
            <UserFormModal isOpen onClose={vi.fn()} onSubmit={onSubmit} initialData={null} />
        );

        await userEvent.type(field(container, "firstName"), "John");
        await userEvent.type(field(container, "lastName"), "Smith");
        await userEvent.type(field(container, "username"), "johnsmith");
        await userEvent.type(field(container, "email"), "john@example.com");
        await userEvent.type(field(container, "password"), "Sup3r$ecret");
        await userEvent.click(screen.getByRole("button", { name: "Save User" }));

        expect(await screen.findByText("Username already taken")).toBeInTheDocument();
    });

    it("calls onClose when Cancel is clicked", async () => {
        const onClose = vi.fn();
        render(<UserFormModal isOpen onClose={onClose} onSubmit={vi.fn()} initialData={null} />);
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
        expect(onClose).toHaveBeenCalled();
    });
});
