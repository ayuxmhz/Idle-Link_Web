import { defineConfig, devices } from "@playwright/test";

// End-to-end tests run against the real dev servers (frontend + backend +
// MongoDB) rather than mocks — reuseExistingServer means these tests can
// run against servers already running locally during development, or spin
// up a fresh one in CI.
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    retries: 0,
    reporter: "list",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "bun run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60000,
    },
});
