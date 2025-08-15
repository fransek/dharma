import typescript from "@rollup/plugin-typescript";

/**
 * @param {import('rollup').ModuleFormat} format
 * @param {string} dir
 * @param {import('rollup').RollupOptions} [extendConfig]
 * @returns {import('rollup').RollupOptions}
 */
export const createConfig = (format, dir, extendConfig = {}) => ({
  input: "src/index.ts",
  output: {
    dir,
    format,
    sourcemap: true,
    preserveModules: true,
  },
  plugins: [
    typescript({
      compilerOptions: {
        declarationDir: dir,
        emitDeclarationOnly: true,
      },
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
    }),
  ],
  ...extendConfig,
});
