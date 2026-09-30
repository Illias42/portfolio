export type Point = readonly [x: number, y: number, z: number];

interface FractureSpec {
  points: readonly Point[];
  glow: readonly [min: number, max: number];
  phase: number;
  compact: boolean;
}

const block = {
  half: 0.66,
  axes: [
    [1.46, 0.06, 0.14],
    [0.14, 1.12, -0.1],
    [-0.08, 0.18, 1.4],
  ] as readonly Point[],
  jitter: [
    [-0.02, -0.01, 0.02],
    [0.03, 0.02, -0.01],
    [-0.01, 0.03, 0.02],
    [0.02, -0.02, 0.03],
    [0.02, 0.01, -0.03],
    [-0.02, 0.03, 0.01],
    [0.03, -0.02, -0.02],
    [-0.03, 0.02, 0.02],
  ] as readonly Point[],
  cuts: [
    { normal: [0.7, 0.5, 0.5], depth: 0.17 },
    { normal: [-0.8, 0.3, 0.4], depth: 0.12 },
    { normal: [0.25, 0.9, -0.35], depth: 0.07 },
    { normal: [-0.3, 0.2, -0.9], depth: 0.15 },
    { normal: [0.9, -0.2, -0.3], depth: 0.1 },
    { normal: [-0.5, 0.7, -0.5], depth: 0.11 },
    { normal: [0.3, -0.4, 0.85], depth: 0.13 },
  ] as ReadonlyArray<{ normal: Point; depth: number }>,
  inset: 0.82,
  tilt: [-0.46, 0.22, 0.78] as Point,
  truncate: 0.52,
};

const fractures: readonly FractureSpec[] = [
  {
    points: [
      [-0.5, -0.46, 0.3],
      [0.12, -0.52, 0.4],
      [0.46, 0.2, 0.12],
      [-0.1, 0.36, -0.08],
    ],
    glow: [0.22, 0.32],
    phase: 0,
    compact: true,
  },
  {
    points: [
      [-0.42, -0.12, -0.46],
      [0.5, -0.26, 0.2],
      [0.4, 0.3, 0.46],
      [-0.46, 0.4, 0.1],
    ],
    glow: [0.24, 0.34],
    phase: 2.1,
    compact: true,
  },
  {
    points: [
      [-0.5, -0.22, 0.02],
      [0.02, -0.52, -0.02],
      [0.52, 0.18, 0.06],
      [0.02, 0.52, 0.04],
    ],
    glow: [0.16, 0.24],
    phase: 3.3,
    compact: true,
  },
  {
    points: [
      [0.1, 0.2, 0.3],
      [0.5, 0.05, -0.1],
      [0.4, 0.5, -0.36],
      [0.1, 0.52, 0.1],
    ],
    glow: [0.12, 0.2],
    phase: 4.2,
    compact: false,
  },
  {
    points: [
      [-0.46, 0.1, -0.5],
      [0.2, -0.2, -0.5],
      [0.1, 0.46, -0.46],
    ],
    glow: [0.08, 0.13],
    phase: 1.3,
    compact: false,
  },
];

const cracks: ReadonlyArray<readonly Point[]> = [
  [
    [0.12, -0.52, 0.4],
    [0.28, -0.14, 0.28],
    [0.46, 0.2, 0.12],
  ],
  [
    [-0.42, -0.12, -0.46],
    [0.04, -0.2, -0.12],
    [0.5, -0.26, 0.2],
  ],
];

export const quartzConfig = {
  block,
  fractures,
  cracks,
  sink: 0.012,
  yaw: 0.95,
  core: {
    position: [0.06, -0.18, 0.22] as Point,
    intensity: 4.2,
    breathe: 0.4,
    distance: 4,
    period: 5.6,
    haloRadius: 0.46,
    haloStrength: 0.95,
  },
  echo: {
    position: [0.24, 0.32, 0.06] as Point,
    share: 0.28,
    distance: 2,
  },
  material: {
    roughness: 0.3,
    transmission: 0.32,
    compactTransmission: 0.3,
    thickness: 1.6,
    ior: 1.45,
    clearcoat: 0.2,
    clearcoatRoughness: 0.28,
    attenuationDistance: 7,
    lift: 0.86,
    fractureGain: 3.3,
  },
  marble: {
    vein: 0.56,
    honey: 0.5,
    crackle: 0.4,
    gold: 0.26,
    goldNearCore: 1.6,
  },

  key: {
    position: [-3.2, 3.6, 3] as Point,
    facetShade: [0.7, 1.06] as const,
  },
  camera: {
    fov: 30,
    compactFov: 32,
    target: 0.48,
    lift: 0.95,
    framing: {
      card: { height: 0.52, maxWidth: 0.7, centre: 0.8 },
      case: { height: 0.66, maxWidth: 0.42, centre: 0.5 },
      compact: { height: 0.62, maxWidth: 0.7, centre: 0.5 },
    },
    parallax: [0.1, 0.05] as const,
    damping: 2.5,
  },
  fractureReach: 0.2,
  shadow: { opacity: 0.28, blur: 2.4, far: 1.4, scale: 4.4 },
  contact: { opacity: 0.42, blur: 0.8, far: 0.22, scale: 3.2 },
  occlusion: { strength: 0.3, height: 0.24 },
  caustics: {
    radius: 2.1,
    strength: 0.34,
    pool: 0.28,
    tightness: 4.4,
    scale: 2.5,
    speed: 0.45,
  },
} as const;
