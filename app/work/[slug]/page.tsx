import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  caseJsonLd,
  casePath,
  caseTitle,
  getCaseStudy,
  getProject,
  projectSlugs,
} from "@/entities/project";
import { siteConfig } from "@/shared/config";
import { JsonLd } from "@/shared/ui/json-ld";
import { CaseStudy } from "@/widgets/case-study";

type CasePageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const title = caseTitle(project);
  const description = getCaseStudy(slug)?.summary ?? project.summary;
  return {
    title,
    description,
    keywords: [project.sector, ...project.tech],
    alternates: { canonical: casePath(project) },
    openGraph: {
      title,
      description,
      type: "article",
      url: casePath(project),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      authors: [siteConfig.name],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const content = getCaseStudy(slug);
  return (
    <main>
      <JsonLd data={caseJsonLd(project, content?.summary ?? project.summary)} />
      <CaseStudy project={project} content={content} mode="page" />
    </main>
  );
}
