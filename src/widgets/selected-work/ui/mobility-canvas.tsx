"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cssColorRgb } from "../../../shared/lib";
import { useCaseSettled } from "../model/case-transition";
import type { MobilityPalette } from "./mobility.scene";

import styles from "./mobility.module.css";

const MobilityScene = dynamic(() => import("./mobility.scene").then((m) => m.MobilityScene), {
  ssr: false,
});

export function RealtimeRouteScene({
  active,
  variant,
}: {
  active: boolean;
  variant: "card" | "case";
}) {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const settled = useCaseSettled();
  const [visible, setVisible] = useState(false);
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
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false),
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
      {setup && visible && (variant !== "case" || settled) && (
        <MobilityScene {...setup} variant={variant} animate={active && !reduced} />
      )}
      {variant === "case" && (
        <ul className={styles.labels}>
          <li>Live tracking</li>
          <li>Event flow</li>
          <li>Ride state</li>
        </ul>
      )}
    </div>
  );
}
