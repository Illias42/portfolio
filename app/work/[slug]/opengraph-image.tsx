import { notFound } from "next/navigation";

import { getProject, projectSlugs } from "@/entities/project";
import { ogImageSize, siteConfig } from "@/shared/config";
import { renderOgCard } from "@/shared/ui/og-card";

export const alt = `Case study by ${siteConfig.name}`;
export const size = ogImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return renderOgCard({
    eyebrow: `${project.number} / ${project.sector}`,
    title: project.headline,
    footer: `${siteConfig.name} · ${project.company}`,
  });
}
