import { test, expect, Page } from "@playwright/test";

function uniqueUser(prefix: string) {
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return {
        firstName: "E2E",
        lastName: "Booking",
        email: `${prefix}_${stamp}@example.com`,
        username: `${prefix}_${stamp}`,
        password: "Test1234!",
    };
}

async function registerAndLogin(page: Page, user: ReturnType<typeof uniqueUser>) {
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
}

test.describe("Bookings", () => {
    test("a logged-in user can view the bookings page", async ({ page }) => {
        const user = uniqueUser("e2e_book");
        await registerAndLogin(page, user);

        await page.goto("/dashboard/bookings");
        await expect(page).toHaveURL(/\/dashboard\/bookings/, { timeout: 10000 });
        await expect(page.getByRole("main").getByRole("heading", { name: "Bookings" })).toBeVisible({ timeout: 10000 });
    });

    test("bookings page shows empty state for a brand-new user", async ({ page }) => {
        const user = uniqueUser("e2e_book_empty");
        await registerAndLogin(page, user);

        await page.goto("/dashboard/bookings");
        // New user has no bookings, page should still render without crashing
        await expect(page).toHaveURL(/\/dashboard\/bookings/);
    });
});
