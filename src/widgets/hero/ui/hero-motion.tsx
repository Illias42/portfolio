"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { heroMotion } from "../../../shared/config";

import styles from "./hero.module.css";

export function HeroMotion({ children }: { children: ReactNode }) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const control = animate(
      `.${styles.arrow}`,
      { y: [0, 5, 0] },
      { duration: heroMotion.arrowDuration, repeat: 1, ease: heroMotion.ease },
    );
    return () => control.stop();
  }, [animate, reduced]);

  return (
    <section ref={scope} className={styles.hero} aria-labelledby="hero-title">
      {children}
    </section>
  );
}
