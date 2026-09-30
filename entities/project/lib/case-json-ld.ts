import { absoluteUrl, sections, siteConfig } from "@/shared/config";
import { personId } from "@/shared/lib";

import type { Project } from "../model/types";

export function caseTitle(project: Project): string {
  return `${project.sector}: ${project.headline.join(" ")}`;
}

export function casePath(project: Project) {
  return `/work/${project.slug}` as const;
}

export function caseJsonLd(project: Project, description: string) {
  const url = absoluteUrl(casePath(project));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        headline: caseTitle(project),
        description,
        inLanguage: "en",
        image: absoluteUrl(`${casePath(project)}/opengraph-image`),
        keywords: project.tech.join(", "),
        about: project.sector,
        author: { "@type": "Person", "@id": personId, name: siteConfig.name },
        publisher: { "@type": "Person", "@id": personId, name: siteConfig.name },
        mainEntityOfPage: url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          {
            "@type": "ListItem",
            position: 2,
            name: sections.work.label,
            item: absoluteUrl(`/#${sections.work.id}`),
          },
          { "@type": "ListItem", position: 3, name: project.sector, item: url },
        ],
      },
    ],
  };
}
