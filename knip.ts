import type { KnipConfig } from "knip";

const config: KnipConfig = {
  // Routes are the real entry points, so unused slice public-API exports get reported.
  entry: ["app/**/*.{ts,tsx}", "steiger.config.ts", "shared/**/index.ts"],
  project: ["{app,_app,widgets,features,entities,shared}/**/*.{ts,tsx,css}"],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join("\n"),
  },
};

export default config;
