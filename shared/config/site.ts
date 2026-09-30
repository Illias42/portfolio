const FALLBACK_SITE_URL = "http://localhost:3000";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : FALLBACK_SITE_URL;
}

export const siteConfig = {
  url: resolveSiteUrl(),
  name: "Illia Kryvoshchenkov",
  shortName: "Illia K.",
  jobTitle: "Full-Stack Engineer",
  title: "Illia Kryvoshchenkov | Full-Stack Engineer in Germany",
  description:
    "Full-Stack Engineer in Germany with 5+ years building web and mobile products with TypeScript, React, Next.js, Node.js, NestJS and React Native.",
  locale: "en_GB",
  location: { locality: "Sangerhausen", country: "DE" },
  keywords: [
    "Illia Kryvoshchenkov",
    "Full-Stack Engineer",
    "Full-Stack Developer Germany",
    "TypeScript",
    "Node.js",
    "NestJS",
    "React",
    "Next.js",
    "React Native",
    "Telecom",
    "IoT",
  ],
  knowsAbout: [
    "TypeScript",
    "Node.js",
    "NestJS",
    "React",
    "Next.js",
    "React Native",
    "PostgreSQL",
    "Redis",
    "Google Cloud",
    "AWS",
    "SIP/VoIP",
    "MQTT",
    "WebSockets",
  ],
  email: "mailto:illiakryvoshchenkov@gmail.com",
  linkedin: "https://www.linkedin.com/in/illia-kryvoshchenkov/",
  github: "https://github.com/Illias42",
  cv: "/documents/illia-kryvoshchenkov-cv.pdf",
};

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}
