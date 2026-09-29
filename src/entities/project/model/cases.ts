import { computerVisionCase } from "./computer-vision-case";
import { connectedDevicesCase } from "./connected-devices-case";
import { mobilityCase } from "./mobility-case";
import { telecomCase } from "./telecom-case";
import type { CaseStudyContent } from "./types";

const cases: readonly CaseStudyContent[] = [
  telecomCase,
  mobilityCase,
  connectedDevicesCase,
  computerVisionCase,
];

export function getCaseStudy(slug: string): CaseStudyContent | undefined {
  return cases.find((entry) => entry.slug === slug);
}
