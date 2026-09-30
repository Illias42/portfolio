"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cssColorRgb } from "@/shared/lib";

import type { OpticsPalette } from "./optics.scene";

import styles from "./optics.module.css";

const VIEW_MARGIN = "600px 0px";

const OpticsScene = dynamic(() => import("./optics.scene").then((m) => m.OpticsScene), {
  ssr: false,
});

interface Setup {
  compact: boolean;
  parallax: boolean;
  palette: OpticsPalette;
  fontFamily: string;
}

export function OpticsCanvas({
  active,
  variant,
  hold = false,
}: {
  active: boolean;
  variant: "card" | "case";
  hold?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [setup, setSetup] = useState<Setup | null>(null);
  useEffect(() => {
    const el = frame.current;
    if (!el) return undefined;
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) return undefined;
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    let cancelled = false;
    const media = matchMedia("(max-width: 760px)");
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
      "monospace";
    const fine = matchMedia("(pointer: fine)");
    const palette: OpticsPalette = {
      surface: cssColorRgb(variant === "card" ? "--color-work-card" : "--color-work-background"),
      pearl: cssColorRgb("--color-pearl-ivory"),
      ink: cssColorRgb("--color-work-foreground"),
      smoke: cssColorRgb("--color-smoked-glass"),
      line: cssColorRgb("--color-work-secondary"),
      metal: cssColorRgb("--color-graphite-metal"),
      amber: cssColorRgb("--color-signal"),
      key: cssColorRgb("--color-white"),
      fill: cssColorRgb("--color-haze"),
      warm: cssColorRgb("--color-warm"),
    };
    const update = () =>
      setSetup({
        compact: media.matches,
        parallax: !media.matches && fine.matches,
        fontFamily,
        palette,
      });
    const ready = () => {
      if (!cancelled) update();
    };
    document.fonts.load(`400 64px ${fontFamily}`).then(ready, ready);
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
      cancelled = true;
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
      {setup && mounted && !hold && (
        <OpticsScene {...setup} variant={variant} animate={active && !reduced && inView} />
      )}
      {active && (
        <ul className={styles.labels}>
          <li className={styles.recognition}>
            Image
            <br />
            recognition
          </li>
          <li className={styles.data}>
            Structured
            <br />
            data
          </li>
        </ul>
      )}
    </div>
  );
}
