import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: [
    "src/app/**/*.{ts,tsx}",
    "steiger.config.ts",
    "src/shared/**/index.ts",
    "src/widgets/*/index.ts",
    "public/fonts/index.ts",
  ],
  project: [
    "src/app/**/*.{ts,tsx,css}",
    "public/fonts/*.{ts,tsx}",
    "src/{widgets,features,entities,shared}/**/*.{ts,tsx,css}",
  ],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
  ignoreDependencies: ["@react-three/drei", "@react-three/fiber", "three", "@types/three"],
};

export default config;
