import type { CaseStudyContent } from "./types";

export const connectedDevicesCase: CaseStudyContent = {
  slug: "connected-devices",
  sections: [
    {
      number: "01",
      title: "Overview",
      lead: "When the backend sends a command, a physical device somewhere has to act on it.",
      paragraphs: [
        "I integrated MQTT-based device control through AWS IoT Core, so connected devices can be managed remotely and in real time from the product.",
      ],
    },
    {
      number: "02",
      title: "The hard part",
      lead: "Devices are not web clients.",
      bullets: [
        "Devices are remote and stay connected over long periods. They don't call an API and wait for a response.",
        "Commands have to reach them in real time, and their state has to flow back to the product.",
        "A mistake here doesn't just show a wrong screen. It changes how real hardware behaves.",
      ],
    },
    {
      number: "03",
      title: "System",
      lead: "The backend never talks to a device directly. Messages go through AWS IoT Core over MQTT.",
      system: [
        { label: "Product", items: ["Remote device management"] },
        { label: "Backend · Node.js", items: ["Device-control logic"] },
        { label: "AWS IoT Core", items: ["MQTT broker · device connections"] },
        { label: "Devices", items: ["Receive commands · report back"] },
      ],
    },
    {
      number: "04",
      title: "Engineering decisions",
      decisions: [
        {
          title: "MQTT over HTTP",
          body: "MQTT is built for devices: lightweight publish/subscribe messaging over persistent connections, so commands reach a device without it having to poll for them.",
        },
        {
          title: "A managed broker",
          body: "AWS IoT Core holds the device connections and the messaging, so the backend stays focused on control logic instead of running broker infrastructure.",
        },
        {
          title: "Devices as part of the product",
          body: "Device control runs through the same backend as the rest of the product, so remote operations are product features, not a separate tool.",
        },
      ],
    },
    {
      number: "05",
      title: "Impact",
      highlight: "Remote control, in real time.",
      paragraphs: [
        "Connected devices are managed remotely through the product, with commands delivered in real time over MQTT and AWS IoT Core.",
      ],
    },
    { number: "06", title: "Stack", stack: ["Node.js", "TypeScript", "MQTT", "AWS IoT Core"] },
  ],
};
