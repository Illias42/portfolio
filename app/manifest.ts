import type { MetadataRoute } from "next";

import { siteConfig, staticPalette } from "@/shared/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: staticPalette.paper,
    theme_color: staticPalette.paper,
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
