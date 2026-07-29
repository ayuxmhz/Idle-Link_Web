import { test, expect, Page } from "@playwright/test";

function uniqueUser(prefix: string) {
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return {
        firstName: "E2E",
        lastName: "Wallet",
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

test.describe("Wallet & Transactions", () => {
    test("a logged-in user can navigate to the wallet page and see their balance", async ({ page }) => {
        const user = uniqueUser("e2e_wallet");
        await registerAndLogin(page, user);

        await page.goto("/dashboard/wallet");
        await expect(page).toHaveURL(/\/dashboard\/wallet/, { timeout: 10000 });
        // Wallet balance should be visible (new user starts at NPR 0)
        await expect(page.getByText(/NPR/i)).toBeVisible({ timeout: 10000 });
    });

    test("wallet page renders the eSewa top-up option", async ({ page }) => {
        const user = uniqueUser("e2e_wallet_esewa");
        await registerAndLogin(page, user);

        await page.goto("/dashboard/wallet");
        await expect(page).toHaveURL(/\/dashboard\/wallet/);
        // eSewa deposit button should be present
        await expect(page.getByText(/deposit|top.?up|add funds/i)).toBeVisible({ timeout: 10000 });
    });
});
