import { createConfig } from "../../rollup.config.mjs";

const external = ["dharma-core", "dharma-core/deeplyEquals", "react"];

export default [
  createConfig("cjs", "dist/cjs", {
    external,
  }),
  createConfig("esm", "dist/esm", {
    external,
  }),
];
