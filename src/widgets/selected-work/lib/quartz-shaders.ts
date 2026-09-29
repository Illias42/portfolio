import { Color, Vector3, type MeshPhysicalMaterial } from "three";

import { quartzConfig } from "../config/quartz";

const { core, marble, key, caustics, occlusion } = quartzConfig;
const f = (value: number) => value.toFixed(4);
const keyDir = new Vector3(...key.position).normalize();

export interface QuartzUniforms {
  uCore: { value: Vector3 };
  uHalo: { value: number };
  uAmber: { value: Color };
  uHoney: { value: Color };
  uSmoke: { value: Color };
  uEarth: { value: Color };
}

export const quartzUniforms: QuartzUniforms = {
  uCore: { value: new Vector3() },
  uHalo: { value: core.haloStrength },
  uAmber: { value: new Color() },
  uHoney: { value: new Color() },
  uSmoke: { value: new Color() },
  uEarth: { value: new Color() },
};

const noise = /* glsl */ `
  float qHash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float qNoise(vec3 x) {
    vec3 i = floor(x);
    vec3 u = fract(x);
    u = u * u * (3.0 - 2.0 * u);
    return mix(
      mix(mix(qHash(i), qHash(i + vec3(1, 0, 0)), u.x),
          mix(qHash(i + vec3(0, 1, 0)), qHash(i + vec3(1, 1, 0)), u.x), u.y),
      mix(mix(qHash(i + vec3(0, 0, 1)), qHash(i + vec3(1, 0, 1)), u.x),
          mix(qHash(i + vec3(0, 1, 1)), qHash(i + vec3(1, 1, 1)), u.x), u.y),
      u.z);
  }
  float qFbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * qNoise(p);
      p = p * 2.03 + vec3(1.7, 9.2, 3.1);
      a *= 0.5;
    }
    return v;
  }`;

