"use client";

import { shaderMaterial } from "@react-three/drei";
import { Canvas, extend, useFrame, useThree, type ThreeElement } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Raycaster,
  Vector2,
  Vector3,
  Vector4,
  type Mesh,
  type ShaderMaterial,
  type Texture,
} from "three";

import type { Rgb01 } from "../../../shared/lib";
import { poolConfig, type PoolProfile } from "../config/pool";
import { CausticsPass } from "../lib/caustics-pass";
import {
  ballFragment,
  ballVertex,
  basinFragment,
  sandVertex,
  skirtFragment,
  skirtVertex,
  waterFragment,
  waterVertex,
} from "../lib/pool-shaders";
import { WaterSim } from "../lib/water-sim";

export interface PoolPalette {
  sand: Rgb01;
  sandWet: Rgb01;
  above: Rgb01;
  underwater: Rgb01;
  skyHorizon: Rgb01;
  skyZenith: Rgb01;
  sunGlow: Rgb01;
  sun: Rgb01;
  ballWhite: Rgb01;
  ballA: Rgb01;
  ballB: Rgb01;
  ballC: Rgb01;
}

export interface PoolSceneProps {
  palette: PoolPalette;
  profile: PoolProfile;
  animate: boolean;
  className?: string;
  onReady: () => void;
}

const light = new Vector3(...poolConfig.light).normalize();
const raycaster = new Raycaster();
const hit = new Vector3();
const lastPointer = new Vector2();
const eye = new Vector3();
const ballState = new Vector4(0, 0, 0, poolConfig.ball.radius);
const ballPrevious = new Vector3();
const ballNext = new Vector3();

const sharedUniforms = {
  light,
  eye,
  uBall: ballState,
  water: null as Texture | null,
  causticTex: null as Texture | null,
  uSand: new Vector3(),
  uSandWet: new Vector3(),
  uBallWhite: new Vector3(),
  uBallA: new Vector3(),
  uBallB: new Vector3(),
  uBallC: new Vector3(),
};

const SkirtMaterial = shaderMaterial(
  { light, uSand: new Vector3(), uSandWet: new Vector3() },
  skirtVertex,
  skirtFragment,
);
const SandMaterial = shaderMaterial(
  { ...sharedUniforms, uUnderwater: new Vector3() },
  sandVertex,
  basinFragment,
);
const BallMaterial = shaderMaterial(
  {
    light,
    eye,
    uBall: ballState,
    uBallWhite: new Vector3(),
    uBallA: new Vector3(),
    uBallB: new Vector3(),
    uBallC: new Vector3(),
  },
  ballVertex,
  ballFragment,
);
const WaterMaterial = shaderMaterial(
  {
    ...sharedUniforms,
    uAbove: new Vector3(),
    uSkyHorizon: new Vector3(),
    uSkyZenith: new Vector3(),
    uSunGlow: new Vector3(),
    uSun: new Vector3(),
  },
  waterVertex,
  waterFragment,
);

extend({ SkirtMaterial, SandMaterial, BallMaterial, WaterMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    skirtMaterial: ThreeElement<typeof SkirtMaterial>;
    sandMaterial: ThreeElement<typeof SandMaterial>;
    ballMaterial: ThreeElement<typeof BallMaterial>;
    waterMaterial: ThreeElement<typeof WaterMaterial>;
  }
}

function vec(rgb: Rgb01): Vector3 {
  return new Vector3(rgb[0], rgb[1], rgb[2]);
}

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Four vertical strips around the slab; y holds a 0/1 flag the skirt shader resolves to heights.
function skirtGeometry(segments: number): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const sides: Array<(t: number) => [number, number]> = [
    (t) => [1, t],
    (t) => [-1, t],
    (t) => [t, 1],
    (t) => [t, -1],
  ];
  for (const side of sides) {
    const base = positions.length / 3;
    for (let i = 0; i <= segments; i++) {
      const [x, z] = side(-1 + (2 * i) / segments);
      positions.push(x, 0, z, x, 1, z);
    }
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(indices);
  return geometry;
}

function ballPosition(time: number, target: Vector3) {
  const { orbitCenter, orbitRadius, orbitSpeed, radius, floatHeight, bob, bobSpeed } =
    poolConfig.ball;
  const angle = time * orbitSpeed;
  target.set(
    orbitCenter[0] + orbitRadius[0] * Math.cos(angle),
    radius * floatHeight + bob * Math.sin(time * bobSpeed),
    orbitCenter[1] + orbitRadius[1] * Math.sin(angle),
  );
}

// R3F copies vector props into materials, so shared per-frame objects are re-bound here.
function bindShared(material: ShaderMaterial | null, sim: WaterSim, caustics: CausticsPass) {
  if (!material) return;
  const { water, causticTex, eye: eyeUniform, uBall } = material.uniforms;
  if (water) water.value = sim.texture;
  if (causticTex) causticTex.value = caustics.texture;
  if (eyeUniform) eyeUniform.value = eye;
  if (uBall) uBall.value = ballState;
}

