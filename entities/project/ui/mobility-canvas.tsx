"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cssColorRgb } from "@/shared/lib";

import { createLabelRegistry } from "../lib/label-registry";
import { AnchorLabels, type AnchorLabel } from "./anchor-labels";
import type { MobilityPalette } from "./mobility.scene";

import styles from "./mobility.module.css";

const VIEW_MARGIN = "600px 0px";

const LABELS: readonly AnchorLabel[] = [
  { id: "live", lines: ["Live tracking"], leader: [46, -58], compactLeader: [30, -40] },
  {
    id: "flow",
    lines: ["Event flow"],
    leader: [-40, -46],
    compactLeader: [0, -40],
    cardLeader: [0, -44],
  },
  { id: "state", lines: ["Ride state"], leader: [44, -46], compactLeader: [26, -34] },
];

const MobilityScene = dynamic(() => import("./mobility.scene").then((m) => m.MobilityScene), {
  ssr: false,
});

export function MobilityCanvas({
  active,
  variant,
  hold = false,
}: {
  active: boolean;
  variant: "card" | "case";
  hold?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const labelTargets = useRef(createLabelRegistry());
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [setup, setSetup] = useState<{ compact: boolean; palette: MobilityPalette } | null>(null);
  useEffect(() => {
    const el = frame.current;
    if (!el) return undefined;
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) return undefined;
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    const media = matchMedia("(max-width: 760px)");
    const update = () =>
      setSetup({
        compact: media.matches,
        palette: {
          pearl: cssColorRgb("--color-pearl-ivory"),
          metal: cssColorRgb("--color-graphite-metal"),
          glass: cssColorRgb("--color-smoked-glass"),
          amber: cssColorRgb("--color-signal"),
          accent: cssColorRgb("--color-accent"),
          warm: cssColorRgb("--color-warm"),
          fill: cssColorRgb("--color-haze"),
          paper: cssColorRgb("--color-work-background"),
          card: cssColorRgb("--color-work-card"),
        },
      });
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => {
        const hit = entry?.isIntersecting ?? false;
        setInView(hit);
        if (hit) setMounted(true);
      },
      { rootMargin: VIEW_MARGIN },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return (
    <div
      ref={frame}
      className={styles.frame}
      data-variant={variant}
      data-active={active}
      aria-hidden="true"
    >
      {setup && mounted && !hold && (
        <MobilityScene
          {...setup}
          variant={variant}
          animate={active && !reduced && inView}
          labelTargets={labelTargets}
        />
      )}
      {(variant === "case" || active) && (
        <AnchorLabels labels={LABELS} targets={labelTargets} variant={variant} />
      )}
    </div>
  );
}
