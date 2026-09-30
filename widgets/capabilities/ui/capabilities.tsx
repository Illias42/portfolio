import Image from "next/image";

import { sections } from "@/shared/config";
import { RevealGroup, RevealItem } from "@/shared/ui/reveal";
import { SectionHeader } from "@/shared/ui/section-header";

import { capabilityFocus, capabilityGroups } from "../model/capabilities";

import styles from "./capabilities.module.css";

export function Capabilities() {
  const { id, label, index } = sections.capabilities;
  return (
    <section id={id} className={styles.block} aria-labelledby="capabilities-title">
      <div className={styles.rocks} aria-hidden="true">
        <Image
          src="/images/capabilities-rocks-clean.webp"
          alt=""
          unoptimized
          fill
          sizes="60vw"
          className={styles.photo}
        />
      </div>

      <div className={styles.section}>
        <SectionHeader label={label} index={index} />

        <div className={styles.layout}>
          <RevealGroup className={styles.intro}>
            <RevealItem>
              <h2 id="capabilities-title" className={styles.statement}>
                <span className={styles.line}>Technology</span>{" "}
                <span className={styles.line}>as a tool</span>{" "}
                <span className={styles.line}>
                  to build <span className={styles.soft}>real</span>
                </span>{" "}
                <span className={styles.line}>
                  <span className={styles.soft}>products.</span>
                </span>
              </h2>
            </RevealItem>
            <RevealItem>
              <p className={styles.description}>
                I work across the stack to design, build and scale products — from AI-powered
                features to real-time platforms and modern web and mobile applications.
              </p>
            </RevealItem>
          </RevealGroup>

          <div className={styles.catalog}>
            <RevealGroup className={styles.groups}>
              {capabilityGroups.map((group, i) => (
                <RevealItem key={group.id} className={styles.group}>
                  <span className={styles.number} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")} /
                  </span>
                  <h3 className={styles.title}>{group.title}</h3>
                  <ul className={styles.items}>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </RevealItem>
              ))}
            </RevealGroup>

            <div className={styles.footer}>
              <p className={styles.focus}>
                {capabilityFocus.map((item, i) => (
                  <span key={item}>
                    {i > 0 && (
                      <span className={styles.slash} aria-hidden="true">
                        /
                      </span>
                    )}
                    {item}
                  </span>
                ))}
              </p>
              <p className={styles.next}>Continuously exploring what’s next.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
