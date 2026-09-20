"use client";

import { useAnimate, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, type ReactNode } from "react";

import { caseMotion } from "../../../shared/config";
import { caseTransition } from "../model/case-transition";

import styles from "./case-overlay.module.css";

interface CaseOverlayProps {
  title: string;
  children: ReactNode;
}

interface Settleable {
  then: (onResolve: VoidFunction) => unknown;
}

/** Runs `fn` once: when the animation settles, or after `timeoutMs` if frames stall (hidden tab). */
function whenDone(animation: Settleable, timeoutMs: number, fn: () => void): void {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  const fallback = setTimeout(run, timeoutMs);
  animation.then(() => {
    clearTimeout(fallback);
    run();
  });
}

function settleCase(): void {
  caseTransition.set({ settled: true });
}

function insetFrom(
  origin: { x: number; y: number; width: number; height: number; radius: number },
  rect: DOMRect,
): string {
  const top = Math.max(0, origin.y - rect.y);
  const right = Math.max(0, rect.right - (origin.x + origin.width));
  const bottom = Math.max(0, rect.bottom - (origin.y + origin.height));
  const left = Math.max(0, origin.x - rect.x);
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${origin.radius}px)`;
}

export function CaseOverlay({ title, children }: CaseOverlayProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [dialog, animate] = useAnimate<HTMLDialogElement>();
  const content = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const pressedOutside = useRef(false);

  useLayoutEffect(() => {
    const dialogEl = dialog.current;
    const contentEl = content.current;
    if (!dialogEl || !contentEl) return undefined;

    const { origin, scrollY, triggerId } = caseTransition.get();
    const animated = !reduced;
    caseTransition.set({ open: true, origin: null, settled: !animated });

    const root = document.documentElement;
    const gutter = window.innerWidth - root.clientWidth;
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;
    if (!dialogEl.open) dialogEl.showModal();

    if (animated) {
      const grace = caseMotion.open * 1000 + caseMotion.grace;
      if (origin) {
        // FLIP as a clip reveal: the card's box grows into the panel with no content distortion.
        const rect = dialogEl.getBoundingClientRect();
        const radius = Number.parseFloat(getComputedStyle(dialogEl).borderRadius) || 0;
        const reveal = animate(
          dialogEl,
          { clipPath: [insetFrom(origin, rect), `inset(0px 0px 0px 0px round ${radius}px)`] },
          { duration: caseMotion.open, ease: caseMotion.ease },
        );
        animate(
          contentEl,
          { opacity: [0, 1] },
          {
            duration: caseMotion.content,
            delay: caseMotion.contentDelay,
            ease: caseMotion.contentEase,
          },
        );
        whenDone(reveal, grace, () => {
          dialogEl.style.clipPath = "";
          settleCase();
        });
      } else {
        const fade = animate(
          dialogEl,
          { opacity: [0, 1], scale: [caseMotion.closeScale, 1] },
          { duration: caseMotion.content, ease: caseMotion.ease },
        );
        whenDone(fade, grace, settleCase);
      }
    }

    return () => {
      caseTransition.set({ open: false, settled: true });
      root.style.overflow = previous.overflow;
      root.style.paddingRight = previous.paddingRight;
      if (scrollY !== null) window.scrollTo({ top: scrollY, behavior: "instant" });
      // After the router settles its own focus handling, hand focus back to VIEW CASE.
      if (triggerId) {
        setTimeout(() => document.getElementById(triggerId)?.focus({ preventScroll: true }), 0);
      }
    };
  }, [animate, dialog, reduced]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const dialogEl = dialog.current;
    if (reduced || !dialogEl) {
      router.back();
      return;
    }
    dialogEl.setAttribute("data-closing", "");
    const fade = animate(
      dialogEl,
      { opacity: 0, scale: caseMotion.closeScale },
      { duration: caseMotion.close, ease: caseMotion.closeEase },
    );
    whenDone(fade, caseMotion.close * 1000 + caseMotion.grace, () => router.back());
  };

  const requestClose = useEffectEvent(close);
  const leaveRoute = useEffectEvent(() => {
    if (!closing.current) router.back();
  });

  useEffect(() => {
    const dialogEl = dialog.current;
    if (!dialogEl) return undefined;
    const isOutside = (event: MouseEvent) => {
      const rect = dialogEl.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };
    // ESC arrives as `cancel` (or keydown). A backdrop click must start and end outside the panel,
    // so scrollbar clicks and text-selection drags never close it.
    const onCancel = (event: Event) => {
      event.preventDefault();
      requestClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      pressedOutside.current = isOutside(event);
    };
    const onClick = (event: MouseEvent) => {
      if (pressedOutside.current && isOutside(event)) requestClose();
      pressedOutside.current = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      requestClose();
    };
    // If the browser closes the dialog on its own (repeated ESC), leave the route as well.
    const onClose = () => leaveRoute();
    dialogEl.addEventListener("cancel", onCancel);
    dialogEl.addEventListener("pointerdown", onPointerDown);
    dialogEl.addEventListener("click", onClick);
    dialogEl.addEventListener("keydown", onKeyDown);
    dialogEl.addEventListener("close", onClose);
    return () => {
      dialogEl.removeEventListener("cancel", onCancel);
      dialogEl.removeEventListener("pointerdown", onPointerDown);
      dialogEl.removeEventListener("click", onClick);
      dialogEl.removeEventListener("keydown", onKeyDown);
      dialogEl.removeEventListener("close", onClose);
    };
  }, [dialog]);

  return (
    <dialog ref={dialog} className={styles.panel} aria-label={title}>
      <div className={styles.closeBar}>
        <button type="button" className={styles.close} onClick={close}>
          Close <span aria-hidden="true">×</span>
        </button>
      </div>
      <div ref={content} className={styles.content}>
        {children}
      </div>
    </dialog>
  );
}
