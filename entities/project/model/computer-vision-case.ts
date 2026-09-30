import type { CaseStudyContent } from "./types";

export const computerVisionCase: CaseStudyContent = {
  slug: "computer-vision",
  summary:
    "Built mobile and backend components of a computer-vision product that turned roadside fuel-price signage into actionable competitor pricing data for retailers.",
  sections: [
    {
      number: "01",
      title: "Overview",
      lead: "Turning roadside signs into product data.",
      paragraphs: [
        "I built mobile and backend components of a computer-vision product that recognized competitor fuel prices from roadside signage.",
        "The product transformed information captured in the physical world into pricing data that fuel retailers could use for real-time market visibility.",
      ],
    },
    {
      number: "02",
      title: "The problem",
      lead: "Competitor pricing lives in the physical world.",
      paragraphs: [
        "For fuel retailers, competitor prices are displayed publicly on roadside signage, but turning that information into useful digital data requires bridging the physical and software worlds.",
        "The product used computer vision to recognize competitor fuel prices, while the mobile and backend components I worked on made that information usable inside the wider pricing workflow.",
      ],
    },
    {
      number: "03",
      title: "The product flow",
      lead: "From roadside image to pricing workflow.",
      paragraphs: [
        "A conceptual product flow, from physical signage to information a retailer can use.",
      ],
      system: [
        { label: "Roadside sign", items: ["Competitor fuel prices"] },
        { label: "Image capture", items: ["Roadside price information"] },
        { label: "Computer vision", items: ["Fuel-price recognition"] },
        { label: "Price data", items: ["Recognized competitor prices"] },
        { label: "Mobile / backend", items: ["Product and pricing workflows"] },
        { label: "Retailer", items: ["Competitor-price visibility"] },
      ],
    },
    {
      number: "04",
      title: "What I built",
      lead: "My contribution.",
      decisions: [
        {
          title: "Mobile product",
          body: "Built React Native functionality around the computer-vision workflow, bringing recognized competitor pricing into the mobile product.",
        },
        {
          title: "Backend",
          body: "Built Node.js / NestJS backend components supporting the product and its pricing workflows.",
        },
        {
          title: "Pricing workflow",
          body: "Worked on functionality that gave fuel retailers real-time competitor price visibility and supported direct POS price updates from mobile devices.",
        },
      ],
    },
    {
      number: "05",
      title: "From recognition to product",
      lead: "Computer vision is useful when the result goes somewhere.",
      paragraphs: [
        "The recognized pricing data needed to become part of an actual product: available through mobile workflows, connected to backend functionality, and useful to retailers making pricing decisions.",
        "My work connected the computer-vision capability with the software around it.",
      ],
    },
    {
      number: "06",
      title: "Pricing management",
      lead: "From competitor data to price updates.",
      paragraphs: [
        "I also worked on the pricing-management product used by fuel retailers, including real-time competitor-price monitoring and workflows for updating POS prices directly from mobile devices.",
      ],
    },
    {
      number: "07",
      title: "Production work",
      lead: "Beyond the feature.",
      paragraphs: [
        "Alongside new product development, I worked on stabilizing existing mobile and backend codebases by resolving critical production issues and refactoring legacy code.",
      ],
    },
    {
      number: "08",
      title: "Technology",
      stack: ["TypeScript", "React Native", "Node.js", "NestJS"],
    },
    {
      number: "09",
      title: "Impact",
      lead: "Physical information, made actionable.",
      paragraphs: [
        "The product gave fuel retailers real-time visibility into competitor pricing by turning roadside fuel-price information into data available through the product.",
      ],
    },
  ],
};
