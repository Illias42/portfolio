import { telecomCase } from "./telecom-case";
import type { CaseStudyContent } from "./types";

const cases: readonly CaseStudyContent[] = [telecomCase];

export function getCaseStudy(slug: string): CaseStudyContent | undefined {
  return cases.find((entry) => entry.slug === slug);
}
