"use client";

import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  Color,
  Euler,
  MathUtils,
  MeshPhysicalMaterial,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type MeshBasicMaterial,
  type PointLight,
  type RectAreaLight,
} from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

import type { Rgb01 } from "../../../shared/lib";
import { opticsConfig, type Vec3 } from "../config/optics";
import {
  beamFragment,
  beamVertex,
  scanUniforms as uniforms,
  scanGlass,
} from "../lib/optics-shaders";
import { cornersTexture, fragmentTexture } from "../lib/optics-textures";

export interface OpticsPalette {
  surface: Rgb01;
  pearl: Rgb01;
  ink: Rgb01;
  smoke: Rgb01;
  line: Rgb01;
  metal: Rgb01;
  amber: Rgb01;
  key: Rgb01;
  fill: Rgb01;
  warm: Rgb01;
}
export type OpticsVariant = "card" | "case";
interface Props {
  palette: OpticsPalette;
  compact: boolean;
  parallax: boolean;
  animate: boolean;
  variant: OpticsVariant;
  fontFamily: string;
}

RectAreaLightUniformsLib.init();

const {
  planes,
  glass,
  bench,
  scan,
  corners,
  extent,
  shadow,
  camera: lens,
  thickness,
} = opticsConfig;
const BEAM_LAYER = 1;
const tint = (rgb: Rgb01) => new Color().setRGB(...rgb, SRGBColorSpace);
const WHITE = new Color(1, 1, 1);
const centre = new Vector3(0, extent.centreY, 0);
const eye = new Vector3();
const lookAt = new Vector3();
const probe = new Vector3();
const cycleLength = scan.traverse + scan.pause;
const SLOTS = 3;
const primaryIndex = planes.findIndex((plane) => plane.primary);
const beamOrder = primaryIndex * SLOTS + SLOTS - 0.5;
const primaryFragment = planes[primaryIndex]?.fragment;
const euler = new Euler();
const offset = new Vector3();

function fragmentWorldX(spread: number) {
  const plane = planes[primaryIndex];
  if (!plane?.fragment) return 0;
  const [x, z] = plane.station;
  return probe
    .set(plane.fragment.offset[0], plane.fragment.offset[1], 0)
    .add(offset.set(x, opticsConfig.baseline + plane.size[1] / 2, z * spread))
    .applyEuler(euler.set(0, opticsConfig.yaw, 0)).x;
}

function AreaLight({
  position,
  size,
  intensity,
  color,
}: {
  position: Vec3;
  size: readonly [number, number];
  intensity: number;
  color: Color;
}) {
  const ref = useRef<RectAreaLight>(null);
  useEffect(() => {
    ref.current?.lookAt(centre);
  }, []);
  return (
    <rectAreaLight ref={ref} position={[...position]} args={[color, intensity, size[0], size[1]]} />
  );
}

interface StudioColors {
  key: Color;
  fill: Color;
  warm: Color;
}

function StudioLighting({ colors, compact }: { colors: StudioColors; compact: boolean }) {
  return (
    <>
      <ambientLight intensity={opticsConfig.ambient} color={colors.fill} />
      <AreaLight position={[-3.4, 3.4, 3.2]} size={[3, 3]} intensity={5} color={colors.key} />
      <AreaLight position={[3.6, 0.6, 2.4]} size={[2.5, 3]} intensity={0.8} color={colors.fill} />
      <AreaLight position={[1.6, 2.4, -3.6]} size={[3, 2]} intensity={3} color={colors.key} />
      <Environment resolution={compact ? 64 : 128} frames={1}>
        <Lightformer
          form="rect"
          position={[-3, 3.5, 3]}
          scale={[4.5, 3.2, 1]}
          intensity={2.6}
          color={colors.key}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          position={[3.4, 0.4, 2.2]}
          scale={[0.5, 4.5, 1]}
          intensity={1.8}
          color={colors.key}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          position={[0, 4.5, -2]}
          scale={[6, 1, 1]}
          intensity={1}
          color={colors.warm}
          target={[0, 0, 0]}
        />
      </Environment>
    </>
  );
}

