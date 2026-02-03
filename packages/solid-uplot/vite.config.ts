import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { configDefaults } from "vitest/config";

const TEST_EXCLUDES = [...configDefaults.exclude, "src/index.tsx"];
const COVERAGE_EXCLUDE = [...TEST_EXCLUDES, "**/*.test.{ts,tsx}"];

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    conditions: ["development", "browser"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    exclude: TEST_EXCLUDES,
    coverage: {
      provider: "istanbul",
      exclude: COVERAGE_EXCLUDE,
      thresholds: {
        "100": true,
      },
    },
  },
});
