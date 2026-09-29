import { siteConfig } from "../../../shared/config";
import { roles } from "../model/roles";
import { RevealGroup, RevealItem, RevealMarker, RevealRule } from "./reveal";
import { SeaCanvas } from "./sea-canvas";

import styles from "./experience.module.css";

export function Experience() {
  return (
    <section id="experience" className={styles.block} aria-labelledby="experience-title">
      <SeaCanvas className={styles.sea} />
      <div className={styles.section}>
        <RevealGroup className={styles.intro}>
          <RevealItem>
            <p className={styles.label}>Experience</p>
          </RevealItem>
          <RevealItem>
            <h2 id="experience-title" className={styles.statement}>
              <span className={styles.line}>
                5+ years building <span className={styles.soft}>production</span>
              </span>{" "}
              <span className={styles.line}>
                software <span className={styles.soft}>end to end.</span>
              </span>
            </h2>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className={styles.timeline}>
          <RevealRule className={styles.rule} />
          <ol className={styles.roles}>
            {roles.map((role) => (
              <li key={role.id} className={styles.role}>
                <RevealItem className={styles.period}>
                  <time dateTime={role.period.start}>{role.period.label}</time>
                </RevealItem>
                <RevealMarker className={role.current ? styles.markerCurrent : styles.markerPast} />
                <RevealItem className={styles.body}>
                  <h3 className={styles.company}>{role.company}</h3>
                  <p className={styles.title}>
                    {role.title}
                    {role.current && <span className={styles.srOnly}> (current)</span>}
                  </p>
                  <p className={styles.summary}>{role.summary}</p>
                  <p className={styles.domains}>{role.domains.join(", ")}</p>
                </RevealItem>
              </li>
            ))}
          </ol>
        </RevealGroup>

        <RevealGroup className={styles.footer}>
          <RevealItem>
            <a className={styles.cv} href={siteConfig.cv} download>
              Download CV
              <span className={styles.cvMeta}>PDF</span>
              <span className={styles.cvArrow} aria-hidden="true">
                ↓
              </span>
            </a>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
