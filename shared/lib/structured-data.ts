import { absoluteUrl, siteConfig } from "@/shared/config";

export const personId = absoluteUrl("/#person");
const websiteId = absoluteUrl("/#website");

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": absoluteUrl("/"),
    url: absoluteUrl("/"),
    name: siteConfig.title,
    description: siteConfig.description,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      "@id": websiteId,
      url: absoluteUrl("/"),
      name: siteConfig.name,
    },
    mainEntity: {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.name,
      jobTitle: siteConfig.jobTitle,
      description: siteConfig.description,
      url: absoluteUrl("/"),
      image: absoluteUrl("/opengraph-image"),
      email: siteConfig.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.location.locality,
        addressCountry: siteConfig.location.country,
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Lviv Polytechnic National University",
      },
      knowsAbout: siteConfig.knowsAbout,
      knowsLanguage: ["uk", "en", "de"],
      sameAs: [siteConfig.linkedin, siteConfig.github],
    },
  };
}
