"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cssColorRgb } from "../../../shared/lib";
import { createLabelRegistry } from "../lib/label-anchors";
import { useCaseSettled } from "../model/case-transition";
import { AnchorLabels, type AnchorLabel } from "./anchor-labels";
import type { QuartzPalette } from "./quartz.scene";

import styles from "./quartz.module.css";

const VIEW_MARGIN = "600px 0px";

const LABELS: readonly AnchorLabel[] = [
  { id: "cloud", lines: ["AWS IoT Core"], leader: [48, -34], compactLeader: [36, -26] },
  {
    id: "control",
    lines: ["Device control"],
    leader: [-290, 24],
    compactLeader: [-56, 74],
    cardLeader: [-64, 60],
  },
];

const QuartzScene = dynamic(() => import("./quartz.scene").then((m) => m.QuartzScene), {
  ssr: false,
});

export function QuartzCanvas({ active, variant }: { active: boolean; variant: "card" | "case" }) {
  const frame = useRef<HTMLDivElement>(null);
  const labelTargets = useRef(createLabelRegistry());
  const reduced = useReducedMotion();
  const settled = useCaseSettled();
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [setup, setSetup] = useState<{ compact: boolean; palette: QuartzPalette } | null>(null);
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
          surface: cssColorRgb(
            variant === "card" ? "--color-work-card" : "--color-work-background",
          ),
          pearl: cssColorRgb("--color-pearl-ivory"),
          amber: cssColorRgb("--color-signal"),
          warm: cssColorRgb("--color-warm"),
          fill: cssColorRgb("--color-haze"),
          key: cssColorRgb("--color-white"),
          shade: cssColorRgb("--color-muted"),
          smoke: cssColorRgb("--color-smoked-glass"),
          earth: cssColorRgb("--color-earth"),
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
  }, [variant]);
  return (
    <div
      ref={frame}
      className={styles.frame}
      data-variant={variant}
      data-active={active}
      aria-hidden="true"
    >
      {setup && mounted && (variant !== "case" || settled) && (
        <QuartzScene
          {...setup}
          variant={variant}
          animate={active && !reduced && inView}
          labelTargets={labelTargets}
        />
      )}
      {active && <AnchorLabels labels={LABELS} targets={labelTargets} variant={variant} />}
    </div>
  );
}
