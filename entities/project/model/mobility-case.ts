import type { CaseStudyContent } from "./types";

export const mobilityCase: CaseStudyContent = {
  slug: "mobility",
  sections: [
    {
      number: "01",
      title: "Overview",
      lead: "Modernizing a real-time ride-hailing backend.",
      paragraphs: [
        "I worked on the modernization of a legacy taxi ride-hailing backend, leading an event-driven refactor and introducing a Node.js WebSocket layer for live ride tracking.",
      ],
    },
    {
      number: "02",
      title: "The problem",
      lead: "A legacy system slowing down product development.",
      paragraphs: [
        "Too much engineering time was being spent reacting to production issues instead of building new product functionality. The existing backend had become difficult to evolve reliably.",
        "The challenge went beyond adding live tracking. The system needed clearer real-time behavior that could support ongoing development.",
      ],
    },
    {
      number: "03",
      title: "The approach",
      lead: "Moving toward event-driven flows.",
      paragraphs: [
        "I led a refactor of the backend toward an event-driven model and added a Node.js WebSocket layer to deliver live ride-tracking updates to connected clients.",
        "The flow below is a conceptual explanation of real-time updates, rather than an inventory of internal architecture components.",
      ],
      system: [
        { label: "Ride state", items: ["A ride changes state"] },
        { label: "Backend event", items: ["The backend handles the change"] },
        { label: "WebSocket layer", items: ["Node.js delivers the update"] },
        { label: "Real-time update", items: ["Live tracking information"] },
        { label: "Client", items: ["Connected clients receive the update"] },
      ],
    },
    {
      number: "04",
      title: "What I built",
      lead: "My contribution.",
      decisions: [
        {
          title: "Event-driven refactor",
          body: "Led the modernization of the legacy backend toward event-driven flows, making its real-time behavior easier to reason about and extend.",
        },
        {
          title: "Real-time tracking",
          body: "Added a Node.js WebSocket layer enabling live ride tracking and real-time communication with connected clients.",
        },
        {
          title: "Production stabilization",
          body: "Worked through legacy backend constraints and recurring production issues as part of the modernization.",
        },
        {
          title: "System ownership",
          body: "Worked across architecture and implementation, treating tracking as part of the backend system.",
        },
      ],
    },
    {
      number: "05",
      title: "Engineering decision",
      lead: "Real-time as part of the architecture.",
      paragraphs: [
        "Ride-state changes needed a path through the backend that could reach connected clients as they happened.",
        "Event-driven flows and a WebSocket layer created that path while supporting the modernization of the surrounding legacy system.",
      ],
    },
    {
      number: "06",
      title: "Impact",
      highlight: "From firefighting to forward motion.",
      paragraphs: [
        "The modernization helped shift the team's engineering work away from repeatedly firefighting legacy backend issues and toward shipping new product features.",
      ],
    },
    {
      number: "07",
      title: "Technology",
      stack: ["Node.js", "NestJS", "WebSockets"],
    },
  ],
};
