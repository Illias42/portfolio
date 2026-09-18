import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      "fsd/typo-in-layer-name": "off",
      "fsd/insignificant-slice": "off",
    },
  },
  {
    files: ["./src/_app/**"],
    rules: {
      "fsd/segments-by-purpose": "off",
    },
  },
]);
