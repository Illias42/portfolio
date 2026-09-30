export interface CapabilityGroup {
  id: string;
  title: string;
  items: readonly string[];
}

export const capabilityGroups: readonly CapabilityGroup[] = [
  {
    id: "ai",
    title: "AI & LLM",
    items: [
      "OpenAI / Groq",
      "Streaming integrations",
      "RAG pipelines",
      "Prompt engineering",
      "Voice AI (STT / TTS)",
      "ElevenLabs",
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "TanStack Query",
      "Zustand",
      "Three.js",
      "WebSockets",
      "SEO",
    ],
  },
  {
    id: "backend",
    title: "Backend",
    items: [
      "Node.js",
      "Nest.js",
      "PostgreSQL",
      "Redis",
      "MongoDB",
      "Kafka",
      "GraphQL",
      "Microservices",
      "Stripe",
    ],
  },
  {
    id: "mobile",
    title: "Mobile",
    items: [
      "React Native",
      "Expo",
      "Deep Linking",
      "Push Notifications",
      "In-App Purchases",
      "Ionic",
    ],
  },
  {
    id: "platform",
    title: "Platform & DevOps",
    items: [
      "AWS (S3, Lambda, RDS)",
      "Docker",
      "GitHub Actions",
      "Cloudflare",
      "Nginx",
      "Sentry",
      "GA4 / Amplitude",
      "Playwright",
      "Jest",
    ],
  },
  {
    id: "real-time",
    title: "Real-time & Streaming",
    items: [
      "WebSockets",
      "MQTT",
      "SIP / VoIP",
      "Event-driven systems",
      "Real-time data pipelines",
      "Streaming architectures",
    ],
  },
];

export const capabilityFocus = [
  "Scalable systems",
  "Real-time infrastructure",
  "AI-powered products",
] as const;
