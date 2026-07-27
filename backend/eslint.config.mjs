import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "public/**"],
  },
  {
    rules: {
      // The codebase deliberately uses `any` at controller/service
      // boundaries where Express's req.user (attached by middleware) and
      // caught errors don't have a shared narrow type — tightening this
      // would require a larger refactor than the current scope calls for.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  }
);
