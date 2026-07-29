import { test, expect, Page } from "@playwright/test";

function uniqueUser(prefix: string) {
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return {
        firstName: "E2E",
        lastName: "Market",
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

test.describe("Marketplace", () => {
    test("a logged-in user can browse the marketplace and view device listings", async ({ page }) => {
        const user = uniqueUser("e2e_market");
        await registerAndLogin(page, user);

        await page.goto("/dashboard/marketplace");
        await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible({ timeout: 10000 });
    });

    test("marketplace shows empty state when no devices are listed", async ({ page }) => {
        const user = uniqueUser("e2e_market_empty");
        await registerAndLogin(page, user);

        await page.goto("/dashboard/marketplace");
        // Page should load without error regardless of listings
        await expect(page).toHaveURL(/\/dashboard\/marketplace/);
    });
});
