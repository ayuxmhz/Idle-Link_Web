import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup.ts"],
        css: true,
        testTimeout: 15000,
        exclude: ["node_modules/**", "e2e/**", ".next/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.{ts,tsx}"],
        },
    },
});
