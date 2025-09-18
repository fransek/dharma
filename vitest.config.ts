import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/*"],
    environment: "jsdom",
    include: ["**/src/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["packages/**/src/**/*.{ts,tsx}"],
      exclude: ["packages/**/index.{ts,tsx}", "**/*.test.{ts,tsx}"],
      reporter: ["text", "json", "html"],
    },
  },
});
