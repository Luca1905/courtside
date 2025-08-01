import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import teslint from "typescript-eslint";

export default teslint.config([
  eslint.configs.recommended,
  teslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: ["dist/*", "convex/_generated/*"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
