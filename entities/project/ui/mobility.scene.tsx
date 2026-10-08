"use client";

import { Billboard, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type ShaderMaterial,
} from "three";

import { mobilityConfig, type BeadFinish } from "../config/mobility";
import { useLabelAnchors, type LabelAnchor } from "../lib/label-anchors";
import type { LabelTargets } from "../lib/label-registry";
import { laneCurves } from "../lib/mobility-lanes";
import { LaneFilament, LanePulse } from "./lane-pulse.scene";

type Rgb = readonly [number, number, number];
export interface MobilityPalette {
  pearl: Rgb;
  metal: Rgb;
  glass: Rgb;
  amber: Rgb;
  sun: Rgb;
  accent: Rgb;
  warm: Rgb;
  fill: Rgb;
  paper: Rgb;
  card: Rgb;
}
interface Props {
  palette: MobilityPalette;
  compact: boolean;
  variant: "card" | "case";
  animate: boolean;
  labelTargets?: LabelTargets;
}

const { hero, heroLane, trail, lanes, beads, camera } = mobilityConfig;
const heroCurve = laneCurves[heroLane];
const color = (rgb: Rgb) => new Color().setRGB(rgb[0], rgb[1], rgb[2]);
const cssColor = (rgb: Rgb) => new Color().setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace);
const EDGE_FADE = 0.025;
const START = 0.2;

type Point = readonly [number, number, number];
function lanePoint(lane: number, t: number, lift: number): Point {
  const p = laneCurves[lane]?.getPointAt(t);
  return p ? [p.x, p.y + lift, p.z] : [0, 0, 0];
}
const flowPoint = lanePoint(3, 0.4, 0.05);
const stateBead = beads[0];
const statePoint = stateBead
  ? lanePoint(stateBead.lane, stateBead.t, stateBead.radius)
  : ([0, 0, 0] as const);

function glassFinish(palette: MobilityPalette, compact: boolean) {
  const tint = color(palette.glass).lerp(new Color(1, 1, 1), 0.85);
  return compact
    ? {
        color: tint,
        roughness: 0.06,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.42,
      }
    : {
        color: tint,
        roughness: 0.04,
        metalness: 0,
        transmission: 1,
        thickness: 0.35,
        ior: 1.47,
        attenuationColor: color(palette.warm),
        attenuationDistance: 2.5,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        specularIntensity: 1,
      };
}

function cableFinish(
  finish: "pearl" | "satin" | "glass",
  palette: MobilityPalette,
  compact: boolean,
) {
  if (finish === "glass") return glassFinish(palette, compact);
  if (finish === "satin") {
    return {
      color: color(palette.pearl).lerp(color(palette.sun), 0.22),
      roughness: 0.22,
      metalness: 0.35,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
    };
  }
  return {
    color: color(palette.pearl),
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    sheen: 0.6,
    sheenColor: color(palette.warm),
    iridescence: 0.35,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [250, 500] as [number, number],
  };
}

function beadFinish(finish: BeadFinish, palette: MobilityPalette, compact: boolean) {
  const pearl = color(palette.pearl);
  switch (finish) {
    case "glass":
      return glassFinish(palette, compact);
    case "gold":
      return {
        color: color(palette.amber).multiplyScalar(0.8),
        roughness: 0.22,
        metalness: 0.75,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      };
    case "champagne":
      return {
        color: pearl.clone().lerp(color(palette.warm), 0.35),
        roughness: 0.28,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0.9,
        iridescenceIOR: 1.4,
        iridescenceThicknessRange: [300, 600] as [number, number],
      };
    case "silver":
      return {
        color: color(palette.metal).lerp(pearl, 0.5),
        roughness: 0.3,
        metalness: 0.8,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
      };
    case "graphite":
      return {
        color: color(palette.metal).multiplyScalar(0.55),
        roughness: 0.26,
        metalness: 0.7,
        clearcoat: 0.6,
        clearcoatRoughness: 0.12,
      };
    case "pearl":
      return {
        color: pearl,
        roughness: 0.45,
        metalness: 0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
      };
    default:
      return finish satisfies never;
  }
}

const trailVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const trailFragment = /* glsl */ `
  uniform float uProgress;
  uniform float uLength;
  uniform float uLead;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float behind = uProgress - vUv.x;
    float tail = behind >= 0.0
      ? pow(clamp(1.0 - behind / uLength, 0.0, 1.0), 2.2)
      : smoothstep(-uLead, 0.0, behind);
    gl_FragColor = vec4(uColor, tail * uOpacity);
    #include <colorspace_fragment>
  }
`;

const sunVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const sunFragment = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uRim;
  uniform float uRimPower;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float facing = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
    gl_FragColor = vec4(mix(uRim, uCore, pow(facing, uRimPower)), 1.0);
    #include <colorspace_fragment>
  }
`;

const haloVertex = trailVertex;

const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uCore;
  uniform float uOpacity;
  uniform float uFalloff;
  uniform float uInner;
  varying vec2 vUv;
  void main() {
    float d = clamp(length(vUv - 0.5) * 2.0, 0.0, 1.0);
    float wide = pow(1.0 - d, uFalloff);
    float tight = pow(1.0 - d, uInner);
    float glow = clamp(wide * 0.8 + tight * 0.7, 0.0, 1.0);
    gl_FragColor = vec4(mix(uColor, uCore, tight), glow * uOpacity);
    #include <colorspace_fragment>
  }
`;

function viewFor(variant: Props["variant"], compact: boolean) {
  return compact ? camera.compact : camera[variant];
}

function Lanes({ palette, animate, compact, variant, labelTargets }: Props) {
  const view = viewFor(variant, compact);
  const backdrop = cssColor(variant === "card" ? palette.card : palette.paper);
  const pearl = useRef<Mesh>(null);
  const trailMaterial = useRef<ShaderMaterial>(null);
  const sculpture = useRef<Group>(null);
  const progress = useRef(START);
  const uniforms = useMemo(
    () => ({
      uProgress: { value: START },
      uLength: { value: trail.length },
      uLead: { value: trail.lead },
      uOpacity: { value: trail.opacity },
      uColor: { value: color(palette.sun).lerp(color(palette.warm), trail.warmth) },
    }),
    [palette],
  );
  const sun = useMemo(() => color(palette.sun), [palette]);
  const haloMaterial = useRef<ShaderMaterial>(null);
  const sunUniforms = useMemo(
    () => ({
      uCore: { value: color(palette.sun).lerp(new Color(1, 1, 1), hero.coreWhite) },
      uRim: { value: color(palette.sun).lerp(color(palette.accent), hero.rimWarmth) },
      uRimPower: { value: hero.rimPower },
    }),
    [palette],
  );
  const haloUniforms = useMemo(
    () => ({
      uColor: { value: color(palette.sun) },
      uCore: { value: color(palette.sun).lerp(new Color(1, 1, 1), hero.coreWhite) },
      uOpacity: { value: hero.halo.opacity },
      uFalloff: { value: hero.halo.falloff },
      uInner: { value: hero.halo.inner },
    }),
    [palette],
  );
  const visible = lanes
    .map((lane, index) => ({ lane, index, curve: laneCurves[index] }))
    .filter(({ lane }) => !compact || lane.compact);
  const visibleBeads = beads.filter((bead) => !compact || lanes[bead.lane]?.compact);
  const segments = compact ? 96 : 160;

  const anchors: LabelAnchor[] = [
    {
      id: "live",
      object: () => pearl.current,
      offset: [0, mobilityConfig.heroRadius, 0],
      fade: () => pearl.current?.scale.x ?? 0,
      mirror: true,
    },
    { id: "flow", object: () => sculpture.current, offset: flowPoint },
    { id: "state", object: () => sculpture.current, offset: statePoint },
  ];
  useLabelAnchors(labelTargets, anchors);

  useFrame((state, delta) => {
    if (animate)
      progress.current = (progress.current + Math.min(delta, 0.05) / mobilityConfig.traversal) % 1;
    const t = progress.current;
    const fade = Math.min(1, t / EDGE_FADE, (1 - t) / EDGE_FADE);
    if (pearl.current && heroCurve) {
      heroCurve.getPointAt(t, pearl.current.position);
      pearl.current.scale.setScalar(fade);
    }
    const u = trailMaterial.current?.uniforms;
    if (u?.uProgress && u.uOpacity) {
      u.uProgress.value = t;
      u.uOpacity.value = trail.opacity * fade;
    }
    const halo = haloMaterial.current?.uniforms.uOpacity;
    if (halo) {
      const breath = animate
        ? Math.sin(state.clock.elapsedTime * hero.halo.pulseSpeed) * hero.halo.pulse
        : 0;
      halo.value = hero.halo.opacity * (1 + breath);
    }
    if (sculpture.current && animate && !compact) {
      sculpture.current.position.x = MathUtils.damp(
        sculpture.current.position.x,
        state.pointer.x * 0.12,
        4,
        delta,
      );
      sculpture.current.position.y = MathUtils.damp(
        sculpture.current.position.y,
        view.baseY + state.pointer.y * 0.06,
        4,
        delta,
      );
    }
  });

  return (
    <>
      <color attach="background" args={[backdrop]} />
      <fog attach="fog" args={[backdrop, mobilityConfig.fog.near, mobilityConfig.fog.far]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[-3, 5, 4]} intensity={2} color={color(palette.warm)} />
      <Environment resolution={compact ? 128 : 256}>
        <Lightformer
          intensity={4}
          position={[-3, 4, 3]}
          scale={[5, 4, 1]}
          target={[0, 0, 0]}
          color={color(palette.warm)}
        />
        <Lightformer
          intensity={1.5}
          position={[4, 2, -3]}
          scale={[4, 3, 1]}
          target={[0, 0, 0]}
          color={color(palette.fill)}
        />
      </Environment>
      <group ref={sculpture} scale={view.scale} position={[0, view.baseY, 0]}>
        {visible.map(({ lane, index, curve }) =>
          curve ? (
            <group key={index}>
              <mesh>
                <tubeGeometry args={[curve, segments, lane.radius, 12, false]} />
                <meshPhysicalMaterial {...cableFinish(lane.finish, palette, compact)} />
              </mesh>
              {lane.finish === "glass" && (
                <LaneFilament curve={curve} radius={lane.radius} segments={segments} sun={sun} />
              )}
              {index !== heroLane && (
                <LanePulse
                  curve={curve}
                  radius={lane.radius}
                  index={index}
                  segments={segments}
                  sun={sun}
                  animate={animate}
                />
              )}
            </group>
          ) : null,
        )}
        {visibleBeads.map((bead) => (
          <mesh key={`${bead.lane}-${bead.t}`} position={laneCurves[bead.lane]?.getPointAt(bead.t)}>
            <sphereGeometry args={[bead.radius, 40, 24]} />
            <meshPhysicalMaterial {...beadFinish(bead.finish, palette, compact)} />
          </mesh>
        ))}
        <mesh renderOrder={2}>
          <tubeGeometry
            args={[
              heroCurve,
              segments,
              (lanes[heroLane]?.radius ?? 0.05) * trail.radiusScale,
              12,
              false,
            ]}
          />
          <shaderMaterial
            ref={trailMaterial}
            transparent
            depthWrite={false}
            uniforms={uniforms}
            vertexShader={trailVertex}
            fragmentShader={trailFragment}
          />
        </mesh>
        <mesh ref={pearl} position={heroCurve?.getPointAt(START)}>
          <sphereGeometry args={[mobilityConfig.heroRadius, compact ? 32 : 48, 32]} />
          <shaderMaterial
            uniforms={sunUniforms}
            vertexShader={sunVertex}
            fragmentShader={sunFragment}
          />
          <Billboard>
            <mesh renderOrder={3}>
              <planeGeometry
                args={[
                  mobilityConfig.heroRadius * hero.halo.scale * 2,
                  mobilityConfig.heroRadius * hero.halo.scale * 2,
                ]}
              />
              <shaderMaterial
                ref={haloMaterial}
                transparent
                depthWrite={false}
                uniforms={haloUniforms}
                vertexShader={haloVertex}
                fragmentShader={haloFragment}
              />
            </mesh>
          </Billboard>
          <pointLight
            color={color(palette.sun)}
            intensity={hero.light.intensity}
            distance={hero.light.distance}
            decay={hero.light.decay}
          />
        </mesh>
      </group>
      <ContactShadows
        position={[0, view.baseY - 0.2, 0]}
        opacity={0.24}
        scale={9}
        blur={2.5}
        far={2}
        resolution={compact ? 128 : 256}
        frames={animate ? Infinity : 1}
      />
    </>
  );
}

export function MobilityScene(props: Props) {
  const view = viewFor(props.variant, props.compact);
  return (
    <Canvas
      key={`${props.compact}-${props.variant}`}
      dpr={props.animate ? [1, props.compact ? 1.25 : 1.5] : 1}
      frameloop={props.animate ? "always" : "demand"}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: camera.position, fov: view.fov }}
      onCreated={(state) => state.camera.lookAt(...view.target)}
    >
      <Lanes {...props} />
    </Canvas>
  );
}
