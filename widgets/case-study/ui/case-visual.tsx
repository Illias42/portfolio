"use client";

import { ProjectVisual, type Project } from "@/entities/project";
import { useCaseSettled } from "@/features/open-case";

export function CaseVisual({ visual }: { visual: Project["visual"] }) {
  const settled = useCaseSettled();
  return <ProjectVisual visual={visual} variant="case" active hold={!settled} />;
}
