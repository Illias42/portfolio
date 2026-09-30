import Image from "next/image";

import { cn } from "@/shared/lib";

import styles from "./sea.module.css";

export function SeaCanvas({ className }: { className?: string }) {
  return (
    <div className={cn(styles.frame, className)} aria-hidden="true">
      <Image
        src="/images/experience-coast-natural.webp"
        alt=""
        unoptimized
        fill
        sizes="100vw"
        className={styles.image}
      />
      <div className={styles.shade} />
    </div>
  );
}
