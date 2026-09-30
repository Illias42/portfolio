export interface Role {
  id: string;
  period: { start: string; end: string; label: string };
  company: string;
  title: string;
  domains: readonly string[];
  summary: string;
  /** Open-source work delivered as part of the role. */
  openSource?: { project: string; href: string; summary: string };
  current: boolean;
}

export const roles: readonly Role[] = [
  {
    id: "kevych",
    period: { start: "2024-01", end: "", label: "Jan 2024 – Present" },
    company: "Kevych Solutions",
    title: "Full Stack Engineer",
    domains: ["Telecom", "Mobility", "IoT", "Healthcare", "ERP"],
    summary:
      "Node.js and NestJS services across telecom, mobility and IoT, plus React and Next.js admin dashboards and partners pages. Architecture standards, production delivery and backend mentoring.",
    openSource: {
      project: "GrowthBook PHP SDK",
      href: "https://github.com/growthbook/growthbook-php",
      summary:
        "Remote evaluation, ETag caching, a tracking plugin system, sticky bucketing storage and the immutable 2.0 API for the official SDK.",
    },
    current: true,
  },
  {
    id: "appexoft",
    period: { start: "2021-07", end: "2024-01", label: "Jul 2021 – Jan 2024" },
    company: "Appexoft",
    title: "Full Stack Engineer",
    domains: ["Computer vision", "Retail", "Mobile"],
    summary:
      "Built React Native and Node.js products for fuel-price recognition and retail pricing, including mobile POS price updates.",
    current: false,
  },
];
