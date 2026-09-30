"use client";

import { ContactShadows, Environment, Lightformer, shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  DataTexture,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  Raycaster,
  RedFormat,
  RepeatWrapping,
  SRGBColorSpace,
  TubeGeometry,
  Vector2,
  Vector3,
  Vector4,
  type Group,
  type Mesh,
  type RectAreaLight,
  type ShaderMaterial,
  type Texture,
} from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

import type { Rgb01 } from "@/shared/lib";

import { networkConfig, type GlassVariant, type NetworkProfile } from "../config/network";
import { useLabelAnchors, type LabelAnchor } from "../lib/label-anchors";
import type { LabelTargets } from "../lib/label-registry";
import { MAX_NODES, surfaceFragment, surfaceVertex } from "../lib/water-shaders";
import { WaterSim } from "../lib/water-sim";

export interface NetworkPalette {
  ivory: Rgb01;
  ceramic: Rgb01;
  glass: Rgb01;
  metal: Rgb01;
  graphite: Rgb01;
  signal: Rgb01;
  key: Rgb01;
  fill: Rgb01;
  paper: Rgb01;
  sky: Rgb01;
  glint: Rgb01;
  shade: Rgb01;
}

export type NetworkVariant = "card" | "case";

export interface NetworkSceneProps {
  palette: NetworkPalette;
  profile: NetworkProfile;
  animate: boolean;
  variant: NetworkVariant;
  className?: string;
  onReady: () => void;
  labelTargets?: LabelTargets;
}

RectAreaLightUniformsLib.init();

const {
  nodes,
  links,
  glassVariants,
  link: linkConfig,
  signal,
  reaction,
  hover,
  parallax,
  water,
} = networkConfig;
const { floatMotion, ceramic: ceramicConfig, metal: metalConfig } = networkConfig;
const light = new Vector3(...networkConfig.lighting.key.position).normalize();
const eye = new Vector3();
const raycaster = new Raycaster();
const point = new Vector3();
const fallback = new Vector3();
const nodeState = nodes.map(
  (node) =>
    new Vector4(
      node.position[0],
      node.elevation ?? water.level + node.radius * water.float,
      node.position[1],
      node.radius,
    ),
);
const restPositions = nodeState.map((state) => new Vector3(state.x, state.y, state.z));
const nodeUniforms = Array.from({ length: MAX_NODES }, (_, i) => nodeState[i] ?? new Vector4());
const floatPeriods = nodes.map(
  (_, i) =>
    floatMotion.minPeriod + ((i * 1.37) % 1) * (floatMotion.maxPeriod - floatMotion.minPeriod),
);

function buildCurve(a: Vector3, b: Vector3, ra: number, rb: number): QuadraticBezierCurve3 {
  const direction = new Vector3().subVectors(b, a).normalize();
  const start = a.clone().addScaledVector(direction, ra * 0.92);
  const end = b.clone().addScaledVector(direction, -rb * 0.92);
  const span = start.distanceTo(end);
  const control = new Vector3().addVectors(start, end).multiplyScalar(0.5);
  control.add(new Vector3(-direction.z, 0, direction.x).multiplyScalar(span * linkConfig.bend));
  control.y += linkConfig.arc * Math.min(1, span);
  return new QuadraticBezierCurve3(start, control, end);
}

const curves = links.map((link) =>
  buildCurve(
    restPositions[link.from] ?? fallback,
    restPositions[link.to] ?? fallback,
    nodes[link.from]?.radius ?? 0,
    nodes[link.to]?.radius ?? 0,
  ),
);

const linkDepth = curves.map((curve) => {
  const z = curve.getPoint(0.5, point).z;
  return 1 - linkConfig.depthRange / 2 + (linkConfig.depthRange * (z + 1.4)) / 2.8;
});

