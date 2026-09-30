"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { projects } from "../../../entities/project";
import { useMediaQuery } from "../../../shared/lib";
import { ArrowIcon } from "../../../shared/ui";
import { railConfig } from "../config/rail";
import { useRailDrag, useRailKeys, useRailWheel, type RailKey } from "../lib/rail-input";
import { useCaseOpen } from "../model/case-transition";
import { ProjectCard, type CardState } from "./project-card";

import styles from "./work-rail.module.css";

const { widths, gap } = railConfig;
const railVars: CSSProperties & Record<`--${string}`, string> = {
  "--w-active": `${widths.active}%`,
  "--w-active-compressed": `${widths.activeCompressed}%`,
  "--w-next": `${widths.next}%`,
  "--w-rest": `${widths.rest}%`,
  "--w-hover": `${widths.hover}%`,
  // Unitless copies so copy columns can be sized from the measured rail width (see --rail-inner).
  "--f-active": `${widths.active / 100}`,
  "--f-next": `${widths.next / 100}`,
  "--f-rest": `${widths.rest / 100}`,
  "--rail-gap": `${gap}px`,
};

const last = projects.length - 1;

function clampIndex(index: number): number {
  return Math.max(0, Math.min(last, index));
}

function cardState(index: number, active: number): CardState {
  if (index === active) return "active";
  return index === active + 1 ? "next" : "rest";
}

/** Predicted card box after the width transition settles: everything before `index` is a rest card. */
function predictedBox(rail: HTMLElement, index: number): { left: number; right: number } {
  const paddingRight = Number.parseFloat(getComputedStyle(rail).paddingRight) || 0;
  const inner = rail.clientWidth - paddingRight;
  const left = index * ((widths.rest / 100) * inner + gap);
  return { left, right: left + (widths.active / 100) * inner };
}

export function WorkRail() {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const caseOpen = useCaseOpen();
  const compact = useMediaQuery(railConfig.compactQuery);
  const reduced = useReducedMotion();
  useRailDrag(rail);
  useRailWheel(rail);

  // Copy columns take their width from the rail, not the animating card, so text never reflows
  // while flex-basis transitions. One measurement per resize, applied before paint; copy
  // transitions switch on only after the first measurement so hydration never animates.
  useLayoutEffect(() => {
    const el = rail.current;
    if (!el) return undefined;
    const measure = () => {
      const paddingRight = Number.parseFloat(getComputedStyle(el).paddingRight) || 0;
      el.style.setProperty("--rail-inner", `${el.clientWidth - paddingRight}px`);
    };
    measure();
    // Transitions switch on after the first paint so hydration never animates the copy.
    const enable = setTimeout(() => el.setAttribute("data-measured", ""), 0);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      clearTimeout(enable);
      observer.disconnect();
    };
  }, []);

  const select = (index: number) => {
    const next = clampIndex(index);
    setActive(next);
    const el = rail.current;
    if (!el) return;
    const behavior: ScrollBehavior = reduced ? "instant" : "smooth";
    if (compact) {
      const card = el.children[next];
      if (card instanceof HTMLElement) el.scrollTo({ left: card.offsetLeft, behavior });
      return;
    }
    const { left, right } = predictedBox(el, next);
    let target = el.scrollLeft;
    if (right > target + el.clientWidth) target = right - el.clientWidth;
    if (left < target) target = left;
    if (target !== el.scrollLeft) el.scrollTo({ left: target, behavior });
  };

  // On small screens the swipe position decides which card is current.
  useEffect(() => {
    const el = rail.current;
    if (!compact || !el) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let nearest = 0;
        let best = Number.POSITIVE_INFINITY;
        Array.from(el.children).forEach((card, index) => {
          if (!(card instanceof HTMLElement)) return;
          const distance = Math.abs(card.offsetLeft - el.scrollLeft);
          if (distance < best) {
            best = distance;
            nearest = index;
          }
        });
        setActive(nearest);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, [compact]);

  useRailKeys(root, (key: RailKey) => {
    const moves: Record<RailKey, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: last,
    };
    select(moves[key]);
  });

  return (
    <div ref={root}>
      <div ref={rail} className={styles.rail} style={railVars}>
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            state={cardState(index, active)}
            animate={!caseOpen && (index === active || hovered === index)}
            onSelect={() => select(index)}
            onHoverChange={(hovering) =>
              setHovered((current) => {
                if (hovering) return index;
                return current === index ? null : current;
              })
            }
          />
        ))}
      </div>
      <div className={styles.controls}>
        <ol className={styles.indicators} aria-label="Project positions">
          {projects.map((project, index) => (
            <li key={project.slug}>
              <button
                type="button"
                aria-current={index === active ? "true" : undefined}
                aria-label={`Project ${project.number}: ${project.sector}`}
                onClick={() => select(index)}
              >
                {project.number}
                <span className={styles.dot} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.navigation}>
          <div className={styles.arrows}>
            <button
              type="button"
              aria-label="Previous project"
              disabled={active === 0}
              onClick={() => select(active - 1)}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next project"
              disabled={active === last}
              onClick={() => select(active + 1)}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
          <p className={styles.hint}>Scroll / drag / use arrows</p>
        </div>
      </div>
    </div>
  );
}
