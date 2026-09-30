import { notFound } from "next/navigation";

import { getCaseStudy, getProject } from "@/entities/project";
import { CaseOverlay } from "@/features/open-case";
import { CaseStudy } from "@/widgets/case-study";

export default async function CaseModal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return (
    <CaseOverlay
      key={slug}
      title={`${project.number} / ${project.sector} — ${project.headline.join(" ")}`}
    >
      <CaseStudy project={project} content={getCaseStudy(slug)} mode="overlay" />
    </CaseOverlay>
  );
}
