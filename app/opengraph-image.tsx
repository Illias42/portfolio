import { ogImageSize, siteConfig } from "@/shared/config";
import { renderOgCard } from "@/shared/ui/og-card";

export const alt = `${siteConfig.name} — ${siteConfig.jobTitle}`;
export const size = ogImageSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: siteConfig.jobTitle,
    title: ["Illia", "Kryvoshchenkov"],
    footer: "Germany · TypeScript · Node.js · React",
  });
}
