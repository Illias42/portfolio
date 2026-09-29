"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cssColorRgb } from "../../../shared/lib";
import { useCaseSettled } from "../model/case-transition";
import type { QuartzPalette } from "./quartz.scene";

import styles from "./quartz.module.css";

const QuartzScene = dynamic(() => import("./quartz.scene").then((m) => m.QuartzScene), {
  ssr: false,
});

export function QuartzCanvas({ active, variant }: { active: boolean; variant: "card" | "case" }) {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const settled = useCaseSettled();
  const [visible, setVisible] = useState(false);
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
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false),
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
      {setup && visible && (variant !== "case" || settled) && (
        <QuartzScene {...setup} variant={variant} animate={active && !reduced} />
      )}
      {/* Annotations belong to the case study; the card keeps only the stone. */}
      {active && variant === "case" && (
        <ul className={styles.labels}>
          <li className={styles.above}>AWS IoT Core</li>
          <li className={styles.beside}>Device control</li>
        </ul>
      )}
    </div>
  );
}
