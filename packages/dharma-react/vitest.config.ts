import path from "path";
import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    environment: "jsdom",
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "dharma-core": path.resolve(__dirname, "node_modules/dharma-core"),
    },
  },
});
