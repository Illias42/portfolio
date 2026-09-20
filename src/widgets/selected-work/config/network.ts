type NodeFinish = "ceramic" | "glass" | "metal";

interface NetworkNode {
  position: readonly [number, number];
  radius: number;
  elevation?: number;
  finish: NodeFinish;
  scale: readonly [number, number, number];
  variant?: number;
}

interface NetworkLink {
  from: number;
  to: number;
  latent?: boolean;
}

export interface GlassVariant {
  roughness: number;
  tint: number;
  thickness: number;
}

export interface NetworkProfile {
  dpr: [number, number];
  sim: number;
  surfaceGrid: number;
  sphereSegments: number;
}

const nodes: readonly NetworkNode[] = [
  { position: [0, 0], radius: 0.34, elevation: -0.02, finish: "ceramic", scale: [1, 1, 1] },
  { position: [1.35, -0.35], radius: 0.22, elevation: -0.02, finish: "ceramic", scale: [1, 1, 1] },
  { position: [-1.22, -0.15], radius: 0.14, elevation: -0.02, finish: "metal", scale: [1, 1, 1] },
  { position: [1.02, 1.1], radius: 0.18, elevation: -0.02, finish: "metal", scale: [1, 1, 1] },
  { position: [-0.45, -1.3], radius: 0.19, elevation: -0.02, finish: "metal", scale: [1, 1, 1] },
  {
    position: [1.25, -1.45],
    radius: 0.105,
    elevation: -0.02,
    finish: "glass",
    scale: [1, 1, 1],
    variant: 1,
  },
  { position: [-1.65, 0.95], radius: 0.19, elevation: -0.02, finish: "ceramic", scale: [1, 1, 1] },
  { position: [-0.6, 1.45], radius: 0.19, elevation: -0.02, finish: "ceramic", scale: [1, 1, 1] },
  {
    position: [-0.62, 0.65],
    radius: 0.12,
    elevation: -0.02,
    finish: "glass",
    scale: [1, 1, 1],
    variant: 0,
  },
];

const links: readonly NetworkLink[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 0, to: 4 },
  { from: 1, to: 5 },
  { from: 2, to: 6 },
  { from: 8, to: 7 },
  { from: 0, to: 8 },
];

const glassVariants: readonly GlassVariant[] = [
  { roughness: 0.09, tint: 0.5, thickness: 1 },
  { roughness: 0.15, tint: 0.65, thickness: 0.8 },
  { roughness: 0.11, tint: 0.42, thickness: 0.6 },
];

export const networkConfig = {
  nodes,
  links,
  glassVariants,
  lamp: { nodes: [1, 4], intensity: 1.1, coreScale: 0.18 },
  desktop: {
    dpr: [1, 1.5],
    sim: 256,
    surfaceGrid: 128,
    sphereSegments: 64,
  } satisfies NetworkProfile,
  mobile: {
    dpr: [1, 1.25],
    sim: 128,
    surfaceGrid: 80,
    sphereSegments: 40,
  } satisfies NetworkProfile,
  mobileQuery: "(max-width: 760px)",
  coarsePointerQuery: "(pointer: coarse)",
  mobileCamera: { position: [0.4, 3.6, 5.6] as const, target: [0, 0, 0] as const, fov: 44 },
  camera: { position: [0.4, 3.6, 5.6] as const, target: [0, 0.3, 0] as const, fov: 36 },
  // The card frame is portrait and partly overlapped by copy: pull back and widen the view.
  cardCamera: { position: [-0.6, 3.6, 5.6] as const, target: [-0.95, 0.15, 0.3] as const, fov: 40 },
  // Same sculpture, larger canvas: a slightly tighter frame so the object fills the case viewport.
  caseCamera: { position: [0.4, 3.4, 5.2] as const, target: [0, 0.1, 0.45] as const, fov: 25 },
  lighting: {
    key: { position: [-2.6, 4.2, 3.2] as const, size: [4.5, 3.2] as const, intensity: 9 },
    fill: { position: [3.6, 2.4, -2.6] as const, size: [5, 3] as const, intensity: 2.2 },
    ambient: 0.28,
    environment: 0.85,
  },
  ceramic: { roughness: 0.24, clearcoat: 0.8, clearcoatRoughness: 0.2, bumpScale: 0.001 },
  metal: { metalness: 0.58, roughness: 0.22, envMapIntensity: 0.85 },
  water: {
    extent: [2.5, 2.1] as const,
    level: -0.02,
    float: 0.3,
    opacity: 0.16,
    tint: 0.025,
    fade: [0.4, 0.72] as const,
    wake: { interval: 0.55, radius: 0.035, strength: 0.014, speed: 0.7 },
    drop: { radius: 0.02, strength: 0.035 },
    simStep: 1 / 60,
    maxStepsPerFrame: 3,
  },
  floatMotion: { amplitude: 0.018, minPeriod: 6, maxPeriod: 12 },
  parallax: { yaw: 0.075, pitch: 0.035, damping: 4 },
  link: {
    opacity: 0.34,
    hoverOpacity: 0.6,
    activeOpacity: 0.5,
    radius: 0.0032,
    depthRange: 0.45,
    arc: 0.24,
    bend: 0.24,
    segments: 40,
    warmDamping: 5,
  },
  signal: {
    radius: 0.03,
    haloScale: 2.4,
    haloOpacity: 0.22,
    travel: 1.6,
    idleMin: 2,
    idleMax: 4,
    hoverCooldown: 1.6,
    revealHold: 1.2,
  },
  reaction: { amplitude: 0.025, decay: 5, frequency: 14, duration: 1.2 },
  hover: { brighten: 0.05, lift: 0.008, damping: 6 },
  observerMargin: "600px 0px",
} as const;
