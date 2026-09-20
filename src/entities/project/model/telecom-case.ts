import type { CaseStudyContent } from "./types";

// Every statement below is backed by docs/content/resume.md. Do not add outcomes or numbers
// that are not in the resume.
export const telecomCase: CaseStudyContent = {
  slug: "telecom",
  sections: [
    {
      number: "01",
      title: "Overview",
      paragraphs: [
        "A telecom platform serving approximately one million users, covering eSIM and phone-number provisioning, call routing and VPN.",
        "I architected and shipped its Node.js and NestJS services, integrated SIP/VoIP providers for real-time call handling, and built the self-service tooling business customers use to manage accounts, provisioning and usage.",
      ],
    },
    {
      number: "02",
      title: "The problem",
      lead: "Four capabilities had to work in production for a user base of roughly one million.",
      bullets: [
        "Provisioning: eSIM profiles and phone numbers for subscribers.",
        "Call routing: connecting calls in real time through SIP/VoIP providers.",
        "VPN: a VPN service delivered alongside the telecom offer.",
        "Self-service: business customers managing accounts, provisioning and usage without going through operations.",
      ],
    },
    {
      number: "03",
      title: "System",
      lead: "Node.js and NestJS services sit between the subscriber-facing products and the carrier-side providers.",
      system: [
        {
          label: "Clients",
          items: ["Subscribers (~1M)", "Business customers · self-service tooling"],
        },
        {
          label: "Services · Node.js / NestJS",
          items: ["eSIM provisioning", "Number provisioning", "Call routing", "VPN"],
        },
        { label: "Providers", items: ["SIP / VoIP providers"] },
        { label: "Data", items: ["PostgreSQL", "Redis"] },
      ],
    },
    {
      number: "04",
      title: "What I built",
      bullets: [
        "Architected the Node.js/NestJS services for eSIM and phone-number provisioning, call routing and VPN, and shipped them to production.",
        "Integrated SIP/VoIP providers for real-time call handling.",
        "Built self-service tooling for business customers covering accounts, provisioning and usage.",
      ],
    },
    {
      number: "05",
      title: "Engineering decisions",
      decisions: [
        {
          title: "Services on NestJS",
          body: "Provisioning, call routing and VPN are built as Node.js/NestJS services.",
        },
        {
          title: "Calls through SIP/VoIP providers",
          body: "Real-time call handling integrates external SIP/VoIP providers.",
        },
        {
          title: "Self-service for business customers",
          body: "Business customers manage accounts, provisioning and usage themselves through dedicated tooling.",
        },
      ],
    },
    {
      number: "06",
      title: "Impact",
      highlight: "~1M users",
      bullets: [
        "Provisioning, call-routing and VPN services in production for a platform serving approximately one million users.",
        "Business customers manage accounts, provisioning and usage through self-service tooling.",
        "Ongoing since 2024.",
      ],
    },
    {
      number: "07",
      title: "Stack",
      stack: ["Node.js", "TypeScript", "NestJS", "PostgreSQL", "Redis", "SIP / VoIP"],
    },
  ],
};
