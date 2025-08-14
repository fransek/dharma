import { createConfig } from "../../rollup.config.mjs";

export default [
  createConfig("cjs", "dist/cjs", ["dharma-core", "react"]),
  createConfig("esm", "dist/esm", ["dharma-core", "react"]),
];
