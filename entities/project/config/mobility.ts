type Keyframes = ReadonlyArray<readonly [s: number, value: number]>;
type CableFinish = "pearl" | "satin" | "glass";
export type BeadFinish = "pearl" | "champagne" | "gold" | "glass" | "silver" | "graphite";

export interface LaneSpec {
  offset: Keyframes;
  lift: Keyframes;
  radius: number;
  finish: CableFinish;
  compact: boolean;
}

interface BeadSpec {
  lane: number;
  t: number;
  radius: number;
  finish: BeadFinish;
}

const low = 0.07;
const flat: Keyframes = [[0, low]];
const cross = (a: number, b: number, from: number, to: number): Keyframes => [
  [a, from],
  [b, to],
];
const arch = (a: number, b: number, peak: number): Keyframes => [
  [a, low],
  [(a + b) / 2, peak],
  [b, low],
];

const lanes: readonly LaneSpec[] = [
  {
    offset: [[0, 1], [0.36, 0.9], ...cross(0.48, 0.7, 0.9, 0.45)],
    lift: arch(0.48, 0.7, 0.54),
    radius: 0.046,
    finish: "glass",
    compact: true,
  },
  {
    offset: cross(0.12, 0.32, 0.45, 0),
    lift: flat,
    radius: 0.04,
    finish: "satin",
    compact: true,
  },
  {
    offset: [...cross(0.12, 0.32, 0, 0.45), ...cross(0.48, 0.7, 0.45, 0.9)],
    lift: arch(0.12, 0.32, 0.46),
    radius: 0.05,
    finish: "pearl",
    compact: true,
  },
  {
    offset: cross(0.3, 0.5, -0.45, -0.9),
    lift: arch(0.3, 0.5, 0.38),
    radius: 0.044,
    finish: "glass",
    compact: true,
  },
  {
    offset: cross(0.3, 0.5, -0.9, -0.45),
    lift: flat,
    radius: 0.04,
    finish: "satin",
    compact: true,
  },
];

export const mobilityConfig = {
  traversal: 14,
  heroRadius: 0.208,
  heroLane: 2,
  hero: {
    depth: 0.72,
    roughness: 0.24,
    metalness: 0.45,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.25,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [260, 520] as [number, number],
    sheen: 0.3,
    glowDepth: 0.2,
    emissiveIntensity: 0.5,
    light: { intensity: 1.2, distance: 1.4, decay: 2 },
  },
  trail: { length: 0.2, lead: 0.012, radiusScale: 1.12, opacity: 0.85 },
  camera: {
    position: [0, 3.1, 7.7] as [number, number, number],
    card: {
      target: [-1.9, 0, -0.4] as [number, number, number],
      fov: 36,
      scale: 1.05,
      baseY: -0.25,
    },
    case: { target: [1, 0, 0.8] as [number, number, number], fov: 30, scale: 1, baseY: 0 },
    compact: { target: [1, 0, 0.8] as [number, number, number], fov: 38, scale: 1, baseY: 0 },
  },
  fog: { near: 8.5, far: 15.5 },
  spine: [
    [2.3, 2.5],
    [1.2, 1.7],
    [0.1, 0.6],
    [-0.35, -0.7],
    [0.1, -2.0],
    [1.1, -3.1],
    [1.9, -3.6],
  ] as ReadonlyArray<readonly [number, number]>,
  spineSamples: 64,
  spread: [
    [0, 1.15],
    [0.5, 1],
    [1, 0.8],
  ] as ReadonlyArray<readonly [number, number]>,
  lanes,
  beads: [
    { lane: 1, t: 0.08, radius: 0.12, finish: "pearl" },
    { lane: 4, t: 0.14, radius: 0.1, finish: "silver" },
    { lane: 3, t: 0.2, radius: 0.09, finish: "champagne" },
    { lane: 0, t: 0.86, radius: 0.075, finish: "gold" },
    { lane: 0, t: 0.24, radius: 0.1, finish: "glass" },
    { lane: 4, t: 0.72, radius: 0.085, finish: "graphite" },
    { lane: 3, t: 0.86, radius: 0.07, finish: "silver" },
    { lane: 1, t: 0.92, radius: 0.075, finish: "champagne" },
    { lane: 1, t: 0.55, radius: 0.065, finish: "gold" },
  ] satisfies readonly BeadSpec[],
} as const;
