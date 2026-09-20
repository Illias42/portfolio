// Wave simulation after Evan Wallace's WebGL Water (via jeantimex/threejs-water), generalised to a
// rectangular extent; the surface shader renders page-coloured water whose ripples read as shading.

export const fullscreenVertex = /* glsl */ `
  varying vec2 coord;
  void main() {
    coord = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const dropFragment = /* glsl */ `
  const float PI = 3.141592653589793;
  uniform sampler2D tInput;
  uniform vec2 center;
  uniform float radius;
  uniform float strength;
  varying vec2 coord;
  void main() {
    vec4 info = texture2D(tInput, coord);
    float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);
    drop = 0.5 - cos(drop * PI) * 0.5;
    info.r += drop * strength;
    gl_FragColor = info;
  }
`;

export const stepFragment = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec2 delta;
  varying vec2 coord;
  void main() {
    vec4 info = texture2D(tInput, coord);
    vec2 dx = vec2(delta.x, 0.0);
    vec2 dy = vec2(0.0, delta.y);
    float average = (
      texture2D(tInput, coord - dx).r +
      texture2D(tInput, coord - dy).r +
      texture2D(tInput, coord + dx).r +
      texture2D(tInput, coord + dy).r
    ) * 0.25;
    info.g += (average - info.r) * 2.0;
    info.g *= 0.986;
    info.r += info.g;
    gl_FragColor = info;
  }
`;

export const normalFragment = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec2 delta;
  uniform vec2 uExtent;
  varying vec2 coord;
  void main() {
    vec4 info = texture2D(tInput, coord);
    vec3 dx = vec3(delta.x * 2.0 * uExtent.x, texture2D(tInput, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);
    vec3 dy = vec3(0.0, texture2D(tInput, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y * 2.0 * uExtent.y);
    info.ba = normalize(cross(dy, dx)).xz;
    gl_FragColor = info;
  }
`;

export const surfaceVertex = /* glsl */ `
  uniform sampler2D water;
  uniform vec2 uExtent;
  uniform float uLevel;
  varying vec3 vPosition;
  varying vec2 vCoord;
  void main() {
    vCoord = position.xy * 0.5 + 0.5;
    vec4 info = texture2D(water, vCoord);
    vPosition = vec3(position.x * uExtent.x, uLevel + info.r, position.y * uExtent.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  }
`;

export const MAX_NODES = 12;

export const surfaceFragment = /* glsl */ `
  #define MAX_NODES ${MAX_NODES}
  uniform sampler2D water;
  uniform vec3 light;
  uniform vec3 eye;
  uniform vec4 uNodes[MAX_NODES];
  uniform int uNodeCount;
  uniform vec3 uPaper;
  uniform vec3 uSky;
  uniform vec3 uGlint;
  uniform vec3 uShade;
  uniform vec3 uLampColor;
  uniform vec2 uLampNodes;
  uniform vec2 uExtent;
  uniform vec2 uFade;
  uniform float uOpacity;
  uniform float uTint;
  varying vec3 vPosition;
  varying vec2 vCoord;

  void main() {
    vec4 info = texture2D(water, vCoord);
    vec2 slope = clamp(info.ba, vec2(-0.999), vec2(0.999));
    vec3 n = normalize(vec3(slope.x, sqrt(max(0.001, 1.0 - dot(slope, slope))), slope.y));
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 view = normalize(eye - vPosition);

    float shade = dot(n, light) - dot(up, light);
    vec3 color = mix(uPaper, uSky, uTint) * (1.0 + 1.4 * shade);

    float fresnel = pow(1.0 - max(dot(n, view), 0.0), 4.0) - pow(1.0 - max(dot(up, view), 0.0), 4.0);
    color = mix(color, uSky, clamp(fresnel * 0.8 + max(-shade, 0.0) * 0.5, 0.0, 1.0));

    float wave = min(1.0, length(slope) * 24.0);
    float spec = pow(max(dot(reflect(-light, n), view), 0.0), 70.0) * 0.35 * wave;
    color += uGlint * spec;

    float shadow = 1.0;
    for (int i = 0; i < MAX_NODES; i++) {
      if (i >= uNodeCount) break;
      vec4 node = uNodes[i];
      vec2 offset = vPosition.xz - (node.xz + light.xz * 0.08);
      float d2 = dot(offset, offset) / (node.w * node.w);
      shadow *= 1.0 - 0.22 * exp(-d2 * 0.28);
    }
    color = mix(uShade, color, shadow);
    for (int i = 0; i < MAX_NODES; i++) {
      if (i >= uNodeCount) break;
      if (float(i) != uLampNodes.x && float(i) != uLampNodes.y) continue;
      float distanceToLamp = length(vPosition.xz - uNodes[i].xz) / uNodes[i].w;
      float reflection = exp(-distanceToLamp * distanceToLamp * 0.5);
      color = mix(color, uLampColor, reflection * 0.42);
    }

    float alpha = (uOpacity + wave * 0.18 + spec * 0.2) * (1.0 - smoothstep(uFade.x, uFade.y, length(vPosition.xz / uExtent)));
    gl_FragColor = vec4(color, alpha);
  }
`;
