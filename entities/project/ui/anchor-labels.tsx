"use client";

import { Fragment, useEffect, useRef, type RefObject } from "react";

import { useMediaQuery } from "@/shared/lib";

import type { LabelRect, LabelTargets } from "../lib/label-registry";

import styles from "./anchor-labels.module.css";

type Leader = readonly [dx: number, dy: number];

export interface AnchorLabel {
  id: string;
  lines: readonly string[];
  leader: Leader;
  compactLeader?: Leader;
  cardLeader?: Leader;
}

function relative(rect: DOMRect, origin: DOMRect): LabelRect {
  return {
    left: rect.left - origin.left,
    top: rect.top - origin.top,
    right: rect.right - origin.left,
    bottom: rect.bottom - origin.top,
  };
}

function textLines(element: Element): DOMRect[] {
  const range = document.createRange();
  range.selectNodeContents(element);
  return [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
}

function useFrameGeometry(list: RefObject<HTMLUListElement | null>, targets: LabelTargets) {
  useEffect(() => {
    const ul = list.current;
    if (!ul) return undefined;
    const registry = targets.current;
    const article = ul.closest("article");
    const measure = () => {
      const origin = ul.getBoundingClientRect();
      const clip = article ? relative(article.getBoundingClientRect(), origin) : null;
      registry.setFrame(
        clip && {
          left: Math.max(0, clip.left),
          top: Math.max(0, clip.top),
          right: Math.min(origin.width, clip.right),
          bottom: Math.min(origin.height, clip.bottom),
        },
        [...(article?.querySelectorAll("[data-label-guard]") ?? [])].flatMap((el) =>
          textLines(el).map((rect) => relative(rect, origin)),
        ),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ul);
    if (article) observer.observe(article);
    return () => {
      observer.disconnect();
      registry.setFrame(null, []);
    };
  }, [list, targets]);
}

function pickLeader(label: AnchorLabel, compact: boolean, variant: "card" | "case"): Leader {
  if (compact && label.compactLeader) return label.compactLeader;
  if (variant === "card" && label.cardLeader) return label.cardLeader;
  return label.leader;
}

export function AnchorLabels({
  labels,
  targets,
  variant = "case",
}: {
  labels: readonly AnchorLabel[];
  targets: LabelTargets;
  variant?: "card" | "case";
}) {
  const compact = useMediaQuery("(max-width: 760px)");
  const list = useRef<HTMLUListElement>(null);
  useFrameGeometry(list, targets);
  return (
    <ul ref={list} className={styles.labels} data-variant={variant}>
      {labels.map((label) => {
        const [dx, dy] = pickLeader(label, compact, variant);
        return (
          <li
            key={label.id}
            className={styles.label}
            data-dx={dx}
            data-dy={dy}
            ref={(element) => {
              if (!element) {
                targets.current.elements.delete(label.id);
                return;
              }
              const text = element.querySelector<HTMLElement>("[data-part=text]");
              if (text?.offsetWidth) element.dataset.tw = String(text.offsetWidth);
              if (text?.offsetHeight) element.dataset.th = String(text.offsetHeight);
              delete element.dataset.orient;
              targets.current.elements.set(label.id, element);
            }}
          >
            <span className={styles.leader} data-part="leader" />
            <span className={styles.dot} />
            <span className={styles.text} data-part="text">
              {label.lines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
