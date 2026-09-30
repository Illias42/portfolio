"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { contactMotion as m } from "@/shared/config";

import styles from "./contact.module.css";

const pen: Variants = {
  hidden: { clipPath: "inset(-20% 100% -20% 0)" },
  show: {
    clipPath: "inset(-20% -10% -20% 0)",
    transition: { duration: m.write, delay: m.writeDelay, ease: m.writeEase },
  },
};

const stroke: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: m.underline, delay: m.writeDelay + m.write * 0.85, ease: m.ease },
  },
};

export function SignOff() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={styles.signOff}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: m.amount }}
    >
      <motion.p className={styles.script} variants={pen}>
        <span className={styles.scriptFirst}>
          Let<span className={styles.tuck}>’</span>s build something
        </span>{" "}
        <span className={styles.scriptSecond}>meaningful.</span>
      </motion.p>
      <svg className={styles.flourish} viewBox="0 0 260 80" fill="none" aria-hidden="true">
        <motion.path
          d="M2 78C62 54 150 22 258 2"
          vectorEffect="non-scaling-stroke"
          variants={stroke}
        />
      </svg>
    </motion.div>
  );
}
