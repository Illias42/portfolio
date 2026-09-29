import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import { Vector3, type Object3D } from "three";

export interface LabelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface LabelRegistry {
  elements: Map<string, HTMLElement>;
  bounds: LabelRect | null;
  guards: readonly LabelRect[];
  changedAt: number;
  setFrame: (bounds: LabelRect | null, guards: readonly LabelRect[]) => void;
  noteCanvasSize: (width: number, height: number, now: number) => void;
}

export type LabelTargets = RefObject<LabelRegistry>;

export function createLabelRegistry(): LabelRegistry {
  let lastWidth = 0;
  let lastHeight = 0;
  const registry: LabelRegistry = {
    elements: new Map(),
    bounds: null,
    guards: [],
    changedAt: 0,
    setFrame: (bounds, guards) => {
      registry.bounds = bounds;
      registry.guards = guards;
      registry.changedAt = performance.now();
    },
    noteCanvasSize: (width, height, now) => {
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      registry.changedAt = now;
    },
  };
  return registry;
}

export interface LabelAnchor {
  id: string;
  object: () => Object3D | null | undefined;
  offset?: readonly [x: number, y: number, z: number];
  fade?: () => number;
}

const point = new Vector3();
const MARGIN = 8;
const TEXT_GAP = 6;
const SETTLE_MS = 220;
const SWAP_MS = 180;
const EPSILON = 0.25;
const scratch: LabelRect = { left: 0, top: 0, right: 0, bottom: 0 };
const placed: LabelRect[] = [];
let placedCount = 0;

function place(rect: LabelRect) {
  const slot = placed[placedCount] ?? { left: 0, top: 0, right: 0, bottom: 0 };
  placed[placedCount] = slot;
  placedCount += 1;
  slot.left = rect.left;
  slot.top = rect.top;
  slot.right = rect.right;
  slot.bottom = rect.bottom;
}

function overlaps(rect: LabelRect, other: LabelRect, margin = MARGIN) {
  return (
    rect.left < other.right + margin &&
    rect.right > other.left - margin &&
    rect.top < other.bottom + margin &&
    rect.bottom > other.top - margin
  );
}

function textRect(x: number, y: number, dx: number, dy: number, w: number, h: number): LabelRect {
  if (dx === 0) {
    scratch.left = x - w / 2;
    scratch.top = dy < 0 ? y + dy - TEXT_GAP - h : y + dy + TEXT_GAP;
  } else {
    scratch.left = dx > 0 ? x + dx + TEXT_GAP : x + dx - TEXT_GAP - w;
    scratch.top = y + dy - h / 2;
  }
  scratch.right = scratch.left + w;
  scratch.bottom = scratch.top + h;
  return scratch;
}

function blocked(
  rect: LabelRect,
  registry: LabelRegistry,
  width: number,
  height: number,
  margin = MARGIN,
) {
  const b = registry.bounds ?? { left: 0, top: 0, right: width, bottom: height };
  if (
    rect.left < b.left + margin ||
    rect.right > b.right - margin ||
    rect.top < b.top + margin ||
    rect.bottom > b.bottom - margin
  )
    return true;
  if (registry.guards.some((guard) => overlaps(rect, guard, margin))) return true;
  for (let i = 0; i < placedCount; i++) {
    const other = placed[i];
    if (other && overlaps(rect, other, margin)) return true;
  }
  return false;
}

function candidates(dx: number, dy: number): ReadonlyArray<readonly [number, number]> {
  return dx === 0
    ? [
        [0, dy],
        [0, -dy],
      ]
    : [
        [dx, dy],
        [-dx, dy],
        [dx, -dy],
        [-dx, -dy],
      ];
}

function orient(
  registry: LabelRegistry,
  element: HTMLElement,
  x: number,
  y: number,
  width: number,
  height: number,
): number {
  const { dx, dy, tw, th, orient: current } = element.dataset;
  const w = Number(tw ?? 0);
  const h = Number(th ?? 0);
  const options = candidates(Number(dx ?? 0), Number(dy ?? 0));
  const fits = (index: number, margin: number) => {
    const option = options[index];
    if (!option) return false;
    return !blocked(textRect(x, y, option[0], option[1], w, h), registry, width, height, margin);
  };
  const held = current === undefined ? -1 : Number(current);
  if (held >= 0 && fits(held, 0)) return held;
  return options.findIndex((_, index) => fits(index, MARGIN));
}

