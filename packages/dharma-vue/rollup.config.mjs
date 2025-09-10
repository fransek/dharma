import { createConfig } from "../../rollup.config.mjs";

const external = ["dharma-core", "vue"];

export default [
  createConfig("cjs", "dist/cjs", {
    external,
  }),
  createConfig("esm", "dist/esm", {
    external,
  }),
];
