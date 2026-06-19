import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import deprecation from "eslint-plugin-deprecation";
import { fixupPluginRules } from "@eslint/compat";

const fixedDeprecation = fixupPluginRules(deprecation);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      deprecation: fixedDeprecation,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "deprecation/deprecation": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.config.mjs",
    "*.mjs",
    // Cloudflare adapter generated output:
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
