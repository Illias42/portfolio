"use client";

import { useRef, type MouseEvent } from "react";

import type { Project } from "../../../entities/project";
import { TextLink } from "../../../shared/ui";
import { caseTransition } from "../model/case-transition";
import { RealtimeRouteScene } from "./mobility-canvas";
import { NetworkCanvas } from "./network-canvas";
import { ComputerVisionScene } from "./optics-canvas";
import { QuartzCanvas } from "./quartz-canvas";

import styles from "./work-rail.module.css";

export type CardState = "active" | "next" | "rest";

interface ProjectCardProps {
  project: Project;
  state: CardState;
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
          onClick={(event) => {
            onSelect();
            // Hand focus to the case link only for keyboard activation (detail 0); a mouse click
            // would otherwise light up its focus ring.
            if (event.detail !== 0) return;
            requestAnimationFrame(() =>
              document.getElementById(triggerId)?.focus({ preventScroll: true }),
            );
          }}
        />
      )}
      <div className={styles.meta} data-label-guard>
        <span>{project.number}</span>
        <span>{project.period}</span>
      </div>
      <div className={styles.copy}>
        <p className={styles.sector} data-label-guard>
          {project.sector}
        </p>
        <h3 id={titleId} className={styles.title} data-label-guard>
          {project.headline[0]}
          <br />
          {project.headline[1]}
        </h3>
        <p className={styles.summary} data-label-guard>
          {project.summary}
        </p>
        <div className={styles.spacer} />
        <TextLink
          id={triggerId}
          className={styles.cta}
          data-label-guard
          href={`/work/${project.slug}`}
          scroll={false}
          draggable={false}
          onClick={openCase}
        >
          View case
        </TextLink>
        <p className={styles.tech} data-label-guard>
          {project.tech.join(" / ")}
        </p>
      </div>
      {project.visual === "quartz" && (
        <div className={styles.visual}>
          <QuartzCanvas variant="card" active={animate} />
        </div>
      )}
      {project.visual === "mobility" && (
        <div className={styles.visual}>
          <RealtimeRouteScene variant="card" active={animate} />
        </div>
      )}
      {project.visual === "optics" && (
        <div className={styles.visual}>
          <ComputerVisionScene variant="card" active={animate} />
        </div>
      )}
      {project.visual === "telecom" && (
        <div className={styles.visual}>
          <NetworkCanvas variant="card" active={animate} />
        </div>
      )}
    </article>
  );
}
