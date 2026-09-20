import { notFound } from "next/navigation";

import { getCaseStudy, getProject } from "@/src/entities/project";
import { CaseOverlay, CaseStudy } from "@/src/widgets/selected-work";

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
