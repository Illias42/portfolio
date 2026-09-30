import { sections } from "@/shared/config";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SectionHeader } from "@/shared/ui/section-header";

import { WorkRail } from "./work-rail";

import styles from "./selected-work.module.css";

export function SelectedWork() {
  const { id, label, index } = sections.work;
  return (
    <div className={styles.block}>
      <section id={id} className={styles.section} aria-labelledby="selected-work-title">
        <SectionHeader label={label} index={index} />
        <RevealGroup className={styles.intro}>
          <RevealItem>
            <h2 id="selected-work-title" className={styles.statement}>
              <span className={styles.line}>Production systems</span>{" "}
              <span className={styles.line}>
                <span className={styles.soft}>that move the real world.</span>
              </span>
            </h2>
          </RevealItem>
          <RevealItem className={styles.introAside}>
            <span className={styles.date}>2021—NOW</span>
          </RevealItem>
        </RevealGroup>
        <WorkRail />
      </section>
    </div>
  );
}