function CameraRig({
  variant,
  compact,
  animate,
  parallax,
}: Pick<Props, "variant" | "compact" | "animate" | "parallax">) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const base = useRef(new Vector3());
  const aim = useRef(new Vector3());
  const right = useRef(new Vector3());

  useLayoutEffect(() => {
    const frame = lens.framing[compact ? "compact" : variant];
    const aspect = size.width / Math.max(size.height, 1);
    const halfFov = MathUtils.degToRad((compact ? lens.compactFov : lens.fov) / 2);
    const halfHeight = Math.max(
      extent.height / 2 / frame.height,
      extent.width / 2 / (frame.maxWidth * aspect),
    );
    const distance = halfHeight / Math.tan(halfFov);
    const { azimuth, elevation } = lens;
    const toCamera = new Vector3(
      Math.sin(azimuth) * Math.cos(elevation),
      Math.sin(elevation),
      Math.cos(azimuth) * Math.cos(elevation),
    );
    right.current.set(Math.cos(azimuth), 0, -Math.sin(azimuth));
    const sideways = -(frame.centre - 0.5) * 2 * halfHeight * aspect;
    aim.current.copy(centre).addScaledVector(right.current, sideways);
    base.current.copy(aim.current).addScaledVector(toCamera, distance);
    camera.position.copy(base.current);
    camera.lookAt(aim.current);
    camera.layers.enable(BEAM_LAYER);
  }, [camera, size, variant, compact]);

  useFrame((state, delta) => {
    if (!animate || !parallax) return;
    const [px, py] = lens.parallax;
    eye
      .copy(base.current)
      .addScaledVector(right.current, state.pointer.x * px)
      .setY(base.current.y + state.pointer.y * py);
    state.camera.position.x = MathUtils.damp(state.camera.position.x, eye.x, lens.damping, delta);
    state.camera.position.y = MathUtils.damp(state.camera.position.y, eye.y, lens.damping, delta);
    state.camera.position.z = MathUtils.damp(state.camera.position.z, eye.z, lens.damping, delta);
    state.camera.lookAt(lookAt.copy(aim.current));
  });
  return null;
}

type PlaneSpec = (typeof planes)[number];

function glassMaterial(spec: PlaneSpec, body: Color) {
  const material = new MeshPhysicalMaterial({
    color: body,
    roughness: glass.roughness,
    metalness: 0,
    ior: glass.ior,
    clearcoat: glass.clearcoat,
    clearcoatRoughness: glass.clearcoatRoughness,
    envMapIntensity: glass.envMapIntensity,
    transparent: true,
    opacity: glass.faceOpacity * spec.presence,
    depthWrite: false,
  });
  material.onBeforeCompile = scanGlass;
  material.customProgramCacheKey = () => "optics-glass";
  return material;
}

