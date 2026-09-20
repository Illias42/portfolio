"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";

import type { Project } from "../../../entities/project";
import { caseTransition } from "../model/case-transition";
import { NetworkCanvas } from "./network-canvas";

import styles from "./work-rail.module.css";

export type CardState = "active" | "next" | "rest";

interface ProjectCardProps {
  project: Project;
  state: CardState;
  /** Runs the card's WebGL loop (active or hovered card only). */
  animate: boolean;
  onSelect: () => void;
  onHoverChange: (hovering: boolean) => void;
}

export function ProjectCard({
  project,
  state,
  animate,
  onSelect,
  onHoverChange,
}: ProjectCardProps) {
  const card = useRef<HTMLElement>(null);
  const titleId = `project-${project.slug}-title`;
  const triggerId = `view-case-${project.slug}`;

  const openCase = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    const el = card.current;
    const rect = el?.getBoundingClientRect();
    caseTransition.set({
      origin:
        el && rect
          ? {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              radius: Number.parseFloat(getComputedStyle(el).borderRadius) || 0,
            }
          : null,
      triggerId,
      scrollY: window.scrollY,
    });
  };

  return (
    <article
      ref={card}
      className={styles.card}
      data-state={state}
      aria-labelledby={titleId}
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
    >
      {state !== "active" && (
        <button
          type="button"
          className={styles.select}
          aria-label={`Show project ${project.number}: ${project.sector}`}
          onClick={() => {
            onSelect();
            // The select button unmounts once the card is active; keep focus inside the card.
            requestAnimationFrame(() =>
              document.getElementById(triggerId)?.focus({ preventScroll: true }),
            );
          }}
        />
      )}
      <div className={styles.meta}>
        <span>{project.number}</span>
        <span>{project.period}</span>
      </div>
      <div className={styles.copy}>
        <p className={styles.sector}>{project.sector}</p>
        <h3 id={titleId} className={styles.title}>
          {project.headline[0]}
          <br />
          {project.headline[1]}
        </h3>
        <p className={styles.summary}>{project.summary}</p>
        <div className={styles.spacer} />
        <Link
          id={triggerId}
          className={styles.cta}
          href={`/work/${project.slug}`}
          scroll={false}
          draggable={false}
          onClick={openCase}
        >
          View case <span aria-hidden="true">↗</span>
        </Link>
        <p className={styles.tech}>{project.tech.join(" / ")}</p>
      </div>
      {project.visual === "telecom" && (
        <div className={styles.visual}>
          <NetworkCanvas variant="card" active={animate} />
        </div>
      )}
    </article>
  );
}
