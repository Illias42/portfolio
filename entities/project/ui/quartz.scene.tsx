"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MathUtils,
  SRGBColorSpace,
  Vector3,
  type Group,
  type PointLight,
  type RectAreaLight,
  type ShaderMaterial,
} from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

import type { Rgb01 } from "@/shared/lib";

import { quartzConfig } from "../config/quartz";
import { useLabelAnchors, type LabelAnchor } from "../lib/label-anchors";
import type { LabelTargets } from "../lib/label-registry";
import {
  crystalSize,
  footprintCentre,
  hullGeometry,
  place,
  polygon,
  polyline,
} from "../lib/quartz-geometry";
import {
  causticFragment,
  causticVertex,
  compileQuartz,
  fractureFragment,
  fractureVertex,
  quartzUniforms,
} from "../lib/quartz-shaders";

export interface QuartzPalette {
  pearl: Rgb01;
  amber: Rgb01;
  warm: Rgb01;
  fill: Rgb01;
  key: Rgb01;
  shade: Rgb01;
  surface: Rgb01;
  smoke: Rgb01;
  earth: Rgb01;
}
export type QuartzVariant = "card" | "case";
interface Props {
  palette: QuartzPalette;
  compact: boolean;
  animate: boolean;
  variant: QuartzVariant;
  labelTargets?: LabelTargets;
}

RectAreaLightUniformsLib.init();

const { core, echo, material: stone, camera: lens, caustics } = quartzConfig;
const tint = (rgb: Rgb01) => new Color().setRGB(...rgb, SRGBColorSpace);
const TAU = Math.PI * 2;
const eye = new Vector3();
const lookHeight = crystalSize.height * lens.target;
const corePosition = place(core.position);
const echoPosition = place(echo.position);

const fractures = quartzConfig.fractures.map((fracture) => ({
  fracture,
  geometry: polygon(fracture.points),
  uniforms: {
    uGlow: { value: fracture.glow[0] * stone.fractureGain },
    uColor: { value: new Color() },
    uCore: { value: corePosition.clone() },
  },
}));
const cracks = quartzConfig.cracks.map((crack, index) => ({
  id: `crack-${index}`,
  geometry: polyline(crack),
  opacity: index === 0 ? 0.55 : 0.3,
}));
const causticUniforms = {
  uColor: { value: new Color() },
  uGlow: { value: 1 },
  uTime: { value: 0 },
};

function apexOf(): readonly [number, number, number] {
  const position = hullGeometry.getAttribute("position");
  let top = 0;
  for (let i = 1; i < position.count; i++) if (position.getY(i) > position.getY(top)) top = i;
  return [position.getX(top), position.getY(top), position.getZ(top)];
}
const apex = apexOf();
const coreOffset = corePosition.toArray();

const breath = (time: number, phase = 0) => Math.sin((time / core.period) * TAU + phase);

