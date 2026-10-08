import type { CaseStudyContent } from "./types";

export const telecomCase: CaseStudyContent = {
  slug: "telecom",
  sections: [
    {
      number: "01",
      title: "Overview",
      lead: "The backend of a telecom product used by around one million people: eSIMs, phone numbers, calls and VPN.",
      paragraphs: [
        "I joined as the second backend engineer, ran the backend on my own for a period, and later shared it with one other developer. Over that time I designed and shipped the services for eSIM and number provisioning, call routing, VPN and business self-service.",
        "The backend is NestJS on GCP Cloud Run. Calls run through Asterisk and external SIP/VoIP providers.",
      ],
    },
    {
      number: "02",
      title: "The hard part",
      lead: "Almost everything the product sells depends on someone else's API, and those APIs are slow and unreliable.",
      bullets: [
        "Provisioning an eSIM or a number is a call to an external provider that can time out, fail halfway or succeed after the client has already given up.",
        "A retry is unavoidable, but it must never create a second eSIM, a second number or a second charge for the same order.",
        "Calls need long-lived SIP connections, which a request-scoped serverless backend cannot hold.",
        "Business customers expect to manage provisioning and usage themselves, at any hour, without opening a ticket.",
      ],
    },
    {
      number: "03",
      title: "System",
      lead: "A stateless NestJS backend on Cloud Run, with Asterisk running calls next to it.",
      system: [
        {
          label: "Clients",
          items: ["Users (~1M) · mobile apps", "Business customers · dashboard + API"],
        },
        {
          label: "Backend · NestJS on Cloud Run",
          items: [
            "eSIM & number provisioning",
            "Call routing config",
            "VPN (WireGuard)",
            "Business self-service",
          ],
        },
        { label: "Voice", items: ["Asterisk", "SIP / VoIP providers"] },
        {
          label: "Data",
          items: [
            "PostgreSQL · core records",
            "Redis · cache, sessions, rate limits",
            "Firestore · real-time sync",
          ],
        },
      ],
    },
    {
      number: "04",
      title: "Engineering decisions",
      decisions: [
        {
          title: "Idempotent provider calls",
          body: "Every provider request carries an idempotency key and is safe to retry. A timeout or a duplicated request ends in exactly one eSIM, one number and one charge.",
        },
        {
          title: "Asterisk outside the request path",
          body: "Call media and SIP sessions live in Asterisk, where long-lived connections belong. The backend owns numbers and routing rules and stays stateless.",
        },
        {
          title: "Serverless for a two-person team",
          body: "Cloud Run handles scaling and deploys. With one or two backend engineers, every hour not spent on servers went into product.",
        },
        {
          title: "One data store per job",
          body: "PostgreSQL for accounts, provisioning and billing. Redis for caching, sessions and rate limits. Firestore to push live state to the apps.",
        },
      ],
    },
    {
      number: "05",
      title: "What I built",
      bullets: [
        "eSIM and phone-number provider integrations that survive timeouts, partial failures and retries.",
        "The Asterisk setup for calls through SIP/VoIP providers, with numbers and routing managed from the backend.",
        "WireGuard VPN provisioning: key and config issuance and server management.",
        "The business self-service dashboard and public API for accounts, provisioning and usage.",
      ],
    },
    {
      number: "06",
      title: "Impact",
      highlight: "~1M users",
      bullets: [
        "Provisioning, calls and VPN run in production for about one million users.",
        "Business customers change provisioning on their own through the dashboard or the API, without the operations team.",
        "A backend team of one or two kept shipping features with no servers to maintain.",
      ],
    },
    {
      number: "07",
      title: "Stack",
      stack: [
        "Node.js",
        "TypeScript",
        "NestJS",
        "GCP Cloud Run",
        "Asterisk",
        "SIP / VoIP",
        "WireGuard",
        "PostgreSQL",
        "Redis",
        "Firestore",
      ],
    },
  ],
};
