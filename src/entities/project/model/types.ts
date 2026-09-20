export type ProjectSlug = "telecom" | "mobility" | "connected-devices" | "computer-vision";

type ProjectVisual = "telecom" | "placeholder";

export interface Project {
  slug: ProjectSlug;
  number: string;
  sector: string;
  period: string;
  headline: readonly [string, string];
  summary: string;
  tech: readonly string[];
  role: string;
  company: string;
  visual: ProjectVisual;
  next: ProjectSlug;
}

interface SystemLayer {
  label: string;
  items: readonly string[];
}

export interface CaseSection {
  number: string;
  title: string;
  lead?: string;
  /** One short fact set in display type, e.g. the ~1M user scale. */
  highlight?: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
  decisions?: ReadonlyArray<{ title: string; body: string }>;
  system?: readonly SystemLayer[];
  stack?: readonly string[];
}

export interface CaseStudyContent {
  slug: ProjectSlug;
  sections: readonly CaseSection[];
}
