// Port of Evan Wallace's WebGL Water (via jeantimex/threejs-water): wave sim, caustics, ray-traced
// basin and Fresnel surface. Adapted here to a sand beach rising out of the water and a floating ball.

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

export const sphereFragment = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec3 oldCenter;
  uniform vec3 newCenter;
  uniform float radius;
  varying vec2 coord;

  float volumeInSphere(vec3 center) {
    vec3 point = vec3(coord.x * 2.0 - 1.0, 0.0, coord.y * 2.0 - 1.0);
    float t = length(point - center) / radius;
    float dy = exp(-pow(t * 1.5, 6.0));
    float ymin = min(0.0, center.y - dy);
    float ymax = min(max(0.0, center.y + dy), ymin + 2.0 * dy);
    return (ymax - ymin) * 0.1;
  }

  void main() {
    vec4 info = texture2D(tInput, coord);
    info.r += volumeInSphere(oldCenter);
    info.r -= volumeInSphere(newCenter);
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
    info.g *= 0.995;
    info.r += info.g;
    gl_FragColor = info;
  }
`;

export const normalFragment = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec2 delta;
  varying vec2 coord;
  void main() {
    vec4 info = texture2D(tInput, coord);
    vec3 dx = vec3(delta.x * 2.0, texture2D(tInput, vec2(coord.x + delta.x, coord.y)).r - info.r, 0.0);
    vec3 dy = vec3(0.0, texture2D(tInput, vec2(coord.x, coord.y + delta.y)).r - info.r, delta.y * 2.0);
    info.ba = normalize(cross(dy, dx)).xz;
    gl_FragColor = info;
  }
`;

const optics = /* glsl */ `
  const float IOR_AIR = 1.0;
  const float IOR_WATER = 1.333;
  const float poolHeight = 1.0;
  const float rimHeight = 2.0 / 12.0;

  vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
    vec3 tMin = (cubeMin - origin) / ray;
    vec3 tMax = (cubeMax - origin) / ray;
    vec3 t1 = min(tMin, tMax);
    vec3 t2 = max(tMin, tMax);
    return vec2(max(max(t1.x, t1.y), t1.z), min(min(t2.x, t2.y), t2.z));
  }

  vec2 poolBounds(vec3 origin, vec3 ray) {
    return intersectCube(origin, ray, vec3(-1.0, -poolHeight, -1.0), vec3(1.0, 2.0, 1.0));
  }

  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
`;

// Sand slab: a pond hollow on the camera side, a curved shore rising toward -z, a low rim that
// keeps the water enclosed, and one dune in the far corner.
const terrain = /* glsl */ `
  const float slabBottom = -0.28;

  float sandHeight(vec2 p) {
    float d = -p.y + 0.2 * sin(p.x * 2.4 + 0.6);
    float beach = smoothstep(-0.2, 1.15, d);
    float h = -0.7 + 0.8 * pow(beach, 1.6);
    float edge = max(abs(p.x), abs(p.y));
    h += 0.78 * smoothstep(0.7, 1.0, edge) * (1.0 - 0.6 * beach);
    vec2 dune = p - vec2(-0.66, -0.66);
    h += 0.42 * exp(-dot(dune, dune) / 0.08);
    h += 0.01 * sin(p.x * 17.0 + p.y * 6.0) * (1.0 - beach);
    return h;
  }
`;

const ball = /* glsl */ `
  uniform vec3 light;
  uniform vec4 uBall;
  uniform vec3 uBallWhite;
  uniform vec3 uBallA;
  uniform vec3 uBallB;
  uniform vec3 uBallC;
  uniform vec3 eye;

  float intersectSphere(vec3 origin, vec3 ray, vec3 center, float radius) {
    vec3 toSphere = origin - center;
    float a = dot(ray, ray);
    float b = 2.0 * dot(toSphere, ray);
    float c = dot(toSphere, toSphere) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;
    if (discriminant > 0.0) {
      float t = (-b - sqrt(discriminant)) / (2.0 * a);
      if (t > 0.0) return t;
    }
    return 1.0e6;
  }

  vec3 ballColor(vec3 point) {
    vec3 n = normalize(point - uBall.xyz);
    float a = atan(n.z, n.x) / 6.2831853 + 0.5;
    float seg = mod(floor(a * 6.0), 3.0);
    vec3 c = seg < 0.5 ? uBallA : (seg < 1.5 ? uBallB : uBallC);
    c = mix(c, uBallWhite, smoothstep(0.84, 0.9, abs(n.y)));
    float diffuse = 0.42 + 0.58 * max(dot(n, light), 0.0);
    vec3 view = normalize(eye - point);
    float spec = pow(max(dot(reflect(-light, n), view), 0.0), 48.0) * 0.35;
    return c * diffuse + uBallWhite * spec;
  }
`;

