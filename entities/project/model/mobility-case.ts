import type { CaseStudyContent } from "./types";

export const mobilityCase: CaseStudyContent = {
  slug: "mobility",
  sections: [
    {
      number: "01",
      title: "Overview",
      lead: "A live taxi service running on a legacy backend that had stopped keeping up.",
      paragraphs: [
        "I led the event-driven refactor of the ride-hailing backend and built a Node.js WebSocket layer for live ride tracking. The goal was not one more feature. It was a backend the team could build on again.",
      ],
    },
    {
      number: "02",
      title: "The hard part",
      lead: "The team spent its time reacting to production instead of building the product.",
      bullets: [
        "The legacy backend was hard to change safely, so every change carried risk and incidents took over the roadmap.",
        "Ride hailing is real-time by nature: a ride moves through states, and riders and drivers expect to see each change as it happens.",
        "The service was live, so it had to be improved while it kept running, not replaced in one big rewrite.",
      ],
    },
    {
      number: "03",
      title: "System",
      lead: "Each ride state change becomes an event, and the WebSocket layer pushes it to the apps.",
      system: [
        { label: "Ride", items: ["State changes as the trip progresses"] },
        { label: "Backend · NestJS", items: ["Handles the change and emits an event"] },
        { label: "WebSocket layer · Node.js", items: ["Pushes the update to subscribers"] },
        { label: "Apps", items: ["Live ride tracking"] },
      ],
    },
    {
      number: "04",
      title: "Engineering decisions",
      decisions: [
        {
          title: "Events instead of chained calls",
          body: "A ride state change is emitted once and the parts that care react to it. New behavior attaches as a new consumer instead of another edit to a fragile core flow.",
        },
        {
          title: "Push, not poll",
          body: "Clients hold a WebSocket and receive updates the moment they happen, instead of repeatedly asking the API whether anything changed.",
        },
        {
          title: "Real-time as its own layer",
          body: "Long-lived connections live in a dedicated Node.js WebSocket layer, apart from the request handling that runs the business logic.",
        },
        {
          title: "Refactor, not rewrite",
          body: "The backend moved to event-driven flows step by step, so the production service kept running throughout.",
        },
      ],
    },
    {
      number: "05",
      title: "Impact",
      highlight: "From firefighting to shipping.",
      paragraphs: [
        "The team's time moved from fixing recurring legacy issues back to shipping product features, with live ride tracking built into the backend rather than bolted on.",
      ],
    },
    {
      number: "06",
      title: "Stack",
      stack: ["Node.js", "TypeScript", "NestJS", "WebSockets"],
    },
  ],
};
