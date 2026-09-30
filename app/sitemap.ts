import type { MetadataRoute } from "next";

import { casePath, projects } from "@/entities/project";
import { absoluteUrl } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    ...projects.map((project) => ({
      url: absoluteUrl(casePath(project)),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
