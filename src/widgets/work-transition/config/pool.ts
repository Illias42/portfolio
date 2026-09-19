export interface PoolProfile {
  sim: number;
  caustics: number;
  grid: number;
  dpr: [number, number];
}

export const poolConfig = {
  desktop: { sim: 256, caustics: 512, grid: 160, dpr: [1, 1.5] } satisfies PoolProfile,
  mobile: { sim: 128, caustics: 256, grid: 96, dpr: [1, 1] } satisfies PoolProfile,
  mobileQuery: "(max-width: 760px)",
  coarsePointerQuery: "(pointer: coarse)",
  light: [1.6, 2.2, -1.0] as const,
  camera: { position: [1.25, 3.3, 2.75] as const, target: [0, -0.15, 0] as const, fov: 30 },
  tint: { underwater: { saturation: 0.5, gain: 1.05 }, above: { saturation: 0.55, gain: 1.1 } },
  ball: {
    radius: 0.17,
    orbitCenter: [0.18, 0.14] as const,
    orbitRadius: [0.34, 0.28] as const,
    orbitSpeed: 0.32,
    floatHeight: 0.5,
    bob: 0.015,
    bobSpeed: 1.9,
  },
  pointerDrop: { radius: 0.03, strength: 0.01 },
  rain: { radius: 0.03, strength: 0.028, minDelay: 1.6, maxDelay: 3.4, spread: 0.8, intro: 0.4 },
  simStep: 1 / 60,
  maxStepsPerFrame: 3,
  observerMargin: "600px 0px",
} as const;
