import type { Project, ProjectSlug } from "./types";

export const projects: readonly Project[] = [
  {
    slug: "telecom",
    number: "01",
    sector: "Telecom",
    period: "2024—NOW",
    headline: ["Infrastructure", "behind ~1M users."],
    summary:
      "eSIM, numbers, calls and VPN for ~1M users. Provider integrations that never double-provision on retries.",
    tech: ["Node.js", "NestJS", "SIP", "VoIP", "PostgreSQL", "Redis"],
    role: "Full Stack Engineer",
    company: "Kevych Solutions",
    visual: "telecom",
    next: "mobility",
  },
  {
    slug: "mobility",
    number: "02",
    sector: "Mobility",
    period: "2024—NOW",
    headline: ["From firefighting", "to shipping."],
    summary:
      "Led an event-driven refactor of a legacy taxi backend, adding WebSockets for live ride tracking.",
    tech: ["Node.js", "NestJS", "WebSockets"],
    role: "Full Stack Engineer",
    company: "Kevych Solutions",
    visual: "mobility",
    next: "connected-devices",
  },
  {
    slug: "connected-devices",
    number: "03",
    sector: "Connected devices",
    period: "2024—NOW",
    headline: ["Backend commands,", "physical devices."],
    summary: "Real-time remote control of connected devices over MQTT and AWS IoT Core.",
    tech: ["MQTT", "AWS IoT Core", "Node.js"],
    role: "Full Stack Engineer",
    company: "Kevych Solutions",
    visual: "quartz",
    next: "computer-vision",
  },
  {
    slug: "computer-vision",
    number: "04",
    sector: "Computer vision",
    period: "2021—2024",
    headline: ["Prices, read off", "the roadside."],
    summary:
      "Mobile and backend for a CV product that reads competitor fuel prices off signs, with POS updates from the phone.",
    tech: ["React Native", "Node.js", "NestJS"],
    role: "Full Stack Engineer",
    company: "Appexoft",
    visual: "optics",
    next: "telecom",
  },
];

export const projectSlugs: readonly ProjectSlug[] = projects.map((project) => project.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
