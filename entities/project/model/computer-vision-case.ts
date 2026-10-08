import type { CaseStudyContent } from "./types";

export const computerVisionCase: CaseStudyContent = {
  slug: "computer-vision",
  sections: [
    {
      number: "01",
      title: "Overview",
      lead: "Fuel retailers set prices against competitors whose prices exist only on roadside signs.",
      paragraphs: [
        "At Appexoft I built mobile and backend parts of a computer-vision product that reads competitor fuel prices from that signage. I also built the pricing app retailers use to act on the data: monitor competitors and update their own POS prices from a phone.",
      ],
    },
    {
      number: "02",
      title: "The hard part",
      lead: "Recognition is only half the product. The price has to reach a decision while it is still current.",
      bullets: [
        "The input is a photo of a physical sign, so it has to get from the device into the system and become structured price data.",
        "Competitor data is only worth something if a retailer can act on it right away, not days later in a report.",
        "The apps ran on iOS and Android with paid subscriptions, and the existing codebases had critical production bugs.",
      ],
    },
    {
      number: "03",
      title: "Product flow",
      lead: "From a roadside sign to a new price at the pump.",
      system: [
        { label: "Roadside sign", items: ["Competitor fuel prices"] },
        { label: "Mobile app", items: ["Captures the sign"] },
        { label: "Computer vision", items: ["Recognizes the prices"] },
        { label: "Backend · NestJS", items: ["Competitor price data"] },
        { label: "Pricing app", items: ["Monitor competitors · update POS prices"] },
      ],
    },
    {
      number: "04",
      title: "What I built",
      decisions: [
        {
          title: "Recognition pipeline",
          body: "React Native and Node.js/NestJS components that connect the computer-vision capability to the product, turning recognized signs into competitor price data.",
        },
        {
          title: "Pricing management app",
          body: "Real-time competitor price monitoring, plus direct POS price updates from mobile devices, so retailers see a change and respond in the same place.",
        },
        {
          title: "Subscriptions with RevenueCat",
          body: "In-app purchases and subscriptions on iOS and Android through one RevenueCat integration, instead of two separate store billing implementations.",
        },
        {
          title: "Production stabilization",
          body: "Fixed critical production bugs and refactored legacy mobile and backend code, so new features no longer shipped on top of broken foundations.",
        },
      ],
    },
    {
      number: "05",
      title: "Impact",
      highlight: "From the roadside to the POS.",
      paragraphs: [
        "Retailers got real-time visibility into competitor prices and a way to update their own prices directly from a phone.",
      ],
    },
    {
      number: "06",
      title: "Stack",
      stack: ["TypeScript", "React Native", "Node.js", "NestJS", "RevenueCat"],
    },
  ],
};
