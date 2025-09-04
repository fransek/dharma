import typescript from "@rollup/plugin-typescript";

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
    ...output,
  },
  plugins: [
    typescript({
      compilerOptions: {
        declaration: true,
        declarationDir: dir,
      },
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
    }),
    ...(plugins || []),
  ],
  ...extendConfig,
});
