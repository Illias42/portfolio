"use client";

import { motion, type Variants } from "motion/react";

import { revealMotion as m } from "../../../shared/config";

const marker: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { duration: m.reveal, ease: m.ease } },
};

export function RevealMarker({ className }: { className?: string }) {
  return <motion.span className={className} variants={marker} aria-hidden="true" />;
}