function Bench({
  shown,
  spread,
  metal,
}: {
  shown: readonly PlaneSpec[];
  spread: number;
  metal: Color;
}) {
  const rail = useMemo(() => {
    const first = shown[0];
    const last = shown.at(-1);
    if (!first || !last) return null;
    const start = new Vector3(first.station[0], 0, first.station[1] * spread);
    const end = new Vector3(last.station[0], 0, last.station[1] * spread);
    const direction = end.clone().sub(start);
    const length = direction.length() + bench.overhang * 2;
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const rotation = new Euler(Math.PI / 2, 0, 0);
    rotation.y = Math.atan2(direction.x, direction.z);
    rotation.order = "YXZ";
    return { midpoint, length, rotation };
  }, [shown, spread]);
  const railY = opticsConfig.baseline - bench.drop;
  const [cw, ch, cd] = bench.clamp;
  return (
    <group>
      {rail && (
        <mesh position={[rail.midpoint.x, railY, rail.midpoint.z]} rotation={rail.rotation}>
          <cylinderGeometry args={[bench.radius, bench.radius, rail.length, 20]} />
          <meshStandardMaterial
            color={metal}
            metalness={bench.metalness}
            roughness={bench.roughness}
            envMapIntensity={1.6}
          />
        </mesh>
      )}
      {shown.map((spec) => (
        <RoundedBox
          key={spec.id}
          args={[cw, ch, cd]}
          radius={0.012}
          smoothness={3}
          position={[
            spec.station[0],
            opticsConfig.baseline - ch / 2 + 0.03,
            spec.station[1] * spread,
          ]}
        >
          <meshStandardMaterial
            color={metal}
            metalness={bench.metalness}
            roughness={bench.roughness}
            envMapIntensity={1.6}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

interface FragmentRefs {
  text: RefObject<MeshBasicMaterial | null>;
  corners: RefObject<MeshBasicMaterial | null>;
}

function GlassPlane({
  spec,
  index,
  spread,
  body,
  showFragment,
  palette,
  fontFamily,
  refs,
}: {
  spec: PlaneSpec;
  index: number;
  spread: number;
  body: Color;
  showFragment: boolean;
  palette: OpticsPalette;
  fontFamily: string;
  refs?: FragmentRefs;
}) {
  const material = useMemo(() => glassMaterial(spec, body), [spec, body]);
  useEffect(() => () => material.dispose(), [material]);

  const fragment = spec.fragment;
  const art = useMemo(() => {
    if (!fragment || !showFragment) return null;
    const color = fragment.tone === "ink" ? palette.ink : palette.smoke;
    const glyphs = fragmentTexture(fragment.text, color, fontFamily, fragment.blur);
    const width = fragment.height * glyphs.aspect;
    const frameSize = [
      width + corners.padding[0] * 2,
      fragment.height + corners.padding[1] * 2,
    ] as const;
    const frame = spec.primary
      ? cornersTexture(frameSize[0] / frameSize[1], corners.arm / frameSize[0], palette.line)
      : null;
    return { glyphs, width, frame, frameSize };
  }, [fragment, showFragment, palette, fontFamily, spec.primary]);
  useEffect(
    () => () => {
      art?.glyphs.texture.dispose();
      art?.frame?.dispose();
    },
    [art],
  );

  const [x, z] = spec.station;
  const [width, height] = spec.size;
  const surface = thickness / 2 + 0.004;
  return (
    <group position={[x, opticsConfig.baseline + height / 2, z * spread]}>
      <RoundedBox
        args={[width, height, thickness]}
        radius={opticsConfig.bevel}
        smoothness={3}
        material={material}
        renderOrder={index * SLOTS}
      />
      {fragment && art && (
        <group position={[fragment.offset[0], fragment.offset[1], surface]}>
          <mesh renderOrder={index * SLOTS + 1}>
            <planeGeometry args={[art.width, fragment.height]} />
            <meshBasicMaterial
              ref={refs?.text}
              map={art.glyphs.texture}
              transparent
              opacity={fragment.opacity[0]}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {art.frame && (
            <mesh renderOrder={index * SLOTS + 2}>
              <planeGeometry args={[art.frameSize[0], art.frameSize[1]]} />
              <meshBasicMaterial
                ref={refs?.corners}
                map={art.frame}
                transparent
                opacity={corners.opacity[0]}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

function Sculpture({ palette, compact, parallax, animate, variant, fontFamily }: Props) {
  const invalidate = useThree((state) => state.invalidate);
  const beam = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const textRef = useRef<MeshBasicMaterial>(null);
  const cornersRef = useRef<MeshBasicMaterial>(null);
  const cycle = useRef(0);
  const memory = useRef(0);
  const fade = useRef(0);
  const targetX = useRef(0);

  const colors = useMemo(
    () => ({
      glass: tint(palette.pearl).lerp(WHITE, 0.2).lerp(tint(palette.smoke), glass.smoke),
      metal: tint(palette.metal)
        .lerp(tint(palette.pearl), bench.lift)
        .lerp(tint(palette.warm), 0.1),
      amber: tint(palette.amber).lerp(tint(palette.warm), 0.3),
      key: tint(palette.key).lerp(tint(palette.warm), 0.1),
      fill: tint(palette.fill),
      warm: tint(palette.warm),
      surface: tint(palette.surface),
      shade: tint(palette.line),
    }),
    [palette],
  );
  const spread = variant === "case" && !compact ? opticsConfig.caseSpread : 1;
  const shown = planes.filter((plane) => !compact || plane.compact);

  const scanX = (progress: number) => MathUtils.lerp(scan.from, scan.to, progress);

  useLayoutEffect(() => {
    uniforms.uScanColor.value.copy(colors.amber);
    invalidate();
  }, [colors, invalidate]);

  useLayoutEffect(() => {
    const fragmentX = fragmentWorldX(spread);
    targetX.current = fragmentX;
    if (animate) return;
    const park = fragmentX + scan.park.offset;
    cycle.current =
      MathUtils.clamp((park - scan.from) / (scan.to - scan.from), 0, 1) * scan.traverse;
    uniforms.uScanX.value = park;
    uniforms.uScanFade.value = 1;
    fade.current = 1;
    memory.current = 1;
    if (textRef.current && primaryFragment)
      textRef.current.opacity = primaryFragment.opacity[1] * scan.park.opacity;
    if (cornersRef.current) cornersRef.current.opacity = corners.opacity[1];
    if (beam.current) beam.current.position.x = park;
    if (light.current) {
      light.current.position.x = park;
      light.current.intensity = scan.light.intensity;
    }
    invalidate();
  }, [animate, spread, invalidate]);

  useFrame((_, delta) => {
    if (!animate || !primaryFragment) return;
    cycle.current = (cycle.current + delta) % cycleLength;
    const progress = Math.min(cycle.current / scan.traverse, 1);
    const x = scanX(progress);
    const inside = cycle.current < scan.traverse;
    const visible = inside
      ? MathUtils.smoothstep(progress, 0, 0.1) * (1 - MathUtils.smoothstep(progress, 0.88, 1))
      : 0;
    fade.current = MathUtils.damp(fade.current, visible, scan.damping.fade, delta);
    uniforms.uScanX.value = x;
    uniforms.uScanFade.value = fade.current;
    if (beam.current) beam.current.position.x = x;
    if (light.current) {
      light.current.position.x = x;
      light.current.intensity = scan.light.intensity * fade.current;
    }

    const dx = (x - targetX.current) / scan.reach;
    const lit = Math.exp(-dx * dx) * fade.current;
    const passed = !inside || x > targetX.current;
    const { settle, forget } = scan.damping;
    memory.current = MathUtils.damp(
      memory.current,
      passed ? 1 : 0,
      passed ? settle : forget,
      delta,
    );
    const [rest, peak, settled] = primaryFragment.opacity;
    const base = MathUtils.lerp(rest, settled, memory.current);
    if (textRef.current) textRef.current.opacity = base + (peak - base) * lit;
    if (cornersRef.current)
      cornersRef.current.opacity = MathUtils.lerp(corners.opacity[0], corners.opacity[1], lit);
  });

  return (
    <>
      <color attach="background" args={[colors.surface]} />
      <StudioLighting colors={colors} compact={compact} />
      <CameraRig variant={variant} compact={compact} animate={animate} parallax={parallax} />
      <group rotation={[0, opticsConfig.yaw, 0]}>
        {shown.map((spec) => {
          const index = planes.indexOf(spec);
          const showFragment =
            !!spec.fragment &&
            (spec.primary === true ||
              (!compact && (!spec.fragment.caseOnly || variant === "case")));
          return (
            <GlassPlane
              key={spec.id}
              spec={spec}
              index={index}
              spread={spread}
              body={colors.glass}
              showFragment={showFragment}
              palette={palette}
              fontFamily={fontFamily}
              refs={spec.primary ? { text: textRef, corners: cornersRef } : undefined}
            />
          );
        })}
        <Bench shown={shown} spread={spread} metal={colors.metal} />
      </group>
      <ContactShadows
        position={[0, shadow.y, 0]}
        opacity={shadow.opacity}
        scale={shadow.scale}
        blur={shadow.blur}
        far={shadow.far}
        resolution={compact ? 256 : 512}
        color={colors.shade}
        frames={1}
      />
      <mesh
        ref={beam}
        position={[scan.from, extent.centreY, 0]}
        renderOrder={beamOrder}
        layers={BEAM_LAYER}
      >
        <planeGeometry args={[scan.beam.width, scan.beam.height]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          transparent
          blending={AdditiveBlending}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={light}
        position={[scan.from, extent.centreY + 0.2, -0.2]}
        color={colors.amber}
        intensity={0}
        distance={scan.light.distance}
        decay={2}
      />
    </>
  );
}

export function OpticsScene(props: Props) {
  return (
    <Canvas
      dpr={[1, props.compact ? 1.25 : 1.5]}
      frameloop={props.animate ? "always" : "demand"}
      camera={{ fov: props.compact ? lens.compactFov : lens.fov, near: 0.1, far: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <Sculpture {...props} />
    </Canvas>
  );
}
