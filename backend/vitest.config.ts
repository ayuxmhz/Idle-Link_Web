import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        env: { NODE_ENV: "test" },
        setupFiles: ["./tests/setup.ts"],
        testTimeout: 30000,
        hookTimeout: 30000,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/database/**", "src/configs/**"]
        }
    }
});
