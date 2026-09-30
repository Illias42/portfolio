import { useEffect, useEffectEvent, type RefObject } from "react";

import { railConfig } from "../config/rail";

function suppressClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

export function useRailDrag(rail: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = rail.current;
    if (!el) return undefined;
    let pointerId = -1;
    let startX = 0;
    let startLeft = 0;
    let dragged = false;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startLeft = el.scrollLeft;
      dragged = false;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (!dragged && Math.abs(dx) < railConfig.dragThreshold) return;
      if (!dragged) {
        dragged = true;
        el.setPointerCapture(pointerId);
        el.dataset.dragging = "";
      }
      el.scrollLeft = startLeft - dx;
    };
    const onEnd = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = -1;
      if (!dragged) return;
      delete el.dataset.dragging;
      el.addEventListener("click", suppressClick, { capture: true, once: true });
      setTimeout(() => el.removeEventListener("click", suppressClick, { capture: true }), 0);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
    };
  }, [rail]);
}

type LegacyWheelEvent = WheelEvent & { wheelDeltaY?: number };

function isDiscreteWheel(event: LegacyWheelEvent): boolean {
  if (event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) return true;
  if (Math.abs(event.deltaY) < railConfig.wheelThreshold) return false;
  if (!Number.isInteger(event.deltaY)) return false;
  return event.wheelDeltaY === undefined || event.wheelDeltaY % railConfig.wheelNotch === 0;
}

export function useRailWheel(rail: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = rail.current;
    if (!el) return undefined;
    let target = 0;
    let lastTick = 0;
    const onWheel = (event: LegacyWheelEvent) => {
      if (event.ctrlKey || event.shiftKey) return;
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      if (!isDiscreteWheel(event)) return;
      const max = el.scrollWidth - el.clientWidth;
      const atEnd = event.deltaY > 0 ? el.scrollLeft >= max - 1 : el.scrollLeft <= 1;
      if (atEnd) return;
      event.preventDefault();
      const now = event.timeStamp;
      if (now - lastTick > railConfig.wheelSettle) target = el.scrollLeft;
      lastTick = now;
      target = Math.max(0, Math.min(max, target + event.deltaY));
      el.scrollTo({ left: target });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [rail]);
}

export type RailKey = "ArrowLeft" | "ArrowRight" | "Home" | "End";

function isRailKey(key: string): key is RailKey {
  return key === "ArrowLeft" || key === "ArrowRight" || key === "Home" || key === "End";
}

export function useRailKeys(
  root: RefObject<HTMLElement | null>,
  onKey: (key: RailKey) => void,
): void {
  const handleKey = useEffectEvent(onKey);
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isRailKey(event.key) || event.altKey || event.metaKey) return;
      event.preventDefault();
      handleKey(event.key);
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [root]);
}
