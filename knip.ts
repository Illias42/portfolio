import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "app/**/*.{ts,tsx}",
    "steiger.config.ts",
    "shared/**/index.ts",
    "_app/**/index.ts",
    "widgets/*/index.ts",
  ],
  project: [
    "app/**/*.{ts,tsx,css}",
    "_app/**/*.{ts,tsx,css}",
    "{widgets,features,entities,shared}/**/*.{ts,tsx,css}",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
  ignoreDependencies: ["@react-three/drei", "@react-three/fiber", "three", "@types/three"],
};

export default config;
