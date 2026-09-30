import { cn } from "@/shared/lib";

import styles from "./section-header.module.css";

interface SectionHeaderProps {
  label: string;
  index: number;
  className?: string;
}

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