export const causticsVertex = /* glsl */ `
  ${optics}
  uniform vec3 light;
  uniform sampler2D water;
  varying vec3 oldPos;
  varying vec3 newPos;

  vec3 project(vec3 origin, vec3 ray, vec3 refractedLight) {
    vec2 tcube = poolBounds(origin, ray);
    origin += ray * tcube.y;
    float tplane = (-origin.y - 1.0) / refractedLight.y;
    return origin + refractedLight * tplane;
  }

  void main() {
    vec4 info = texture2D(water, position.xy * 0.5 + 0.5);
    info.ba *= 0.5;
    vec3 normal = vec3(info.b, sqrt(max(0.001, 1.0 - dot(info.ba, info.ba))), info.a);
    vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
    vec3 ray = refract(-light, normal, IOR_AIR / IOR_WATER);
    oldPos = project(position.xzy, refractedLight, refractedLight);
    newPos = project(position.xzy + vec3(0.0, info.r, 0.0), ray, refractedLight);
    gl_Position = vec4(0.75 * (newPos.xz + refractedLight.xz / refractedLight.y), 0.0, 1.0);
  }
`;

export const causticsFragment = /* glsl */ `
  ${optics}
  uniform vec3 light;
  uniform vec4 uBall;
  varying vec3 oldPos;
  varying vec3 newPos;

  void main() {
    float oldArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
    float newArea = length(dFdx(newPos)) * length(dFdy(newPos));
    float intensity = oldArea / max(newArea, 1.0e-6) * 0.2;
    vec3 refractedLight = refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);

    vec3 dir = (uBall.xyz - newPos) / uBall.w;
    vec3 area = cross(dir, refractedLight);
    float shadow = dot(area, area);
    float dist = dot(dir, -refractedLight);
    shadow = 1.0 + (shadow - 1.0) / (0.05 + dist * 0.025);
    shadow = clamp(1.0 / (1.0 + exp(-shadow)), 0.0, 1.0);
    shadow = mix(1.0, shadow, clamp(dist * 2.0, 0.0, 1.0));

    vec2 t = poolBounds(newPos, -refractedLight);
    float fade = 1.0 / (1.0 + exp(-200.0 / (1.0 + 10.0 * (t.y - t.x)) * (newPos.y - refractedLight.y * t.y - rimHeight)));
    gl_FragColor = vec4(intensity * fade, shadow, 0.0, 1.0);
  }
`;

const basin = /* glsl */ `
  uniform sampler2D water;
  uniform sampler2D causticTex;
  uniform vec3 uSand;
  uniform vec3 uSandWet;

  vec3 sandColor(vec3 point, float waterLevel) {
    vec2 p = point.xz;
    float grain = mix(0.88, 1.0, hash21(floor(p * 240.0)));
    float ridge = 0.5 + 0.5 * sin(p.x * 17.0 + p.y * 6.0 + 1.6);
    vec3 dry = mix(uSand, uSandWet, 0.12 * ridge);
    float wet = 1.0 - smoothstep(0.0, 0.1, point.y - waterLevel);
    return mix(dry, uSandWet, wet * 0.55) * grain;
  }

  vec3 sandNormal(vec2 p) {
    float e = 0.02;
    float hx = sandHeight(p + vec2(e, 0.0)) - sandHeight(p - vec2(e, 0.0));
    float hz = sandHeight(p + vec2(0.0, e)) - sandHeight(p - vec2(0.0, e));
    return normalize(vec3(-hx / (2.0 * e), 1.0, -hz / (2.0 * e)));
  }

  vec3 getBasinColor(vec3 point) {
    vec4 info = texture2D(water, point.xz * 0.5 + 0.5);
    vec3 base = sandColor(point, info.r);
    vec3 normal = sandNormal(point.xz);

    float scale = 0.6 / (0.65 + 0.35 * length(point));
    scale *= 1.0 - 0.6 / pow(max(length(point - uBall.xyz) / uBall.w, 1.0), 4.0);

    vec3 refractedLight = -refract(-light, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
    float diffuse = max(0.0, dot(refractedLight, normal));
    if (point.y < info.r) {
      vec4 caustic = texture2D(
        causticTex,
        0.75 * (point.xz - point.y * refractedLight.xz / refractedLight.y) * 0.5 + 0.5
      );
      scale += diffuse * caustic.r * 2.0 * caustic.g;
    } else {
      scale += diffuse * 0.65;
    }
    return base * scale;
  }
`;

// Skirt vertices carry (x, flag, z): flag 1 snaps to the terrain edge, 0 to the slab bottom.
export const skirtVertex = /* glsl */ `
  ${terrain}
  varying vec3 vPosition;
  void main() {
    vPosition = vec3(position.x, position.y > 0.5 ? sandHeight(position.xz) : slabBottom, position.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  }
`;

