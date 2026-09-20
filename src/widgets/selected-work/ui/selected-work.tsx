import { WorkRail } from "./work-rail";

import styles from "./selected-work.module.css";

export function SelectedWork() {
  return (
    <div className={styles.block}>
      <section id="selected-work" className={styles.section} aria-labelledby="selected-work-title">
        <header className={styles.intro}>
          <div className={styles.introMain}>
            <p className={styles.label}>Selected work</p>
            <h2 id="selected-work-title" className={styles.statement}>
              Production systems
              <br />
              that move the real world.
            </h2>
          </div>
          <div className={styles.introAside}>
            <p className={styles.description}>
              A selection of production systems across telecom, mobility, IoT and computer vision.
            </p>
            <span className={styles.date}>2021—NOW</span>
          </div>
        </header>
        <WorkRail />
      </section>
    </div>
  );
}
