import { cn } from "@/shared/lib";

import styles from "./arrow-icon.module.css";

export type ArrowDirection = "up-right" | "down" | "left" | "right";

const paths: Record<ArrowDirection, string> = {
  "up-right": "M3 13 13 3M5 3h8v8",
  down: "M8 2v12M3 9l5 5 5-5",
  left: "M14 8H2M7 3 2 8l5 5",
  right: "M2 8h12M9 3l5 5-5 5",
};

interface ArrowIconProps {
  direction?: ArrowDirection;
  className?: string;
}

export function ArrowIcon({ direction = "up-right", className }: ArrowIconProps) {
  return (
    <svg className={cn(styles.arrow, className)} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={paths[direction]} />
    </svg>
  );
}
