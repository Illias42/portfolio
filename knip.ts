import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["app/**/*.{ts,tsx}", "steiger.config.ts", "src/shared/**/index.ts"],
  project: ["app/**/*.{ts,tsx,css}", "src/**/*.{ts,tsx,css}"],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
  ignoreDependencies: ["@react-three/drei", "@react-three/fiber", "three", "@types/three"],
};

export default config;
