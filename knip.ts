import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["app/**/*.{ts,tsx}", "steiger.config.ts"],
  project: ["app/**/*.{ts,tsx,css}", "src/**/*.{ts,tsx,css}"],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
};

export default config;
