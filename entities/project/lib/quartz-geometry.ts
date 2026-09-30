import { Box3, BufferGeometry, Euler, Float32BufferAttribute, Matrix4, Vector3 } from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { ConvexHull } from "three/addons/math/ConvexHull.js";

import { quartzConfig, type Point } from "../config/quartz";

const { block } = quartzConfig;
const tilt = new Euler(...block.tilt);

const [ax, ay, az] = block.axes.map((axis) => new Vector3(...axis).divideScalar(2 * block.half));
const skew = new Matrix4().makeBasis(
  ax ?? new Vector3(1, 0, 0),
  ay ?? new Vector3(0, 1, 0),
  az ?? new Vector3(0, 0, 1),
);

const corners = Array.from({ length: 8 }, (_, i) => {
  const [jx, jy, jz] = block.jitter[i] ?? [0, 0, 0];
  const h = block.half;
  return new Vector3((i & 1 ? h : -h) + jx, (i & 2 ? h : -h) + jy, (i & 4 ? h : -h) + jz);
});

const tipped = corners.map((p) => p.applyMatrix4(skew).applyEuler(tilt));

function hullVertices(points: readonly Vector3[]): Vector3[] {
  const hull = new ConvexHull().setFromPoints([...points]);
  const unique = new Map<string, Vector3>();
  hull.faces.forEach((face) => {
    let edge = face.edge;
    do {
      const point = edge.head().point;
      unique.set(
        point
          .toArray()
          .map((v) => v.toFixed(5))
          .join(","),
        point.clone(),
      );
      edge = edge.next;
    } while (edge !== face.edge);
  });
  return [...unique.values()];
}

function clip(points: readonly Vector3[], normal: Vector3, offset: number): Vector3[] {
  const kept = points.filter((p) => p.dot(normal) <= offset);
  const cut = points.filter((p) => p.dot(normal) > offset);
  const crossings = kept.flatMap((a) =>
    cut.map((b) => a.clone().lerp(b, (offset - a.dot(normal)) / (b.dot(normal) - a.dot(normal)))),
  );
  return hullVertices([...kept, ...crossings]);
}

const rough = block.cuts.reduce((points, { normal, depth }) => {
  const n = new Vector3(...normal).normalize();
  const reach = points.map((p) => p.dot(n));
  const max = Math.max(...reach);
  return clip(points, n, max - depth * (max - Math.min(...reach)));
}, tipped);

const minY = Math.min(...rough.map((p) => p.y));
const cutY = minY + block.truncate;
const above = rough.filter((p) => p.y >= cutY);
const footprint = rough
  .filter((p) => p.y < cutY)
  .flatMap((low) => above.map((high) => low.clone().lerp(high, (cutY - low.y) / (high.y - low.y))));

const lift = new Vector3(0, -cutY, 0);
const toSculpture = new Matrix4().makeRotationFromEuler(tilt).setPosition(lift).multiply(skew);
const hullPoints = [...above, ...footprint].map((p) => p.clone().add(lift));

export const hullGeometry = new ConvexGeometry(hullPoints);

const bounds = new Box3().setFromPoints(hullPoints);
export const crystalSize = {
  height: bounds.max.y,
  width: Math.max(bounds.max.x - bounds.min.x, bounds.max.z - bounds.min.z),
};

export const footprintCentre = footprint
  .reduce((sum, p) => sum.add(p), new Vector3())
  .divideScalar(Math.max(footprint.length, 1))
  .add(lift);

export function place(point: Point): Vector3 {
  return new Vector3(...point).multiplyScalar(block.inset).applyMatrix4(toSculpture);
}

export function polygon(points: readonly Point[]): BufferGeometry {
  const [first, ...rest] = points.map(place);
  const positions: number[] = [];
  for (let i = 0; i < rest.length - 1; i += 1) {
    const b = rest[i];
    const c = rest[i + 1];
    if (first && b && c) positions.push(...first.toArray(), ...b.toArray(), ...c.toArray());
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function polyline(points: readonly Point[]): BufferGeometry {
  const placed = points.map(place);
  return new BufferGeometry().setFromPoints(placed.slice(1).flatMap((p, i) => [placed[i] ?? p, p]));
}
