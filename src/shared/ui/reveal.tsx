"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { revealMotion as m } from "../config";

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: m.stagger } },
};

const item: Variants = {
  hidden: { opacity: 0, y: m.lift },
  show: { opacity: 1, y: 0, transition: { duration: m.reveal, ease: m.ease } },
};

const line: Variants = {
  hidden: { y: "160%" },
  show: { y: 0, transition: { duration: m.rise, ease: m.ease } },
};

const ruleX: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: m.rule, ease: m.ease } },
};

const ruleY: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: m.rule, ease: m.ease } },
};

interface Props {
  children?: ReactNode;
  className?: string;
}

/** Scroll-triggered stagger container shared by every homepage section. */
export function RevealGroup({ children, className }: Props) {
  return (
    <motion.div
      className={className}
      variants={group}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: m.amount }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: Props) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

/** A line of display type rising out of a clipping mask. */
export function RevealLine({ children, className }: Props) {
  return (
    <motion.span className={className} variants={line}>
      {children}
    </motion.span>
  );
}

export function RevealRule({ className, axis = "x" }: Props & { axis?: "x" | "y" }) {
  return (
    <motion.span className={className} variants={axis === "x" ? ruleX : ruleY} aria-hidden="true" />
  );
}
