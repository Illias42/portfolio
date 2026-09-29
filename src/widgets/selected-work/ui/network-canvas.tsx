"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cn, cssColorRgb } from "../../../shared/lib";
import { networkConfig, type NetworkProfile } from "../config/network";
import { createLabelRegistry } from "../lib/label-anchors";
import { useCaseSettled } from "../model/case-transition";
import { AnchorLabels, type AnchorLabel } from "./anchor-labels";
import type { NetworkPalette, NetworkVariant } from "./network.scene";

import styles from "./network.module.css";

const NetworkScene = dynamic(() => import("./network.scene").then((m) => m.NetworkScene), {
  ssr: false,
});

const LABELS: readonly AnchorLabel[] = [
  {
    id: "routing",
    lines: ["Call routing"],
    leader: [40, -36],
    compactLeader: [28, -28],
    cardLeader: [0, -34],
  },
  {
    id: "esim",
    lines: ["eSIM", "provisioning"],
    leader: [44, -30],
    compactLeader: [-30, -30],
    cardLeader: [0, 34],
  },
  { id: "vpn", lines: ["VPN services"], leader: [-44, 0], compactLeader: [-24, 0] },
];

function readPalette(): NetworkPalette {
  return {
    ivory: cssColorRgb("--color-pearl-ivory"),
    ceramic: cssColorRgb("--color-ceramic"),
    glass: cssColorRgb("--color-smoked-glass"),
    metal: cssColorRgb("--color-graphite-metal"),
    graphite: cssColorRgb("--color-muted"),
    signal: cssColorRgb("--color-signal"),
    key: cssColorRgb("--color-white"),
    fill: cssColorRgb("--color-haze"),
    paper: cssColorRgb("--color-work-background"),
    sky: cssColorRgb("--color-water-highlight"),
    glint: cssColorRgb("--color-warm"),
    shade: cssColorRgb("--color-line"),
  };
}

function readProfile(): NetworkProfile {
  const compact =
    matchMedia(networkConfig.mobileQuery).matches ||
    matchMedia(networkConfig.coarsePointerQuery).matches;
  return compact ? networkConfig.mobile : networkConfig.desktop;
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
  palette: NetworkPalette;
  profile: NetworkProfile;
}

interface NetworkCanvasProps {
  variant: NetworkVariant;
  active: boolean;
  className?: string;
}

export function NetworkCanvas({ variant, active, className }: NetworkCanvasProps) {
  const frame = useRef<HTMLDivElement>(null);
  const labelTargets = useRef(createLabelRegistry());
  const reduced = useReducedMotion();
  const [setup, setSetup] = useState<Setup | null>(null);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const settled = useCaseSettled();
  const mountScene = setup !== null && (variant !== "case" || settled);

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
      { rootMargin: networkConfig.observerMargin },
    );
    observer.observe(el);
    const media = matchMedia(networkConfig.mobileQuery);
    const updateProfile = () =>
      setSetup((current) => (current ? { ...current, profile: readProfile() } : current));
    media.addEventListener("change", updateProfile);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateProfile);
    };
  }, []);

  return (
    <div
      ref={frame}
      className={cn(
        styles.frame,
        variant === "case" ? styles.frameCase : styles.frameCard,
        className,
      )}
      aria-hidden="true"
    >
      {mountScene && (
        <NetworkScene
          className={cn(styles.canvas, ready && styles.canvasReady)}
          palette={setup.palette}
          profile={setup.profile}
          variant={variant}
          animate={inView && active && !reduced}
          onReady={() => setReady(true)}
          labelTargets={labelTargets}
        />
      )}
      {(variant === "case" || active) && ready && (
        <AnchorLabels labels={LABELS} targets={labelTargets} variant={variant} />
      )}
    </div>
  );
}
