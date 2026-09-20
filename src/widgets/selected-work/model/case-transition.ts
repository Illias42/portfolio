import { useSyncExternalStore } from "react";

interface CaseOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface CaseTransitionState {
  /** True while the case overlay is mounted — the rail pauses its WebGL loop. */
  open: boolean;
  /** False while the overlay's open animation runs; the case scene mounts once it is true. */
  settled: boolean;
  /** Viewport rect of the card that launched the case, consumed by the open animation. */
  origin: CaseOrigin | null;
  /** Element id of the VIEW CASE trigger, refocused on close. */
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
