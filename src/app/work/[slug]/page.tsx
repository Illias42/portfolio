import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCaseStudy, getProject, projectSlugs } from "@/src/entities/project";
import { siteConfig } from "@/src/shared/config";
import { CaseStudy } from "@/src/widgets/selected-work";

type CasePageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = `${project.sector}: ${project.headline.join(" ")} | ${siteConfig.name}`;
  return {
    title,
    description: project.summary,
    openGraph: { title, description: project.summary, type: "article" },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return (
    <main>
      <CaseStudy project={project} content={getCaseStudy(slug)} mode="page" />
    </main>
  );
}
