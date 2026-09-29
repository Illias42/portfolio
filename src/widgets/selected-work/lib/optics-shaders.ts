import { Color, type WebGLProgramParametersWithUniforms } from "three";

import { opticsConfig } from "../config/optics";

const { scan, glass, extent } = opticsConfig;
const f = (value: number) => value.toFixed(4);

export type ScanUniforms = {
  uScanX: { value: number };
  uScanFade: { value: number };
  uScanColor: { value: Color };
};

export const scanUniforms: ScanUniforms = {
  uScanX: { value: scan.from },
  uScanFade: { value: 0 },
  uScanColor: { value: new Color() },
};

const low = extent.centreY - extent.height / 2;
const high = extent.centreY + extent.height / 2;
const { sheen, fresnel } = glass;

const glassShading = /* glsl */ `
  diffuseColor.a *= mix(${f(glass.density[0])}, ${f(glass.density[1])},
    smoothstep(${f(low)}, ${f(high)}, vScanWorld.y));
  float facing = abs(dot(normalize(normal), normalize(vViewPosition)));
  float fres = pow(1.0 - clamp(facing, 0.0, 1.0), ${f(fresnel.power)});
  diffuseColor.a = mix(diffuseColor.a, 1.0, fres * ${f(fresnel.alpha)});
  outgoingLight += vec3(fres * ${f(fresnel.light)});
  float sheenD = dot(vScanWorld.xy, vec2(${f(Math.cos(sheen.angle))}, ${f(Math.sin(sheen.angle))}))
    - ${f(sheen.offset)};
  float sheenG = exp(-sheenD * sheenD / ${f(sheen.width * sheen.width)}) * ${f(sheen.strength)};
  outgoingLight += vec3(sheenG);
  diffuseColor.a = min(1.0, diffuseColor.a + sheenG * 0.5);
  float scanD = vScanWorld.x - uScanX;
  float scanG = exp(-scanD * scanD / ${f(scan.core * scan.core)})
    + 0.3 * exp(-scanD * scanD / ${f(scan.halo * scan.halo)});
  scanG *= uScanFade * ${f(scan.strength)} * mix(1.0, ${f(scan.edgeGain)}, fres);
  outgoingLight += uScanColor * scanG;
  diffuseColor.a = min(1.0, diffuseColor.a + scanG * 0.45);
`;

export function scanGlass(shader: WebGLProgramParametersWithUniforms) {
  Object.assign(shader.uniforms, scanUniforms);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vScanWorld;")
    .replace(
      "#include <project_vertex>",
      "#include <project_vertex>\nvScanWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      /* glsl */ `#include <common>
      varying vec3 vScanWorld;
      uniform float uScanX;
      uniform float uScanFade;
      uniform vec3 uScanColor;`,
    )
    .replace("#include <opaque_fragment>", `${glassShading}\n#include <opaque_fragment>`);
}

export const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const beamFragment = /* glsl */ `
  uniform vec3 uScanColor;
  uniform float uScanFade;
  varying vec2 vUv;
  void main() {
    float u = (vUv.x - 0.5) * ${f(scan.beam.width)};
    float core = exp(-u * u / ${f(scan.core * scan.core * 4.0)});
    float halo = exp(-u * u / ${f(scan.halo * scan.halo)});
    float ends = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.62, vUv.y);
    float glow = (core * 0.7 + halo * 0.3) * ends * uScanFade * ${f(scan.beam.intensity)};
    gl_FragColor = vec4(uScanColor * glow, 1.0);
  }
`;
