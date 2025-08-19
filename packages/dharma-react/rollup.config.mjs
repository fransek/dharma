import { createConfig, createDtsConfig } from "../../rollup.config.mjs";

const external = ["react"];

export default [
  createConfig("cjs", "dist/cjs", {
    external,
  }),
  createConfig("esm", "dist/esm", {
    external,
  }),
  createDtsConfig("dist", {
    includeExternal: ["dharma-core"],
  }),
];
