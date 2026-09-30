import type { Project } from "../model/types";
import { MobilityCanvas } from "./mobility-canvas";
import { NetworkCanvas } from "./network-canvas";
import { OpticsCanvas } from "./optics-canvas";
import { QuartzCanvas } from "./quartz-canvas";

interface ProjectVisualProps {
  visual: Project["visual"];
  variant: "card" | "case";
  active: boolean;
  hold?: boolean;
}

const canvases = {
  telecom: NetworkCanvas,
  mobility: MobilityCanvas,
  optics: OpticsCanvas,
  quartz: QuartzCanvas,
} as const;

export function ProjectVisual({ visual, ...props }: ProjectVisualProps) {
  if (visual === "placeholder") return null;
  const Canvas = canvases[visual];
  return <Canvas {...props} />;
}