export const skirtFragment = /* glsl */ `
  ${optics}
  uniform vec3 light;
  uniform vec3 uSand;
  uniform vec3 uSandWet;
  varying vec3 vPosition;
  void main() {
    vec3 n = abs(vPosition.x) > 0.999 ? vec3(sign(vPosition.x), 0.0, 0.0) : vec3(0.0, 0.0, sign(vPosition.z));
    float shade = 0.68 + 0.32 * max(dot(n, light), 0.0);
    float grain = 0.92 + 0.08 * hash21(floor(vPosition.xz * 160.0 + vPosition.y * 160.0));
    gl_FragColor = vec4(mix(uSand, uSandWet, 0.3) * shade * grain, 1.0);
  }
`;

export const sandVertex = /* glsl */ `
  ${terrain}
  varying vec3 vPosition;
  void main() {
    vPosition = position.xzy;
    vPosition.y = sandHeight(vPosition.xz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  }
`;

export const basinFragment = /* glsl */ `
  ${optics}
  ${terrain}
  ${ball}
  ${basin}
  uniform vec3 uUnderwater;
  varying vec3 vPosition;
  void main() {
    vec3 color = getBasinColor(vPosition);
    vec4 info = texture2D(water, vPosition.xz * 0.5 + 0.5);
    if (vPosition.y < info.r) color *= uUnderwater;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const ballVertex = /* glsl */ `
  varying vec3 vPosition;
  void main() {
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
  }
`;

export const ballFragment = /* glsl */ `
  ${ball}
  varying vec3 vPosition;
  void main() {
    gl_FragColor = vec4(ballColor(vPosition), 1.0);
  }
`;

export const waterVertex = /* glsl */ `
  uniform sampler2D water;
  varying vec3 vPosition;
  void main() {
    vec4 info = texture2D(water, position.xy * 0.5 + 0.5);
    vPosition = position.xzy;
    vPosition.y += info.r;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  }
`;

export const waterFragment = /* glsl */ `
  ${optics}
  ${terrain}
  ${ball}
  ${basin}
  uniform vec3 uAbove;
  uniform vec3 uSkyHorizon;
  uniform vec3 uSkyZenith;
  uniform vec3 uSunGlow;
  uniform vec3 uSun;
  varying vec3 vPosition;

  vec3 skyColor(vec3 ray) {
    vec3 sky = mix(uSkyHorizon, uSkyZenith, pow(clamp(ray.y, 0.0, 1.0), 0.6));
    float s = max(dot(light, ray), 0.0);
    sky += uSunGlow * pow(s, 14.0) * 0.4;
    sky += uSun * pow(s, 2000.0) * 3.0;
    return sky;
  }

  float marchSand(vec3 origin, vec3 ray, float tMax) {
    float stride = tMax / 20.0;
    float t = 0.0;
    for (int i = 0; i < 20; i++) {
      t += stride;
      vec3 p = origin + ray * t;
      if (p.y < sandHeight(p.xz)) {
        float lo = t - stride;
        float hi = t;
        for (int j = 0; j < 4; j++) {
          float mid = 0.5 * (lo + hi);
          vec3 pm = origin + ray * mid;
          if (pm.y < sandHeight(pm.xz)) hi = mid; else lo = mid;
        }
        return hi;
      }
    }
    return tMax;
  }

  vec3 getSurfaceRayColor(vec3 origin, vec3 ray) {
    vec2 t = poolBounds(origin, ray);
    float tBall = intersectSphere(origin, ray, uBall.xyz, uBall.w);
    float tHit = marchSand(origin, ray, t.y);
    vec3 color;
    if (tBall < tHit) color = ballColor(origin + ray * tBall);
    else if (tHit < t.y) color = getBasinColor(origin + ray * tHit);
    else color = skyColor(ray);
    if (ray.y < 0.0) {
      float depth = smoothstep(0.0, 0.5, min(tBall, tHit));
      color *= mix(vec3(1.0), uAbove, depth);
    }
    return color;
  }

  void main() {
    if (sandHeight(vPosition.xz) > vPosition.y) discard;
    vec2 coord = vPosition.xz * 0.5 + 0.5;
    vec4 info = texture2D(water, coord);
    for (int i = 0; i < 5; i++) {
      coord = clamp(coord + info.ba * 0.005, 0.0, 1.0);
      info = texture2D(water, coord);
    }
    vec3 normal = vec3(info.b, sqrt(max(0.001, 1.0 - dot(info.ba, info.ba))), info.a);
    vec3 incomingRay = normalize(vPosition - eye);
    vec3 reflectedRay = reflect(incomingRay, normal);
    vec3 refractedRay = refract(incomingRay, normal, IOR_AIR / IOR_WATER);
    float fresnel = mix(0.12, 1.0, pow(1.0 - dot(normal, -incomingRay), 4.0));
    vec3 reflectedColor = getSurfaceRayColor(vPosition, reflectedRay);
    vec3 refractedColor = getSurfaceRayColor(vPosition, refractedRay);
    gl_FragColor = vec4(mix(refractedColor, reflectedColor, fresnel), 1.0);
  }
`;
