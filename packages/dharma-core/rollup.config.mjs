import { createConfig, createDtsConfig } from "../../rollup.config.mjs";

export default [
  createConfig("cjs", "dist/cjs"),
  createConfig("esm", "dist/esm"),
  createDtsConfig("dist"),
];
