import { PoolCanvas } from "./pool-canvas";

import styles from "./work-transition.module.css";

export function WorkTransition() {
  return (
    <div className={styles.block}>
      <section id="selected-work" className={styles.section} aria-labelledby="selected-work-title">
        <header className={styles.intro}>
          <p className={styles.label}>02 / SELECTED WORK</p>
          <div className={styles.headingRow}>
            <h2 id="selected-work-title">Selected work.</h2>
            <span className={styles.date}>2021—NOW</span>
          </div>
          <p className={styles.description}>
            Production systems across telecom, mobility, IoT and computer vision.
          </p>
        </header>
        <article className={styles.project} aria-labelledby="telecom-title">
          <div className={styles.projectCopy}>
            <div className={styles.projectMeta}>
              <p>01 / TELECOM</p>
              <span>2024—NOW</span>
            </div>
            <h3 id="telecom-title">
              Infrastructure
              <br />
              behind ~1M users.
            </h3>
            <p className={styles.support}>
              Backend services for eSIM, phone number provisioning, call routing and VPN.
            </p>
            <p className={styles.tech}>NODE.JS / NESTJS / SIP / VOIP / POSTGRESQL / REDIS</p>
            <div className={styles.case}>
              <div id="telecom-case" className={styles.caseBody}>
                <p className={styles.label}>KEVYCH SOLUTIONS · FULL-STACK DEVELOPER</p>
                <p>
                  Architected and shipped Node.js and NestJS services for eSIM and phone-number
                  provisioning, call routing and VPN on a telecom platform serving approximately one
                  million users.
                </p>
                <p>
                  Integrated SIP/VoIP providers for real-time call handling, and built self-service
                  tooling for business customers to manage accounts, provisioning and usage.
                </p>
              </div>
            </div>
          </div>
          <div className={styles.projectVisual}>
            <PoolCanvas />
          </div>
        </article>
      </section>
    </div>
  );
}