function layout(element: HTMLElement, dx: number, dy: number) {
  const leader = element.querySelector<HTMLElement>("[data-part=leader]");
  const text = element.querySelector<HTMLElement>("[data-part=text]");
  if (!leader || !text) return;
  Object.assign(leader.style, {
    left: `${Math.min(0, dx)}px`,
    top: `${Math.min(0, dy)}px`,
    width: `${Math.abs(dx)}px`,
    height: `${Math.abs(dy)}px`,
    borderWidth: "0",
    [dx >= 0 ? "borderLeftWidth" : "borderRightWidth"]: "1px",
    ...(dx !== 0 && { [dy >= 0 ? "borderBottomWidth" : "borderTopWidth"]: "1px" }),
  });
  const gap = TEXT_GAP - 4;
  Object.assign(
    text.style,
    dx === 0
      ? {
          left: "0px",
          top: `${dy + (dy < 0 ? -gap : gap)}px`,
          transform: `translate(-50%, ${dy < 0 ? "-100%" : "0"})`,
          textAlign: "center",
        }
      : {
          left: `${dx + (dx > 0 ? gap : -gap)}px`,
          top: `${dy}px`,
          transform: `translate(${dx > 0 ? "0" : "-100%"}, -50%)`,
          textAlign: dx > 0 ? "left" : "right",
        },
  );
}

function layoutFor(element: HTMLElement, orientation: number) {
  const [cx, cy] = candidates(Number(element.dataset.dx ?? 0), Number(element.dataset.dy ?? 0))[
    orientation
  ] ?? [0, 0];
  layout(element, cx, cy);
}

export function useLabelAnchors(
  targets: LabelTargets | undefined,
  anchors: readonly LabelAnchor[],
): void {
  useFrame(({ camera, size }) => {
    const registry = targets?.current;
    if (!registry || registry.elements.size === 0) return;
    camera.updateMatrixWorld();
    placedCount = 0;
    const frameClock = performance.now();
    registry.noteCanvasSize(size.width, size.height, frameClock);
    const b = registry.bounds;
    for (const anchor of anchors) {
      const element = registry.elements.get(anchor.id);
      const object = anchor.object();
      if (!element || !object) continue;
      object.updateWorldMatrix(true, false);
      const [ox, oy, oz] = anchor.offset ?? [0, 0, 0];
      point.set(ox, oy, oz).applyMatrix4(object.matrixWorld).project(camera);
      let x = (point.x * 0.5 + 0.5) * size.width;
      let y = (-point.y * 0.5 + 0.5) * size.height;
      const offscreen =
        point.z > 1 ||
        x < (b?.left ?? 0) ||
        x > (b?.right ?? size.width) ||
        y < (b?.top ?? 0) ||
        y > (b?.bottom ?? size.height);
      const last = element.dataset;
      const current = last.orient === undefined ? -1 : Number(last.orient);
      const settling = frameClock - registry.changedAt < SETTLE_MS;
      let target = current;
      if (!settling) target = orient(registry, element, x, y, size.width, size.height);
      else if (current < 0) target = -1;
      let swapping = last.swapAt !== undefined;
      if (target >= 0 && target !== current && !swapping) {
        if (current < 0 || last.shown === "0.00") {
          last.orient = String(target);
          layoutFor(element, target);
        } else {
          last.swapTo = String(target);
          last.swapAt = String(frameClock);
          swapping = true;
        }
      }
      if (swapping && frameClock - Number(last.swapAt) >= SWAP_MS) {
        const next = Number(last.swapTo);
        last.orient = String(next);
        layoutFor(element, next);
        delete last.swapAt;
        delete last.swapTo;
        swapping = false;
      }
      const shownSide = last.orient === undefined ? -1 : Number(last.orient);
      const [cx, cy] =
        shownSide >= 0
          ? (candidates(Number(last.dx ?? 0), Number(last.dy ?? 0))[shownSide] ?? [0, 0])
          : [0, 0];
      if (oy * cy > 0) {
        point.set(ox, -oy, oz).applyMatrix4(object.matrixWorld).project(camera);
        x = (point.x * 0.5 + 0.5) * size.width;
        y = (-point.y * 0.5 + 0.5) * size.height;
      }
      if (shownSide >= 0 && target >= 0 && !offscreen) {
        place(textRect(x, y, cx, cy, Number(last.tw ?? 0), Number(last.th ?? 0)));
      }
      const opacity = offscreen || target < 0 || swapping ? 0 : (anchor.fade?.() ?? 1);
      const moved =
        last.ax === undefined ||
        last.ay === undefined ||
        Math.abs(x - Number(last.ax)) > EPSILON ||
        Math.abs(y - Number(last.ay)) > EPSILON;
      if (moved) {
        last.ax = x.toFixed(1);
        last.ay = y.toFixed(1);
        element.style.transform = `translate3d(${last.ax}px, ${last.ay}px, 0)`;
      }
      const shown = opacity.toFixed(2);
      if (last.shown !== shown) {
        last.shown = shown;
        element.style.opacity = shown;
      }
    }
  });
}
