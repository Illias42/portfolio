import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "../lib";
import { ArrowIcon, type ArrowDirection } from "./arrow-icon";

import styles from "./text-link.module.css";

type TextLinkProps = ComponentProps<typeof Link> & {
  arrow?: ArrowDirection;
};

/** House call-to-action: mono caps over a hairline that fills on hover, arrow nudges. */
export function TextLink({ arrow = "up-right", className, children, ...props }: TextLinkProps) {
  return (
    <Link className={cn(styles.link, className)} data-arrow={arrow} {...props}>
      {children}
      <ArrowIcon direction={arrow} className={styles.arrow} />
      <span className={styles.rule} aria-hidden="true" />
    </Link>
  );
}
