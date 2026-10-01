import type { CaseStudyContent } from "./types";

export const telecomCase: CaseStudyContent = {
  slug: "telecom",
  sections: [
    {
      number: "01",
      title: "Overview",
      paragraphs: [
        "A telecom platform serving approximately one million users: eSIM and phone-number provisioning, voice calls and VPN, plus self-service for business customers.",
        "I joined as the second backend engineer, ran the backend solo for a period, and later worked alongside another developer. The backend is built with NestJS and runs on GCP Cloud Run, with Asterisk handling calls.",
      ],
    },
    {
      number: "02",
      title: "The problem",
      lead: "Most of the product depends on external carrier and provider APIs that are slow and do not always respond reliably.",
      bullets: [
        "Provisioning an eSIM or a phone number means calling a provider whose request can time out, fail halfway or succeed late.",
        "A retried request must not create a second eSIM, number or charge for the same order.",
        "Business customers need to change provisioning and track usage without asking the operations team.",
      ],
    },
    {
      number: "03",
      title: "System",
      lead: "A NestJS backend on Cloud Run, with Asterisk running calls next to it.",
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
      title: "What I built",
      bullets: [
        "Integrations with eSIM and phone-number providers that survive timeouts, partial failures and retries.",
        "The Asterisk setup for calls through SIP/VoIP providers, with routing and numbers managed from the backend.",
        "WireGuard VPN provisioning: issuing keys and configs and managing servers.",
        "The business self-service dashboard and public API for accounts, provisioning and usage.",
      ],
    },
    {
      number: "05",
      title: "Engineering decisions",
      decisions: [
        {
          title: "Backend on Cloud Run",
          body: "With a team of one or two backend engineers, Cloud Run takes care of scaling and deploys, so there are no servers to run and time goes into features.",
        },
        {
          title: "Asterisk outside the request path",
          body: "SIP and call media need long-lived connections, which do not fit request-scoped Cloud Run containers. Asterisk handles the calls, and the backend owns numbers and routing configuration.",
        },
        {
          title: "Defensive provider integration",
          body: "Every provider call is retried with an idempotency key, so a timeout or a duplicated request never produces a second eSIM, number or charge.",
        },
        {
          title: "One data store per job",
          body: "PostgreSQL holds accounts, provisioning and billing records. Redis handles caching, sessions and rate limits. Firestore pushes real-time state to client apps.",
        },
      ],
    },
    {
      number: "06",
      title: "Impact",
      highlight: "~1M users",
      bullets: [
        "Provisioning, calls and VPN run in production for approximately one million users.",
        "Business customers make provisioning changes on their own through the dashboard or the API, without involving the operations team.",
        "A team of one or two backend engineers kept shipping new features with no servers to maintain.",
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
