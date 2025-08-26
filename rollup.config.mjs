import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

/**
 * @param {import('rollup').ModuleFormat} format
 * @param {string} dir
 * @param {import('rollup').RollupOptions} [extendConfig]
 * @returns {import('rollup').RollupOptions}
 */
export const createConfig = (
  format,
  dir,
  { output, plugins, ...extendConfig } = {},
) => ({
  input: "src/index.ts",
  output: {
    dir,
    format,
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: "src",
    exports: "named",
    ...output,
  },
  plugins: [
    nodeResolve({
      mainFields: [format === "esm" ? "module" : "main"],
    }),
    typescript({
      exclude: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    }),
    ...(plugins ?? []),
  ],
  ...extendConfig,
});

/**
 * @param {string} dir
 * @param {import('rollup-plugin-dts').Options} [dtsOptions]
 * @returns {import('rollup').RollupOptions}
 */
export const createDtsConfig = (dir, dtsOptions) => ({
  input: "src/index.ts",
  output: { dir, format: "esm" },
  plugins: [dts(dtsOptions)],
});
