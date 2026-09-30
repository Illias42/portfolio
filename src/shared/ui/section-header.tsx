import { cn } from "../lib";

import styles from "./section-header.module.css";

interface SectionHeaderProps {
  label: string;
  /** Position in the homepage sequence, shown as "01"… */
  index: number;
  className?: string;
}

/**
 * The top bar every homepage section opens with: label, hairline, index. Colours follow the
 * section — text uses `currentColor`, hairlines read `--section-line` (falls back to `--color-line`).
 */
export function SectionHeader({ label, index, className }: SectionHeaderProps) {
  return (
    <div className={cn(styles.header, className)}>
      <p className={styles.label}>{label}</p>
      <span className={styles.index} aria-hidden="true">
        {String(index).padStart(2, "0")}
      </span>
    </div>
  );
}
