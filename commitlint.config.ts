import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
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
