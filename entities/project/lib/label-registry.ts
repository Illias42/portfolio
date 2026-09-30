import type { RefObject } from "react";

export interface LabelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface LabelRegistry {
  elements: Map<string, HTMLElement>;
  bounds: LabelRect | null;
  guards: readonly LabelRect[];
  changedAt: number;
  setFrame: (bounds: LabelRect | null, guards: readonly LabelRect[]) => void;
  noteCanvasSize: (width: number, height: number, now: number) => void;
}

export type LabelTargets = RefObject<LabelRegistry>;

export function createLabelRegistry(): LabelRegistry {
  let lastWidth = 0;
  let lastHeight = 0;
  const registry: LabelRegistry = {
    elements: new Map(),
    bounds: null,
    guards: [],
    changedAt: 0,
    setFrame: (bounds, guards) => {
      registry.bounds = bounds;
      registry.guards = guards;
      registry.changedAt = performance.now();
    },
    noteCanvasSize: (width, height, now) => {
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      registry.changedAt = now;
    },
  };
  return registry;
}