function AreaLight({
  position,
  size,
  intensity,
  color,
}: {
  position: readonly [number, number, number];
  size: readonly [number, number];
  intensity: number;
  color: Color;
}) {
  const ref = useRef<RectAreaLight>(null);
  useEffect(() => {
    ref.current?.lookAt(0, lookHeight, 0);
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
      <ambientLight intensity={0.06} color={colors.fill} />
      <AreaLight
        position={quartzConfig.key.position}
        size={[3, 3]}
        intensity={6.5}
        color={colors.key}
      />
      <AreaLight position={[3.6, 1.4, 2]} size={[2.5, 3]} intensity={0.6} color={colors.fill} />
      <AreaLight position={[2.4, 2.6, -3]} size={[2, 3]} intensity={2.4} color={colors.warm} />
      <Environment resolution={compact ? 64 : 128} frames={1}>
        <Lightformer
          form="rect"
          position={[-3, 4, 3]}
          scale={[4, 4, 1]}
          intensity={3.2}
          color={colors.key}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="rect"
          position={[4, 1.5, 1]}
          scale={[2, 4, 1]}
          intensity={0.35}
          color={colors.fill}
          target={[0, 1, 0]}
        />
        <Lightformer
          form="rect"
          position={[0, 5, -3]}
          scale={[6, 1.2, 1]}
          intensity={1.4}
          color={colors.warm}
          target={[0, 1, 0]}
        />
      </Environment>
    </>
  );
}

function CameraRig({ variant, compact, animate }: Pick<Props, "variant" | "compact" | "animate">) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const base = useRef(new Vector3());

  const aim = useRef(new Vector3());

  useLayoutEffect(() => {
    const frame = lens.framing[compact ? "compact" : variant];
    const aspect = size.width / Math.max(size.height, 1);
    const halfFov = MathUtils.degToRad((compact ? lens.compactFov : lens.fov) / 2);
    const halfHeight = Math.max(
      crystalSize.height / 2 / frame.height,
      crystalSize.width / 2 / (frame.maxWidth * aspect),
    );
    const distance = halfHeight / Math.tan(halfFov);
    const sideways = -(frame.centre - 0.5) * 2 * halfHeight * aspect;
    aim.current.set(sideways, lookHeight, 0);
    base.current.set(sideways, lookHeight + lens.lift, distance);
    camera.position.copy(base.current);
    camera.lookAt(aim.current);
  }, [camera, size, variant, compact]);

  useFrame((state, delta) => {
    if (!animate || compact) return;
    const [px, py] = lens.parallax;
    eye.set(
      base.current.x + state.pointer.x * px,
      base.current.y + state.pointer.y * py,
      base.current.z,
    );
    state.camera.position.x = MathUtils.damp(state.camera.position.x, eye.x, lens.damping, delta);
    state.camera.position.y = MathUtils.damp(state.camera.position.y, eye.y, lens.damping, delta);
    state.camera.lookAt(aim.current);
  });
  return null;
}

