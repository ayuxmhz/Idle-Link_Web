import { test, expect } from "@playwright/test";

function uniqueUser(prefix: string) {
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return {
        firstName: "E2E",
        lastName: "Test",
        email: `${prefix}_${stamp}@example.com`,
        username: `${prefix}_${stamp}`,
        password: "Test1234!",
    };
}

test.describe("Registration and login", () => {
    test("a new user can register, is redirected to login, and can then log in", async ({ page }) => {
        const user = uniqueUser("e2e_register");

        await page.goto("/register");
        await page.getByPlaceholder("Enter First name").fill(user.firstName);
        await page.getByPlaceholder("Enter Last Name").fill(user.lastName);
        await page.getByPlaceholder("Enter username").fill(user.username);
        await page.getByPlaceholder("name@company.com").fill(user.email);
        await page.getByPlaceholder("••••••••").first().fill(user.password);
        await page.getByPlaceholder("••••••••").nth(1).fill(user.password);
        await page.getByRole("button", { name: "Create Account" }).click();

        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

        await page.getByPlaceholder("name@company.com").fill(user.email);
        await page.getByPlaceholder("••••••••").fill(user.password);
        await page.getByRole("button", { name: "Log In" }).click();

        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
        await expect(page.getByText("No active jobs right now")).toBeVisible();
    });

    test("rejects a weak password at registration", async ({ page }) => {
        const user = uniqueUser("e2e_weak");

        await page.goto("/register");
        await page.getByPlaceholder("Enter First name").fill(user.firstName);
        await page.getByPlaceholder("Enter Last Name").fill(user.lastName);
        await page.getByPlaceholder("Enter username").fill(user.username);
        await page.getByPlaceholder("name@company.com").fill(user.email);
        await page.getByPlaceholder("••••••••").first().fill("aaaaaa");
        await page.getByPlaceholder("••••••••").nth(1).fill("aaaaaa");
        await page.getByRole("button", { name: "Create Account" }).click();

        // Weak password should be rejected client-side — stays on /register.
        await expect(page).toHaveURL(/\/register/);
        await expect(page.getByText(/password must/i)).toBeVisible();
    });

    test("shows an error for invalid login credentials", async ({ page }) => {
        await page.goto("/login");
        await page.getByPlaceholder("name@company.com").fill("nonexistent_user_e2e@example.com");
        await page.getByPlaceholder("••••••••").fill("WrongPass1!");
        await page.getByRole("button", { name: "Log In" }).click();

        await expect(page.getByText(/invalid email|login failed/i)).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/\/login/);
    });
});
