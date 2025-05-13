import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig as defineViteConfig, mergeConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig as defineVitestConfig } from "vitest/config";

const TEST_EXCLUDES = [...configDefaults.exclude, "src/index.tsx", "playground"];
const COVERAGE_EXCLUDE = [...TEST_EXCLUDES, "**/*.test.{ts,tsx}"];

const viteConfig = defineViteConfig({
  plugins: [tailwindcss(), solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    conditions: ["development", "browser"],
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    exclude: TEST_EXCLUDES,
    coverage: {
      all: true,
      provider: "istanbul",
      exclude: COVERAGE_EXCLUDE,
      thresholds: {
        "100": true,
      },
    },
  },
});

export default mergeConfig(viteConfig, vitestConfig);