export function compileQuartz(shader: Parameters<MeshPhysicalMaterial["onBeforeCompile"]>[0]) {
  Object.assign(shader.uniforms, quartzUniforms);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vStone;\nvarying vec3 vSeen;")
    .replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvStone = position;\nvSeen = (modelMatrix * vec4(position, 1.0)).xyz;",
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      /* glsl */ `#include <common>
      varying vec3 vStone;
      varying vec3 vSeen;
      uniform vec3 uCore;
      uniform float uHalo;
      uniform vec3 uAmber;
      uniform vec3 uHoney;
      uniform vec3 uSmoke;
      uniform vec3 uEarth;
      ${noise}`,
    )
    .replace(
      "#include <color_fragment>",
      /* glsl */ `#include <color_fragment>
      // Domain-warped fbm gives organic, meandering veins instead of parallel bands.
      vec3 marbleP = vStone * 1.6;
      vec3 warp = vec3(qFbm(marbleP), qFbm(marbleP + vec3(5.2, 1.3, 2.8)), qFbm(marbleP + vec3(1.7, 9.2, 4.1)));
      float marbleCloud = qFbm(marbleP + warp * 2.2);
      float veinField = dot(vStone, vec3(1.6, 2.4, -1.1)) + marbleCloud * 6.0;
      float marbleVein = pow(1.0 - abs(sin(veinField * 2.4)), 9.0);
      float fineVein = pow(1.0 - abs(sin(veinField * 7.3 + warp.x * 4.0)), 28.0);
      float marbleCrack = 1.0 - smoothstep(0.0, 0.03, abs(qFbm(vStone * 6.0 + 3.1) - 0.5));
      // Colour zones: ivory body with drifting honey clouds, smoky veins that deepen to earth in
      // their core, champagne fine veins and gold cracks.
      float honeyZone = smoothstep(0.42, 0.78, qFbm(marbleP * 0.6 + warp * 1.4 + 7.0));
      diffuseColor.rgb = mix(diffuseColor.rgb, uHoney, honeyZone * ${f(marble.honey)});
      float veinMix = clamp(marbleVein * ${f(marble.vein)} * 2.4, 0.0, 1.0);
      vec3 veinColor = mix(uSmoke, uEarth, smoothstep(0.45, 0.9, marbleCloud));
      diffuseColor.rgb = mix(diffuseColor.rgb, veinColor, veinMix * 0.6);
      diffuseColor.rgb = mix(diffuseColor.rgb, uHoney, clamp(fineVein * ${f(marble.vein)} * 1.6, 0.0, 1.0));
      diffuseColor.rgb *= 0.95 + marbleCloud * 0.1;
      diffuseColor.rgb = mix(diffuseColor.rgb, uAmber, marbleCrack * ${f(marble.crackle)});`,
    )
    .replace(
      "#include <emissivemap_fragment>",
      /* glsl */ `#include <emissivemap_fragment>
      vec3 ray = normalize(vSeen - cameraPosition);
      vec3 toCore = uCore - cameraPosition;
      float miss = length(toCore - ray * dot(toCore, ray));
      float halo = exp(-miss * miss / ${f(core.haloRadius * core.haloRadius)});
      float gold = marbleCrack * (${f(marble.gold)} + halo * ${f(marble.goldNearCore)});
      totalEmissiveRadiance += uAmber * uHalo * (halo + gold);`,
    )
    .replace(
      "#include <opaque_fragment>",
      /* glsl */ `// Transmission flattens facet values; re-separate them by how each face turns to the key.
      vec3 facet = normalize(cross(dFdx(vSeen), dFdy(vSeen)));
      float turn = dot(facet, vec3(${f(keyDir.x)}, ${f(keyDir.y)}, ${f(keyDir.z)})) * 0.5 + 0.5;
      outgoingLight *= mix(${f(key.facetShade[0])}, ${f(key.facetShade[1])}, turn);
      // Ambient occlusion where the stone meets the floor, so it sits rather than hovers.
      outgoingLight *= 1.0 - ${f(occlusion.strength)} * (1.0 - smoothstep(0.0, ${f(occlusion.height)}, vSeen.y));
      #include <opaque_fragment>`,
    );
}

export const fractureVertex = /* glsl */ `
  varying vec3 vPlane;
  void main() {
    vPlane = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

export const fractureFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uCore;
  uniform float uGlow;
  varying vec3 vPlane;
  void main() {
    float d = distance(vPlane, uCore);
    float caught = exp(-d * d / ${f(quartzConfig.fractureReach)});
    float bands = 0.55 + 0.45 * sin(dot(vPlane, vec3(11.0, 17.0, 7.0)));
    gl_FragColor = vec4(uColor * caught * bands * uGlow, 1.0);
  }`;

export const causticVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

export const causticFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uGlow;
  uniform float uTime;
  varying vec2 vUv;
  float waterCaustic(vec2 uv, float time) {
    vec2 p = uv * 6.2831853 - 250.0;
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;
    for (int n = 0; n < 5; n++) {
      float t = time * (1.0 - 3.5 / float(n + 1));
      i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
    }
    c /= 5.0;
    c = 1.17 - pow(c, 1.4);
    return pow(abs(c), 8.0);
  }
  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    vec2 d = p - vec2(0.04, -0.26);
    float r = length(vec2(d.x, d.y * 1.4));
    float pool = exp(-r * r * ${f(caustics.tightness)});
    float contact = exp(-dot(p, p) * 46.0);
    float web = waterCaustic(p * ${f(caustics.scale)}, uTime * ${f(caustics.speed)} + 23.0);
    float light = pool * (0.2 + 2.2 * web) * ${f(caustics.strength)} + contact * ${f(caustics.pool)};
    light *= 1.0 - smoothstep(0.7, 1.0, length(p));
    gl_FragColor = vec4(uColor * light * uGlow, 1.0);
  }`;