const SurfaceMaterial = shaderMaterial(
  {
    water: null as Texture | null,
    light,
    eye,
    uNodes: nodeUniforms,
    uNodeCount: nodeState.length,
    uPaper: new Vector3(),
    uSky: new Vector3(),
    uGlint: new Vector3(),
    uShade: new Vector3(),
    uLampColor: new Vector3(),
    uLampNodes: new Vector2(...networkConfig.lamp.nodes),
    uExtent: new Vector2(...water.extent),
    uLevel: water.level,
    uFade: new Vector2(...water.fade),
    uOpacity: water.opacity,
    uTint: water.tint,
  },
  surfaceVertex,
  surfaceFragment,
);

extend({ SurfaceMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    surfaceMaterial: ThreeElement<typeof SurfaceMaterial>;
  }
}

function toColor(rgb: Rgb01): Color {
  return new Color().setRGB(rgb[0], rgb[1], rgb[2], SRGBColorSpace);
}

function vec(rgb: Rgb01): Vector3 {
  return new Vector3(rgb[0], rgb[1], rgb[2]);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createGrainTexture(size = 128): DataTexture {
  const data = new Uint8Array(size * size);
  for (let i = 0; i < data.length; i++) data[i] = 118 + Math.floor(Math.random() * 20);
  const texture = new DataTexture(data, size, size, RedFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(6, 3);
  texture.needsUpdate = true;
  return texture;
}

function createCeramic(palette: NetworkPalette, grain: Texture) {
  return new MeshPhysicalMaterial({
    color: toColor(palette.ceramic).lerp(new Color(1, 1, 1), 0.3),
    roughness: ceramicConfig.roughness,
    metalness: 0.12,
    iridescence: 0.28,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [220, 340],
    clearcoat: ceramicConfig.clearcoat,
    clearcoatRoughness: ceramicConfig.clearcoatRoughness,
    bumpMap: grain,
    bumpScale: ceramicConfig.bumpScale,
  });
}

function createGlass(palette: NetworkPalette, variant: GlassVariant) {
  const tint = toColor(palette.glass).lerp(new Color(1, 1, 1), 1 - variant.tint);
  return new MeshPhysicalMaterial({
    color: tint,
    roughness: variant.roughness,
    metalness: 0,
    transmission: 0.9,
    thickness: variant.thickness,
    ior: 1.45,
    attenuationColor: toColor(palette.glass),
    attenuationDistance: 1.4,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    specularIntensity: 0.9,
  });
}

function createMetal(palette: NetworkPalette) {
  return new MeshPhysicalMaterial({
    color: toColor(palette.ceramic).lerp(new Color(1, 1, 1), 0.18),
    iridescence: 0.32,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [240, 360],
    clearcoat: 0.8,
    clearcoatRoughness: 0.18,
    metalness: metalConfig.metalness,
    roughness: metalConfig.roughness,
    envMapIntensity: metalConfig.envMapIntensity,
  });
}

interface SignalState {
  link: number;
  reverse: boolean;
  t: number;
  active: boolean;
}

interface WorldState {
  time: number;
  simTime: number;
  wakeTime: number;
  wakeNode: number;
  signals: SignalState[];
  hoverCooldown: number;
  hovered: number;
  yaw: number;
  pitch: number;
  reactions: number[];
  brighten: number[];
  lift: number[];
  linkOpacity: number[];
  linkWarmth: number[];
  revealed: number[];
}

function createWorld(): WorldState {
  return {
    time: 0,
    simTime: 0,
    wakeTime: 0,
    wakeNode: 0,
    signals: links.map((link, i) => ({
      link: i,
      reverse: i % 2 === 1,
      t: -i * 0.22,
      active: !link.latent,
    })),
    hoverCooldown: 0,
    hovered: -1,
    yaw: 0,
    pitch: 0,
    reactions: nodes.map(() => reaction.duration),
    brighten: nodes.map(() => 0),
    lift: nodes.map(() => 0),
    linkOpacity: links.map((link, i) =>
      link.latent ? 0 : linkConfig.opacity * (linkDepth[i] ?? 1),
    ),
    linkWarmth: links.map(() => 0),
    revealed: links.map(() => 0),
  };
}

function startSignal(state: WorldState, linkIndex: number, reverse: boolean) {
  state.signals[linkIndex] = { link: linkIndex, reverse, t: 0, active: true };
  if (links[linkIndex]?.latent) state.revealed[linkIndex] = signal.travel + signal.revealHold;
}

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
    ref.current?.lookAt(0, 0, 0);
  }, []);
  return (
    <rectAreaLight ref={ref} position={[...position]} args={[color, intensity, size[0], size[1]]} />
  );
}