function Crystal({ palette, compact, animate, variant, labelTargets }: Props) {
  const sculpture = useRef<Group>(null);
  const coreLight = useRef<PointLight>(null);
  const echoLight = useRef<PointLight>(null);
  const causticMaterial = useRef<ShaderMaterial>(null);
  const fractureMaterials = useRef(new Map<number, ShaderMaterial>());

  const colors = useMemo(
    () => ({
      body: tint(palette.pearl).lerp(new Color(1, 1, 1), stone.lift),
      amber: tint(palette.amber),
      light: tint(palette.amber).lerp(new Color(1, 1, 1), 0.35),
      glow: tint(palette.amber).lerp(tint(palette.warm), 0.35),
      warm: tint(palette.warm),
      fill: tint(palette.fill),
      key: tint(palette.key).lerp(tint(palette.warm), 0.12),
      shade: tint(palette.shade),
      surface: tint(palette.surface),
      smoke: tint(palette.smoke),
      earth: tint(palette.earth),
    }),
    [palette],
  );
  const anchors: LabelAnchor[] = [
    { id: "cloud", object: () => sculpture.current, offset: apex },
    { id: "control", object: () => sculpture.current, offset: coreOffset },
  ];
  useLabelAnchors(labelTargets, anchors);
  const shown = fractures.filter(({ fracture }) => !compact || fracture.compact);

  useLayoutEffect(() => {
    const group = sculpture.current;
    if (!group) return;
    group.updateWorldMatrix(true, false);
    quartzUniforms.uCore.value.copy(corePosition).applyMatrix4(group.matrixWorld);
    quartzUniforms.uAmber.value.copy(colors.light);
    quartzUniforms.uHoney.value.copy(colors.warm).lerp(colors.body, 0.3);
    quartzUniforms.uSmoke.value.copy(colors.smoke).lerp(colors.body, 0.12);
    quartzUniforms.uEarth.value.copy(colors.earth).lerp(colors.warm, 0.3);
    causticUniforms.uColor.value.copy(colors.glow);
    fractures.forEach(({ uniforms }) => uniforms.uColor.value.copy(colors.light));
  }, [colors]);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    const pulse = breath(t);
    const swell = 1 + (pulse * core.breathe) / core.intensity;
    if (coreLight.current) coreLight.current.intensity = core.intensity * swell;
    if (echoLight.current)
      echoLight.current.intensity = (core.intensity + breath(t, 1.4) * core.breathe) * echo.share;
    quartzUniforms.uHalo.value = core.haloStrength * swell;
    const floor = causticMaterial.current?.uniforms;
    if (floor?.uGlow && floor.uTime) {
      floor.uGlow.value = swell;
      floor.uTime.value = t;
    }
    fractures.forEach(({ fracture }) => {
      const glow = fractureMaterials.current.get(fracture.phase)?.uniforms.uGlow;
      if (!glow) return;
      const [min, max] = fracture.glow;
      glow.value =
        MathUtils.lerp(min, max, (breath(t, fracture.phase) + 1) / 2) * stone.fractureGain;
    });
  });

  return (
    <>
      <color attach="background" args={[colors.surface]} />
      <StudioLighting colors={colors} compact={compact} />
      <CameraRig variant={variant} compact={compact} animate={animate} />
      <group
        ref={sculpture}
        position={[0, -quartzConfig.sink, 0]}
        rotation={[0, quartzConfig.yaw, 0]}
      >
        <mesh geometry={hullGeometry}>
          <meshPhysicalMaterial
            color={colors.body}
            roughness={stone.roughness}
            metalness={0}
            transmission={compact ? stone.compactTransmission : stone.transmission}
            thickness={stone.thickness}
            ior={stone.ior}
            clearcoat={stone.clearcoat}
            clearcoatRoughness={stone.clearcoatRoughness}
            attenuationColor={colors.body}
            attenuationDistance={stone.attenuationDistance}
            envMapIntensity={0.85}
            side={DoubleSide}
            onBeforeCompile={compileQuartz}
            customProgramCacheKey={() => "quartz-marble"}
          />
        </mesh>
        {shown.map(({ fracture, geometry, uniforms }) => (
          <mesh key={fracture.phase} geometry={geometry} renderOrder={2}>
            <shaderMaterial
              ref={(material) => {
                if (material) fractureMaterials.current.set(fracture.phase, material);
                else fractureMaterials.current.delete(fracture.phase);
              }}
              uniforms={uniforms}
              vertexShader={fractureVertex}
              fragmentShader={fractureFragment}
              side={DoubleSide}
              transparent
              blending={AdditiveBlending}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        ))}
        {cracks.slice(0, compact ? 1 : undefined).map(({ id, geometry, opacity }) => (
          <lineSegments key={id} geometry={geometry} renderOrder={3}>
            <lineBasicMaterial
              color={colors.amber}
              transparent
              opacity={opacity}
              depthTest={false}
              depthWrite={false}
              blending={AdditiveBlending}
            />
          </lineSegments>
        ))}
        <pointLight
          ref={coreLight}
          position={corePosition}
          color={colors.amber}
          intensity={core.intensity}
          distance={core.distance}
          decay={2}
        />
        <pointLight
          ref={echoLight}
          position={echoPosition}
          color={colors.amber}
          intensity={core.intensity * echo.share}
          distance={echo.distance}
          decay={2}
        />
        <Caustics material={causticMaterial} />
      </group>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={quartzConfig.shadow.opacity}
        scale={quartzConfig.shadow.scale}
        blur={quartzConfig.shadow.blur}
        far={quartzConfig.shadow.far}
        resolution={compact ? 256 : 512}
        color={colors.shade}
        frames={1}
      />
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={quartzConfig.contact.opacity}
        scale={quartzConfig.contact.scale}
        blur={quartzConfig.contact.blur}
        far={quartzConfig.contact.far}
        resolution={compact ? 256 : 512}
        color={colors.shade}
        frames={1}
      />
    </>
  );
}

function Caustics({ material }: { material: RefObject<ShaderMaterial | null> }) {
  return (
    <mesh
      position={[footprintCentre.x, quartzConfig.sink + 0.002, footprintCentre.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={-2}
    >
      <circleGeometry args={[caustics.radius, 64]} />
      <shaderMaterial
        ref={material}
        uniforms={causticUniforms}
        vertexShader={causticVertex}
        fragmentShader={causticFragment}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export function QuartzScene(props: Props) {
  return (
    <Canvas
      dpr={[1, props.compact ? 1.25 : 1.5]}
      frameloop={props.animate ? "always" : "demand"}
      camera={{ fov: props.compact ? lens.compactFov : lens.fov, near: 0.1, far: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <Crystal {...props} />
    </Canvas>
  );
}
