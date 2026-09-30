"use client";

import { useSyncExternalStore } from "react";

interface CaseOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface CaseTransitionState {
  open: boolean;
  settled: boolean;
  origin: CaseOrigin | null;
  triggerId: string | null;
  scrollY: number | null;
}

const initialState: CaseTransitionState = {
  open: false,
  settled: true,
  origin: null,
  triggerId: null,
  scrollY: null,
};

let state = initialState;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const caseTransition = {
  get: (): CaseTransitionState => state,
  set(patch: Partial<CaseTransitionState>): void {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  },
};

export function useCaseOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state.open,
    () => false,
  );
}

export function useCaseSettled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state.settled,
    () => true,
  );
}

export function rememberCaseOrigin(card: HTMLElement | null, triggerId: string): void {
  const rect = card?.getBoundingClientRect();
  caseTransition.set({
    origin:
      card && rect
        ? {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            radius: Number.parseFloat(getComputedStyle(card).borderRadius) || 0,
          }
        : null,
    triggerId,
    scrollY: window.scrollY,
  });
}
