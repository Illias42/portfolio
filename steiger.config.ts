import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  {
    ignores: ["node_modules/**", ".next/**", "public/**", "docs/**", ".claude/**"],
  },
  ...fsd.configs.recommended,
  {
    rules: {
      "fsd/typo-in-layer-name": "off",
      "fsd/insignificant-slice": "off",
    },
  },
  {
    files: ["./_app/**"],
    rules: {
      "fsd/segments-by-purpose": "off",
    },
  },
]);
