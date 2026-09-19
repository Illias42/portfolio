"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cn, cssColorRgb, type Rgb01 } from "../../../shared/lib";
import { poolConfig, type PoolProfile } from "../config/pool";
import type { PoolPalette } from "./pool.scene";

import styles from "./pool.module.css";

const PoolScene = dynamic(() => import("./pool.scene").then((m) => m.PoolScene), { ssr: false });

// Light absorption multiplier: the token's hue, desaturated toward white so sand keeps its warmth.
function waterTint(rgb: Rgb01, { saturation, gain }: { saturation: number; gain: number }): Rgb01 {
  const peak = Math.max(rgb[0], rgb[1], rgb[2]) || 1;
  const channel = (c: number) => (1 + (c / peak - 1) * saturation) * gain;
  return [channel(rgb[0]), channel(rgb[1]), channel(rgb[2])];
}

function readPalette(): PoolPalette {
  return {
    sand: cssColorRgb("--color-photo"),
    sandWet: cssColorRgb("--color-earth"),
    above: waterTint(cssColorRgb("--color-ocean"), poolConfig.tint.above),
    underwater: waterTint(cssColorRgb("--color-ocean"), poolConfig.tint.underwater),
    skyHorizon: cssColorRgb("--color-white"),
    skyZenith: cssColorRgb("--color-haze"),
    sunGlow: cssColorRgb("--color-warm"),
    sun: cssColorRgb("--color-sun"),
    ballWhite: cssColorRgb("--color-white"),
    ballA: cssColorRgb("--color-flag-black"),
    ballB: cssColorRgb("--color-flag-red"),
    ballC: cssColorRgb("--color-flag-gold"),
  };
}

function readProfile(): PoolProfile {
  const compact =
    matchMedia(poolConfig.mobileQuery).matches || matchMedia(poolConfig.coarsePointerQuery).matches;
  return compact ? poolConfig.mobile : poolConfig.desktop;
}

function supportsWebgl2(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

interface Setup {
  palette: PoolPalette;
  profile: PoolProfile;
}

export function PoolCanvas() {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = frame.current;
    if (!el || !supportsWebgl2()) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setSetup((current) => current ?? { palette: readPalette(), profile: readProfile() });
        }
        setInView(entry.isIntersecting);
      },
      { rootMargin: poolConfig.observerMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className={styles.frame} aria-hidden="true">
      {setup && (
        <PoolScene
          className={cn(styles.canvas, ready && styles.canvasReady)}
          palette={setup.palette}
          profile={setup.profile}
          animate={inView && !reduced}
          onReady={() => setReady(true)}
        />
      )}
    </div>
  );
}