function Pool({ palette, profile, animate }: Omit<PoolSceneProps, "className" | "onReady">) {
  const gl = useThree((state) => state.gl);
  const skirt = useMemo(() => skirtGeometry(profile.grid), [profile.grid]);
  const passes = useRef<{ sim: WaterSim; caustics: CausticsPass } | null>(null);
  const sandMaterial = useRef<ShaderMaterial>(null);
  const ballMaterial = useRef<ShaderMaterial>(null);
  const waterMaterial = useRef<ShaderMaterial>(null);
  const ballMesh = useRef<Mesh>(null);
  const rain = useRef<number>(poolConfig.rain.intro);
  const simTime = useRef(0);
  const clock = useRef(0);

  useEffect(() => {
    const sim = new WaterSim(gl, profile.sim);
    const caustics = new CausticsPass(gl, profile.caustics, profile.grid, light, ballState);
    passes.current = { sim, caustics };
    return () => {
      passes.current = null;
      sim.dispose();
      caustics.dispose();
    };
  }, [gl, profile.sim, profile.caustics, profile.grid]);

  useEffect(() => () => skirt.dispose(), [skirt]);

  useFrame((state, delta) => {
    if (!passes.current) return;
    const { sim, caustics } = passes.current;
    if (animate) {
      const pointer = state.pointer;
      if (!pointer.equals(lastPointer)) {
        lastPointer.copy(pointer);
        raycaster.setFromCamera(pointer, state.camera);
        const { origin, direction } = raycaster.ray;
        const t = -origin.y / direction.y;
        if (t > 0) {
          hit.copy(direction).multiplyScalar(t).add(origin);
          if (Math.abs(hit.x) < 1 && Math.abs(hit.z) < 1) {
            sim.addDrop(
              hit.x,
              hit.z,
              poolConfig.pointerDrop.radius,
              poolConfig.pointerDrop.strength,
            );
          }
        }
      }

      rain.current -= delta;
      if (rain.current <= 0) {
        const { spread, radius, strength, minDelay, maxDelay } = poolConfig.rain;
        const sign = Math.random() < 0.5 ? -1 : 1;
        sim.addDrop(random(-spread, spread), random(-spread, spread), radius, strength * sign);
        rain.current = random(minDelay, maxDelay);
      }

      clock.current += delta;
      ballPrevious.set(ballState.x, ballState.y, ballState.z);
      ballPosition(clock.current, ballNext);
      sim.moveSphere(ballPrevious, ballNext, ballState.w);
      ballState.set(ballNext.x, ballNext.y, ballNext.z, ballState.w);

      simTime.current = Math.min(
        simTime.current + delta,
        poolConfig.simStep * poolConfig.maxStepsPerFrame,
      );
      while (simTime.current >= poolConfig.simStep) {
        sim.stepWaves();
        simTime.current -= poolConfig.simStep;
      }
    } else if (clock.current === 0) {
      ballPosition(0, ballNext);
      ballState.set(ballNext.x, ballNext.y, ballNext.z, ballState.w);
    }

    ballMesh.current?.position.set(ballState.x, ballState.y, ballState.z);
    sim.updateNormals();
    caustics.update(sim.texture);
    eye.copy(state.camera.position);
    bindShared(sandMaterial.current, sim, caustics);
    bindShared(ballMaterial.current, sim, caustics);
    bindShared(waterMaterial.current, sim, caustics);
  });

  const sand = { uSand: vec(palette.sand), uSandWet: vec(palette.sandWet) };
  const basin = { ...sand, uUnderwater: vec(palette.underwater) };
  const ballColors = {
    uBallWhite: vec(palette.ballWhite),
    uBallA: vec(palette.ballA),
    uBallB: vec(palette.ballB),
    uBallC: vec(palette.ballC),
  };

  return (
    <>
      <mesh geometry={skirt} frustumCulled={false}>
        <skirtMaterial side={DoubleSide} {...sand} />
      </mesh>
      <mesh frustumCulled={false}>
        <planeGeometry args={[2, 2, profile.grid, profile.grid]} />
        <sandMaterial ref={sandMaterial} side={DoubleSide} {...basin} {...ballColors} />
      </mesh>
      <mesh ref={ballMesh} frustumCulled={false}>
        <sphereGeometry args={[poolConfig.ball.radius, 40, 28]} />
        <ballMaterial ref={ballMaterial} {...ballColors} />
      </mesh>
      <mesh frustumCulled={false}>
        <planeGeometry args={[2, 2, profile.grid, profile.grid]} />
        <waterMaterial
          ref={waterMaterial}
          side={DoubleSide}
          {...basin}
          {...ballColors}
          uAbove={vec(palette.above)}
          uSkyHorizon={vec(palette.skyHorizon)}
          uSkyZenith={vec(palette.skyZenith)}
          uSunGlow={vec(palette.sunGlow)}
          uSun={vec(palette.sun)}
        />
      </mesh>
    </>
  );
}

export function PoolScene({ className, onReady, profile, ...rest }: PoolSceneProps) {
  const { position, target, fov } = poolConfig.camera;
  return (
    <Canvas
      className={className}
      dpr={profile.dpr}
      frameloop={rest.animate ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [...position], fov, near: 0.1, far: 50 }}
      onCreated={(state) => {
        state.camera.lookAt(...target);
        onReady();
      }}
    >
      <Pool profile={profile} {...rest} />
    </Canvas>
  );
}
