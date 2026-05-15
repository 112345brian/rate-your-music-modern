import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      ".claude/**",
      "assets/**",
      "playwright-report/**",
      "test-results/**",
      // src/* are concatenated into one script by scripts/build-js.mjs;
      // they share a scope and cross-reference, so per-file module
      // analysis is meaningless. The built rate-your-music-modern.js
      // at the repo root is what gets linted.
      "src/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
