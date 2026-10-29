import { fileURLToPath } from "node:url";
import { defineProject } from "vitest/config";

const coreSrc = fileURLToPath(new URL("../dharma-core/src", import.meta.url));

export default defineProject({
  // Test against the dharma-core source so no build is needed
  resolve: {
    alias: [
      { find: /^dharma-core$/, replacement: `${coreSrc}/index.ts` },
      { find: /^dharma-core\/(.*)$/, replacement: `${coreSrc}/lib/$1.ts` },
    ],
  },
  test: {
    environment: "jsdom",
  },
});
