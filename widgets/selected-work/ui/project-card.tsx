"use client";

import { useRef, type MouseEvent } from "react";

import { ProjectVisual, type Project } from "@/entities/project";
import { rememberCaseOrigin } from "@/features/open-case";
import { TextLink } from "@/shared/ui/text-link";

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
    rememberCaseOrigin(card.current, triggerId);
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
      {project.visual !== "placeholder" && (
        <div className={styles.visual}>
          <ProjectVisual visual={project.visual} variant="card" active={animate} />
        </div>
      )}
    </article>
  );
}
