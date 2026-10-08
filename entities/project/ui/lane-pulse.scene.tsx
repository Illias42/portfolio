"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type CatmullRomCurve3, type ShaderMaterial } from "three";

import { mobilityConfig } from "../config/mobility";

const { pulses, filament } = mobilityConfig;

const pulseVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`;

const pulseFragment = /* glsl */ `
  uniform float uTime;
  uniform float uCount;
  uniform float uOffset;
  uniform float uLength;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying vec2 vUv;
  varying float vFacing;
  void main() {
    float phase = fract(vUv.x * uCount - uTime + uOffset);
    float pulse = pow(phase, uLength) * smoothstep(1.0, 0.985, phase);
    float ends = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
    float soft = smoothstep(0.0, 0.35, vFacing);
    vec3 tint = mix(uColor, uHot, pow(phase, uLength * 4.0));
    gl_FragColor = vec4(tint, pulse * ends * soft * uOpacity);
    #include <colorspace_fragment>
  }
`;

interface LanePulseProps {
  curve: CatmullRomCurve3;
  radius: number;
  index: number;
  segments: number;
  sun: Color;
  animate: boolean;
}

/** Sun-coloured event pulses travelling along a lane. */
export function LanePulse({ curve, radius, index, segments, sun, animate }: LanePulseProps) {
  const material = useRef<ShaderMaterial>(null);
  const speed = pulses.speed * (1 + index * pulses.spread);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCount: { value: pulses.count },
      uOffset: { value: index * 0.37 },
      uLength: { value: pulses.length },
      uOpacity: { value: pulses.opacity },
      uColor: { value: sun },
      uHot: { value: sun.clone().lerp(new Color(1, 1, 1), pulses.hot) },
    }),
    [index, sun],
  );

  useFrame((state) => {
    const time = material.current?.uniforms.uTime;
    if (time && animate) time.value = state.clock.elapsedTime * speed;
  });

  return (
    <mesh renderOrder={1}>
      <tubeGeometry args={[curve, segments, radius * pulses.radiusScale, 12, false]} />
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={pulseVertex}
        fragmentShader={pulseFragment}
      />
    </mesh>
  );
}

/** A thin glowing core inside a glass lane, like an optical fibre. */
export function LaneFilament({
  curve,
  radius,
  segments,
  sun,
}: Omit<LanePulseProps, "index" | "animate">) {
  const tint = useMemo(() => sun.clone().lerp(new Color(1, 1, 1), filament.white), [sun]);
  return (
    <mesh>
      <tubeGeometry args={[curve, segments, radius * filament.radiusScale, 8, false]} />
      <meshBasicMaterial color={tint} toneMapped={false} />
    </mesh>
  );
}
