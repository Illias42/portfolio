import { siteConfig } from "../../../shared/config";

export interface ContactLink {
  id: string;
  label: string;
  href: string;
  destination: string;
  external?: boolean;
  download?: boolean;
}

export const contactLinks: readonly ContactLink[] = [
  {
    id: "email",
    label: "Email",
    href: siteConfig.email,
    destination: siteConfig.email.replace("mailto:", ""),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: siteConfig.linkedin,
    destination: "LinkedIn profile, opens in a new tab",
    external: true,
  },
  {
    id: "github",
    label: "GitHub",
    href: siteConfig.github,
    destination: "GitHub profile, opens in a new tab",
    external: true,
  },
  {
    id: "cv",
    label: "Download CV",
    href: siteConfig.cv,
    destination: "PDF",
    download: true,
  },
];

export const contactFocus = ["Full-Stack", "Backend", "Product Engineering"] as const;
