export type Vec3 = readonly [x: number, y: number, z: number];

type FragmentTone = "ink" | "smoke";

interface FragmentSpec {
  text: string;
  opacity: readonly [rest: number, peak: number, settled: number];
  tone: FragmentTone;
  blur: number;
  height: number;
  offset: readonly [x: number, y: number];
  caseOnly?: boolean;
}

interface PlaneSpec {
  id: string;
  size: readonly [width: number, height: number];
  station: readonly [x: number, z: number];
  presence: number;
  compact: boolean;
  fragment?: FragmentSpec;
  primary?: boolean;
}

const BASELINE = -1.2;
const planes: readonly PlaneSpec[] = [
  {
    id: "archive",
    size: [1.3, 1.5],
    station: [0.84, -1.44],
    presence: 0.62,
    compact: false,
    fragment: {
      text: "1.949",
      opacity: [0.22, 0.22, 0.22],
      tone: "smoke",
      blur: 1.6,
      height: 0.16,
      offset: [0.1, -0.05],
      caseOnly: true,
    },
  },
  {
    id: "data",
    size: [1.42, 1.8],
    station: [0.56, -0.84],
    presence: 0.74,
    compact: true,
    fragment: {
      text: "1.859",
      opacity: [0.3, 0.3, 0.3],
      tone: "smoke",
      blur: 1,
      height: 0.18,
      offset: [0.1, 0.12],
    },
  },
  {
    id: "recognition",
    size: [1.54, 2.1],
    station: [0.28, -0.24],
    presence: 0.88,
    compact: true,
    primary: true,
    fragment: {
      text: "1.679",
      opacity: [0.28, 0.9, 0.52],
      tone: "ink",
      blur: 0,
      height: 0.26,
      offset: [0, 0.5],
    },
  },
  {
    id: "separation",
    size: [1.66, 2.4],
    station: [0, 0.36],
    presence: 0.94,
    compact: false,
  },
  {
    id: "input",
    size: [1.78, 2.7],
    station: [-0.28, 0.96],
    presence: 1,
    compact: true,
  },
];

export const opticsConfig = {
  planes,
  baseline: BASELINE,
  thickness: 0.06,
  bevel: 0.018,
  yaw: -0.58,
  caseSpread: 1.22,
  extent: { width: 3.6, height: 3.1, centreY: 0.15 },
  glass: {
    smoke: 0.3,
    roughness: 0.08,
    ior: 1.46,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    faceOpacity: 0.24,
    envMapIntensity: 1.4,
    fresnel: { power: 2.6, alpha: 0.85, light: 0.55 },
    density: [1.25, 0.8] as const,
    sheen: { angle: 0.55, offset: -0.1, width: 0.7, strength: 0.3 },
  },
  bench: {
    radius: 0.018,
    drop: 0.1,
    overhang: 0.42,
    clamp: [0.26, 0.075, 0.11] as const,
    roughness: 0.3,
    metalness: 0.7,
    lift: 0.58,
  },
  scan: {
    from: -2.1,
    to: 2.3,
    traverse: 8,
    pause: 2.6,
    core: 0.028,
    halo: 0.22,
    strength: 1.8,
    edgeGain: 2.4,
    beam: { width: 0.9, height: 3.6, intensity: 0.36 },
    light: { intensity: 0.7, distance: 2.2 },
    park: { offset: 0.06, opacity: 0.85 },
    damping: { fade: 6, settle: 3, forget: 0.7 },
    reach: 0.55,
  },
  corners: { arm: 0.11, padding: [0.2, 0.1] as const, opacity: [0.3, 0.78] as const },
  ambient: 0.35,
  camera: {
    fov: 30,
    compactFov: 32,
    azimuth: -0.08,
    elevation: 0.13,
    framing: {
      card: { height: 0.68, maxWidth: 0.44, centre: 0.745 },
      case: { height: 0.72, maxWidth: 0.5, centre: 0.5 },
      compact: { height: 0.74, maxWidth: 0.8, centre: 0.5 },
    },
    parallax: [0.13, 0.065] as const,
    damping: 2.4,
  },
  shadow: { y: -1.75, opacity: 0.14, blur: 2.6, far: 2.4, scale: 5.5 },
} as const;
