import { CatmullRomCurve3, Vector3 } from "three";

import { mobilityConfig, type LaneSpec } from "../config/mobility";

type Keyframes = LaneSpec["offset"];

function sampleKeys(keys: Keyframes, s: number): number {
  const first = keys[0];
  if (!first) return 0;
  if (s <= first[0]) return first[1];
  for (let i = 1; i < keys.length; i++) {
    const prev = keys[i - 1];
    const next = keys[i];
    if (!prev || !next || s > next[0]) continue;
    const u = (s - prev[0]) / (next[0] - prev[0]);
    const eased = u * u * u * (u * (u * 6 - 15) + 10);
    return prev[1] + (next[1] - prev[1]) * eased;
  }
  return keys.at(-1)?.[1] ?? 0;
}

const spine = new CatmullRomCurve3(
  mobilityConfig.spine.map(([x, z]) => new Vector3(x, 0, z)),
  false,
  "centripetal",
);

function buildLane(lane: LaneSpec): CatmullRomCurve3 {
  const tangent = new Vector3();
  const points = Array.from({ length: mobilityConfig.spineSamples + 1 }, (_, i) => {
    const s = i / mobilityConfig.spineSamples;
    const point = spine.getPointAt(s);
    spine.getTangentAt(s, tangent);
    const side = new Vector3(-tangent.z, 0, tangent.x).normalize();
    point.addScaledVector(side, sampleKeys(lane.offset, s) * sampleKeys(mobilityConfig.spread, s));
    point.y = sampleKeys(lane.lift, s);
    return point;
  });
  return new CatmullRomCurve3(points, false, "centripetal");
}

export const laneCurves: readonly CatmullRomCurve3[] = mobilityConfig.lanes.map(buildLane);
