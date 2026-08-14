import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 100,
  ignorePatterns: ["coverage/", "dist/", "test-results/", "bun.lock"],
});
