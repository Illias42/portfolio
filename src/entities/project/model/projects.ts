import type { Project, ProjectSlug } from "./types";

// Facts come from docs/content/resume.md — rewrite tone, never substance.
export const projects: readonly Project[] = [
  {
    slug: "telecom",
    number: "01",
    sector: "Telecom",
    period: "2024—NOW",
    headline: ["Infrastructure", "behind ~1M users."],
    summary: "Backend services for eSIM, phone number provisioning, call routing and VPN.",
    tech: ["Node.js", "NestJS", "SIP", "VoIP", "PostgreSQL", "Redis"],
    role: "Full-Stack Developer",
    company: "Kevych Solutions",
    visual: "telecom",
    next: "mobility",
  },
  {
    slug: "mobility",
    number: "02",
    sector: "Mobility",
    period: "2024—NOW",
    headline: ["Real-time systems", "that keep moving."],
    summary:
      "Event-driven refactor of a legacy ride-hailing backend with a Node.js WebSocket layer for live ride tracking.",
    tech: ["Node.js", "WebSockets", "Event-driven"],
    role: "Full-Stack Developer",
    company: "Kevych Solutions",
    visual: "placeholder",
    next: "connected-devices",
  },
  {
    slug: "connected-devices",
    number: "03",
    sector: "Connected devices",
    period: "2024—NOW",
    headline: ["Remote control", "for connected devices."],
    summary:
      "MQTT-based device control through AWS IoT Core for real-time remote management of connected devices.",
    tech: ["MQTT", "AWS IoT Core", "Node.js"],
    role: "Full-Stack Developer",
    company: "Kevych Solutions",
    visual: "placeholder",
    next: "computer-vision",
  },
  {
    slug: "computer-vision",
    number: "04",
    sector: "Computer vision",
    period: "2021—2024",
    headline: ["Reading fuel prices", "from the roadside."],
    summary:
      "Mobile and backend components of a computer-vision system recognising competitor fuel prices from roadside signage.",
    tech: ["React Native", "Node.js", "NestJS"],
    role: "Full-Stack Developer",
    company: "Appexoft",
    visual: "placeholder",
    next: "telecom",
  },
];

export const projectSlugs: readonly ProjectSlug[] = projects.map((project) => project.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
