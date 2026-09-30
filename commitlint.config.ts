import type { UserConfig } from "@commitlint/types";

const AI_ATTRIBUTION = /^\s*co-authored-by:|generated with \[claude code\]/im;

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-ai-attribution": ({ raw }) => [
          !AI_ATTRIBUTION.test(raw ?? ""),
          "remove Co-Authored-By / Generated with Claude attribution",
        ],
      },
    },
  ],
  rules: {
    "no-ai-attribution": [2, "always"],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [0],
    "scope-case": [2, "always", "kebab-case"],
    "scope-enum": [
      1,
      "always",
      [
        "app",
        "pages",
        "widgets",
        "features",
        "entities",
        "shared",
        "config",
        "deps",
        "ci",
        "claude",
        "docs",
      ],
    ],
  },
};

export default config;
