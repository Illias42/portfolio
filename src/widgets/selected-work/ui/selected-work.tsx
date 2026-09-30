import { sections } from "../../../shared/config";
import { RevealGroup, RevealItem, SectionHeader } from "../../../shared/ui";
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
            <p className={styles.description}>
              A selection of production systems across telecom, mobility, IoT and computer vision.
            </p>
            <span className={styles.date}>2021—NOW</span>
          </RevealItem>
        </RevealGroup>
        <WorkRail />
      </section>
    </div>
  );
}
