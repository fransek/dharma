import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { Linter } from "eslint";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("prettier", "plugin:@typescript-eslint/recommended"),
  {
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    ignores: ["packages/*/dist/", "coverage/"],
  },
] satisfies Linter.Config[];
