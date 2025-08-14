import typescript from "@rollup/plugin-typescript";

/** @type {() => import('rollup').RollupOptions} */
export const createConfig = (format, dir, external) => ({
  input: "src/index.ts",
  external,
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
});
