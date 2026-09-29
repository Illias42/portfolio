"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { capabilitiesMotion as m } from "../../../shared/config";

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: m.stagger } },
};

const item: Variants = {
  hidden: { opacity: 0, y: m.lift },
  show: { opacity: 1, y: 0, transition: { duration: m.reveal, ease: m.ease } },
};

interface Props {
  children?: ReactNode;
  className?: string;
}

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