function Network({
  palette,
  profile,
  animate,
  onReady,
  labelTargets,
}: Omit<NetworkSceneProps, "className" | "variant">) {
  const gl = useThree((state) => state.gl);
  const readySent = useRef(false);
  const group = useRef<Group>(null);
  const signalMeshes = useRef<Array<Mesh | null>>([]);
  const surfaceMaterial = useRef<ShaderMaterial>(null);
  const nodeMeshes = useRef<Array<Mesh | null>>([]);
  const sim = useRef<WaterSim | null>(null);
  const world = useRef<WorldState>(createWorld());

  const colors = useMemo(
    () => ({
      graphite: toColor(palette.graphite),
      signal: toColor(palette.signal),
      key: toColor(palette.key),
      fill: toColor(palette.fill),
    }),
    [palette],
  );
  const grain = useMemo(() => createGrainTexture(), []);
  const nodeMaterials = useMemo(
    () =>
      nodes.map((node, index) => {
        if (index === 0) {
          return new MeshPhysicalMaterial({
            color: toColor(palette.ivory),
            metalness: 0,
            roughness: 0.5,
            clearcoat: 0.18,
            clearcoatRoughness: 0.45,
            envMapIntensity: 0.65,
            bumpMap: grain,
            bumpScale: 0.0006,
          });
        }
        if (index === 5 || index === 8) {
          return new MeshStandardMaterial({
            color: toColor(palette.metal).lerp(toColor(palette.ceramic), 0.4),
            metalness: 0.65,
            roughness: 0.3,
            envMapIntensity: 1,
          });
        }
        if (networkConfig.lamp.nodes.some((lampIndex) => lampIndex === index)) {
          return new MeshPhysicalMaterial({
            color: toColor(palette.glass).lerp(new Color(1, 1, 1), 0.35),
            transmission: 0.97,
            envMapIntensity: 0.65,
            thickness: node.radius * 0.25,
            ior: 1.5,
            roughness: 0.025,
            clearcoat: 0.3,
            clearcoatRoughness: 0.08,
          });
        }
        if (node.finish === "ceramic") return createCeramic(palette, grain);
        if (node.finish === "metal") return createMetal(palette);
        const variant = glassVariants[node.variant ?? 0] ?? glassVariants[0];
        return createGlass(palette, variant ?? { roughness: 0.1, tint: 0.3, thickness: 0.8 });
      }),
    [palette, grain],
  );
  const baseColors = useMemo(() => nodeMaterials.map((m) => m.color.clone()), [nodeMaterials]);
  const wires = useMemo(
    () =>
      curves.map((curve, i) => ({
        geometry: new TubeGeometry(
          curve,
          linkConfig.segments,
          linkConfig.radius * (linkDepth[i] ?? 1),
          5,
          false,
        ),
        material: new MeshStandardMaterial({
          color: colors.graphite.clone(),
          roughness: 0.5,
          metalness: 0.4,
          transparent: true,
          opacity: links[i]?.latent ? 0 : linkConfig.opacity * (linkDepth[i] ?? 1),
          depthWrite: false,
        }),
      })),
    [colors],
  );
  const signalMaterials = useMemo(
    () => ({
      core: new MeshBasicMaterial({ color: colors.signal }),
      halo: new MeshBasicMaterial({
        color: colors.signal,
        transparent: true,
        opacity: signal.haloOpacity,
        depthWrite: false,
      }),
    }),
    [colors],
  );

  useEffect(() => {
    const instance = new WaterSim(gl, profile.sim, water.extent);
    sim.current = instance;
    return () => {
      sim.current = null;
      instance.dispose();
    };
  }, [gl, profile.sim]);

  useEffect(() => {
    return () => {
      grain.dispose();
      for (const material of nodeMaterials) material.dispose();
      for (const wire of wires) {
        wire.geometry.dispose();
        wire.material.dispose();
      }
      signalMaterials.core.dispose();
      signalMaterials.halo.dispose();
    };
  }, [grain, nodeMaterials, wires, signalMaterials]);

  const anchors: LabelAnchor[] = Object.entries(networkConfig.labelNodes).map(
    ([id, { node, side }]) => {
      const radius = nodes[node]?.radius ?? 0;
      return {
        id,
        object: () => nodeMeshes.current[node],
        offset: [side[0] * radius, side[1] * radius, side[2] * radius],
        mirror: true,
      };
    },
  );
  useLabelAnchors(labelTargets, anchors);

  useFrame((state, delta) => {
    const s = world.current;
    const waterSim = sim.current;
    const container = group.current;
    if (!waterSim || !container) return;
    const dt = Math.min(delta, 0.05);

    if (animate) {
      s.time += dt;
      s.yaw = damp(s.yaw, state.pointer.x * parallax.yaw, parallax.damping, dt);
      s.pitch = damp(s.pitch, -state.pointer.y * parallax.pitch, parallax.damping, dt);
      container.rotation.set(s.pitch, s.yaw, 0);

      const meshes = nodeMeshes.current;
      raycaster.setFromCamera(state.pointer, state.camera);
      const hit = raycaster.intersectObjects(
        meshes.filter((mesh): mesh is Mesh => mesh !== null),
        false,
      )[0];
      const previousHovered = s.hovered;
      s.hovered = hit ? nodeMeshes.current.findIndex((mesh) => mesh === hit.object) : -1;

      s.hoverCooldown -= dt;
      if (s.hovered >= 0 && s.hovered !== previousHovered && s.hoverCooldown <= 0) {
        const linkIndex = links.findIndex((l) => l.from === s.hovered || l.to === s.hovered);
        if (linkIndex >= 0) {
          startSignal(s, linkIndex, links[linkIndex]?.to === s.hovered);
          s.hoverCooldown = signal.hoverCooldown;
        }
      }

      for (const pulse of s.signals) {
        if (!pulse.active) continue;
        pulse.t += dt / signal.travel;
        const link = links[pulse.link];
        const curve = curves[pulse.link];
        if (!link || !curve) continue;
        if (pulse.t >= 1) {
          const target = pulse.reverse ? link.from : link.to;
          const rest = restPositions[target];
          s.reactions[target] = 0;
          if (rest) waterSim.addDrop(rest.x, rest.z, water.drop.radius, -water.drop.strength);
          pulse.t = -random(signal.idleMin, signal.idleMax) / signal.travel;
          pulse.reverse = !pulse.reverse;
        } else if (pulse.t >= 0) {
          const progress = smooth(pulse.t);
          curve.getPoint(pulse.reverse ? 1 - progress : progress, point);
          signalMeshes.current[pulse.link]?.position.copy(point);
        }
      }

      s.wakeTime += dt;
      if (s.wakeTime >= water.wake.interval) {
        s.wakeTime -= water.wake.interval;
        const buoy = nodes[s.wakeNode];
        if (buoy) {
          const phase = s.time * water.wake.speed + s.wakeNode;
          waterSim.addDrop(
            buoy.position[0] + Math.cos(phase) * buoy.radius,
            buoy.position[1] + Math.sin(phase) * buoy.radius,
            water.wake.radius,
            water.wake.strength,
          );
        }
        s.wakeNode = (s.wakeNode + 1) % nodes.length;
      }

      s.simTime = Math.min(s.simTime + dt, water.simStep * water.maxStepsPerFrame);
      while (s.simTime >= water.simStep) {
        waterSim.stepWaves();
        s.simTime -= water.simStep;
      }
    }

    waterSim.updateNormals();
    eye.copy(state.camera.position);
    const surface = surfaceMaterial.current;
    if (surface) {
      const { water: waterUniform, eye: eyeUniform, uNodes } = surface.uniforms;
      if (waterUniform) waterUniform.value = waterSim.texture;
      if (eyeUniform) eyeUniform.value = eye;
      if (uNodes) uNodes.value = nodeUniforms;
    }

    for (const pulse of s.signals) {
      const mesh = signalMeshes.current[pulse.link];
      if (mesh) mesh.visible = animate && pulse.active && pulse.t >= 0;
    }

    nodes.forEach((node, i) => {
      const mesh = nodeMeshes.current[i];
      const material = nodeMaterials[i];
      const base = baseColors[i];
      const rest = restPositions[i];
      const stateVec = nodeState[i];
      if (!mesh || !material || !base || !rest || !stateVec) return;

      const period = floatPeriods[i] ?? floatMotion.minPeriod;
      const bob = floatMotion.amplitude * Math.sin((s.time * Math.PI * 2) / period + i * 1.7);
      const hovered = s.hovered === i;
      s.lift[i] = damp(s.lift[i] ?? 0, hovered ? hover.lift : 0, hover.damping, dt);
      s.brighten[i] = damp(s.brighten[i] ?? 0, hovered ? hover.brighten : 0, hover.damping, dt);
      const y = rest.y + bob + (s.lift[i] ?? 0);
      stateVec.set(rest.x, y, rest.z, node.radius);
      mesh.position.set(rest.x, y, rest.z);

      const age = s.reactions[i] ?? reaction.duration;
      s.reactions[i] = age + dt;
      const pulse =
        age < reaction.duration
          ? 1 +
            reaction.amplitude *
              Math.exp(-reaction.decay * age) *
              Math.sin(reaction.frequency * age)
          : 1;
      mesh.scale.set(node.scale[0] * pulse, node.scale[1] * pulse, node.scale[2] * pulse);
      material.color.copy(base).multiplyScalar(1 + (s.brighten[i] ?? 0));
    });

    links.forEach((link, i) => {
      const wire = wires[i];
      if (!wire) return;
      const depth = linkDepth[i] ?? 1;
      s.revealed[i] = Math.max(0, (s.revealed[i] ?? 0) - dt);
      const shown = !link.latent || (s.revealed[i] ?? 0) > 0;
      const touchesHover = link.from === s.hovered || link.to === s.hovered;
      const pulse = s.signals[i];
      const carrying = pulse !== undefined && pulse.active && pulse.t >= 0;
      let target = shown ? linkConfig.opacity : 0;
      if (shown && carrying) target = linkConfig.activeOpacity;
      if (shown && touchesHover) target = linkConfig.hoverOpacity;
      s.linkOpacity[i] = damp(s.linkOpacity[i] ?? 0, target * depth, hover.damping, dt);
      wire.material.opacity = s.linkOpacity[i] ?? 0;
      s.linkWarmth[i] = damp(s.linkWarmth[i] ?? 0, carrying ? 1 : 0, linkConfig.warmDamping, dt);
      wire.material.color.copy(colors.graphite).lerp(colors.signal, s.linkWarmth[i] ?? 0);
    });

    if (!readySent.current) {
      readySent.current = true;
      onReady();
    }
  });

  const { key, fill, ambient, environment } = networkConfig.lighting;

  return (
    <>
      <ambientLight intensity={ambient} color={colors.fill} />
      <AreaLight
        position={key.position}
        size={key.size}
        intensity={key.intensity}
        color={colors.key}
      />
      <AreaLight
        position={fill.position}
        size={fill.size}
        intensity={fill.intensity}
        color={colors.fill}
      />
      <Environment resolution={128} frames={1} environmentIntensity={environment}>
        <Lightformer
          form="rect"
          intensity={1}
          color={colors.key}
          position={[-3, 5, 3]}
          scale={[9, 6, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.45}
          color={colors.fill}
          position={[5, 2.5, -3]}
          scale={[7, 4, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="circle"
          intensity={0.35}
          color={colors.fill}
          position={[0, -4, 0]}
          scale={8}
          target={[0, 0, 0]}
        />
      </Environment>
      <ContactShadows
        position={[0, -0.48, 0]}
        opacity={0.3}
        scale={7}
        blur={2.8}
        far={2.5}
        resolution={256}
        frames={1}
        color={colors.graphite}
      />
      <group ref={group}>
        <pointLight
          position={[0.8, 0.3, -0.3]}
          color={colors.signal}
          intensity={0.35}
          distance={2}
          decay={2}
        />
        <mesh frustumCulled={false} renderOrder={2}>
          <planeGeometry args={[2, 2, profile.surfaceGrid, profile.surfaceGrid]} />
          <surfaceMaterial
            ref={surfaceMaterial}
            transparent
            depthWrite={false}
            side={DoubleSide}
            uPaper={vec(palette.paper)}
            uSky={vec(palette.sky)}
            uGlint={vec(palette.glint)}
            uShade={vec(palette.shade)}
            uLampColor={vec(palette.signal)}
          />
        </mesh>
        {nodes.map((node, i) => (
          <mesh
            key={node.position.join(",")}
            material={nodeMaterials[i]}
            position={restPositions[i]}
            ref={(mesh) => {
              nodeMeshes.current[i] = mesh;
            }}
          >
            <sphereGeometry
              args={[node.radius, profile.sphereSegments, profile.sphereSegments / 2]}
            />
            {networkConfig.lamp.nodes.some((lampIndex) => lampIndex === i) && (
              <mesh>
                <sphereGeometry args={[node.radius * networkConfig.lamp.coreScale, 32, 24]} />
                <meshStandardMaterial
                  color={colors.signal}
                  emissive={colors.signal}
                  emissiveIntensity={networkConfig.lamp.intensity}
                  toneMapped
                  roughness={0.25}
                />
              </mesh>
            )}
          </mesh>
        ))}
        {wires.map((wire, i) => (
          <mesh
            key={`${links[i]?.from}-${links[i]?.to}`}
            geometry={wire.geometry}
            material={wire.material}
            renderOrder={1}
          />
        ))}
        {links.map((link, i) => (
          <mesh
            key={`signal-${link.from}-${link.to}`}
            ref={(mesh) => {
              signalMeshes.current[i] = mesh;
            }}
            visible={false}
            material={signalMaterials.core}
            renderOrder={3}
          >
            <sphereGeometry args={[signal.radius, 24, 16]} />
            <mesh scale={signal.haloScale} material={signalMaterials.halo}>
              <sphereGeometry args={[signal.radius, 24, 16]} />
            </mesh>
          </mesh>
        ))}
      </group>
    </>
  );
}

function cameraFor(variant: NetworkVariant, profile: NetworkProfile) {
  if (variant === "case") return networkConfig.caseCamera;
  return profile === networkConfig.mobile ? networkConfig.mobileCamera : networkConfig.cardCamera;
}

export function NetworkScene({ className, onReady, profile, variant, ...rest }: NetworkSceneProps) {
  const { position, target, fov } = cameraFor(variant, profile);
  return (
    <Canvas
      key={profile.sphereSegments}
      className={className}
      dpr={profile.dpr}
      frameloop={rest.animate ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [...position], fov, near: 0.1, far: 50 }}
      onCreated={(state) => {
        state.camera.lookAt(target[0], target[1], target[2]);
      }}
    >
      <Network profile={profile} onReady={onReady} {...rest} />
    </Canvas>
  );
}
