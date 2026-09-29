import type { CaseStudyContent } from "./types";

export const connectedDevicesCase: CaseStudyContent = {
  slug: "connected-devices",
  summary:
    "Built MQTT-based device control through AWS IoT Core, enabling real-time remote management of connected devices.",
  sections: [
    {
      number: "01",
      title: "Overview",
      lead: "Connecting software to physical devices.",
      paragraphs: [
        "I worked on an IoT control system that connected application-level software with physical devices through MQTT and AWS IoT Core.",
        "The integration enabled real-time remote device management as part of the wider product experience.",
      ],
    },
    {
      number: "02",
      title: "The problem",
      lead: "Software doesn't stop at the API boundary.",
      paragraphs: [
        "Connected hardware uses a different communication model from a conventional request-response application. Commands need to move between software and devices operating remotely.",
        "For this project, MQTT and AWS IoT Core provided the communication layer for real-time device control.",
      ],
    },
    {
      number: "03",
      title: "The approach",
      lead: "Event-driven communication between product and device.",
      paragraphs: [
        "I integrated MQTT-based device communication through AWS IoT Core, connecting application logic with remote device control and making device operations part of the product's backend workflow.",
        "This conceptual flow explains the integration; it is not a complete infrastructure diagram.",
      ],
      system: [
        { label: "Product / application", items: ["Remote device operations"] },
        { label: "Backend", items: ["Application logic"] },
        { label: "MQTT", items: ["Device-control messaging"] },
        { label: "AWS IoT Core", items: ["Connected-device communication"] },
        { label: "Connected device", items: ["Remote control"] },
      ],
    },
    {
      number: "04",
      title: "What I built",
      lead: "My contribution.",
      decisions: [
        {
          title: "MQTT integration",
          body: "Integrated MQTT-based communication for remote device control.",
        },
        {
          title: "AWS IoT Core",
          body: "Connected the application's device-control flow through AWS IoT Core.",
        },
        {
          title: "Product integration",
          body: "Worked across the software layer needed to make remote device operations part of the wider product experience.",
        },
      ],
    },
    {
      number: "05",
      title: "Engineering perspective",
      lead: "When the backend reaches into the physical world.",
      paragraphs: [
        "The software communicates beyond browsers, mobile apps and other services: its actions ultimately affect physical devices operating remotely.",
        "MQTT provided the messaging model, while AWS IoT Core connected that communication to the application's device-control flow.",
      ],
    },
    {
      number: "06",
      title: "Impact",
      lead: "Remote control, in real time.",
      paragraphs: [
        "The integration enabled connected devices to be managed remotely through the product using MQTT-based communication and AWS IoT Core.",
      ],
    },
    { number: "07", title: "Technology", stack: ["MQTT", "AWS IoT Core", "Node.js"] },
  ],
};
