import { test, expect, Page } from "@playwright/test";

function uniqueUser(prefix: string) {
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    return {
        firstName: "E2E",
        lastName: "Inventory",
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

test.describe("Device inventory (insert, update, delete, retrieve)", () => {
    test("a user can list, edit, and delete a device", async ({ page }) => {
        const user = uniqueUser("e2e_inv");
        await registerAndLogin(page, user);

        await page.goto("/dashboard/inventory");
        await expect(page.getByText("My Devices")).toBeVisible();

        // --- Insert ---
        await page.getByRole("button", { name: "Add Device" }).click();
        await page.locator('input[name="name"]').fill("E2E Test Device");
        await page.locator('input[name="cpu"]').fill("Ryzen 7");
        await page.locator('input[name="gpu"]').fill("RTX 4050");
        await page.locator('input[name="ramGB"]').fill("16");
        await page.locator('input[name="storageGB"]').fill("512");
        await page.locator('input[name="hourlyRate"]').fill("5");
        await page.getByRole("button", { name: "Save Device" }).click();

        // --- Retrieve ---
        await expect(page.getByText("E2E Test Device")).toBeVisible({ timeout: 10000 });

        // --- Update ---
        const deviceCard = page.locator("div", { has: page.getByText("E2E Test Device", { exact: true }) }).first();
        await deviceCard.getByTitle("Edit").click();
        await page.locator('input[name="hourlyRate"]').fill("9.5");
        await page.getByRole("button", { name: "Save Device" }).click();
        await expect(page.getByText("NPR 9.5/hr")).toBeVisible({ timeout: 10000 });

        // --- Delete ---
        const updatedCard = page.locator("div", { has: page.getByText("E2E Test Device", { exact: true }) }).first();
        await updatedCard.getByTitle("Delete").click();
        await page.getByText("Are you sure you want to delete").waitFor();
        await page.locator("button.bg-red-500\\/20").click();
        await page.getByText("Are you sure you want to delete").waitFor({ state: "hidden" });
        await expect(page.getByRole("heading", { name: "E2E Test Device" })).not.toBeVisible({ timeout: 10000 });
    });
});
