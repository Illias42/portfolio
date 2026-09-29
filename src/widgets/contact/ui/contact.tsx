import Image from "next/image";

import { contactFocus, contactLinks } from "../model/links";
import { RevealGroup, RevealItem, RevealLine, RevealRule } from "./reveal";
import { SignOff } from "./sign-off";

import styles from "./contact.module.css";

export function Contact() {
  return (
    <section id="contact" className={styles.block} aria-labelledby="contact-title">
      <div className={styles.wall} aria-hidden="true">
        <Image
          src="/images/contact-palms.webp"
          alt=""
          unoptimized
          fill
          sizes="100vw"
          className={styles.photo}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.top}>
          <p className={styles.label}>Contact</p>
          <span className={styles.index} aria-hidden="true">
            05
          </span>
        </div>

        <div className={styles.layout}>
          <div className={styles.intro}>
            <RevealGroup>
              <RevealItem>
                <p className={styles.eyebrow}>Available for new opportunities</p>
              </RevealItem>
              <h2 id="contact-title" className={styles.statement}>
                <span className={styles.mask}>
                  <RevealLine className={styles.line}>Have something</RevealLine>
                </span>{" "}
                <span className={styles.mask}>
                  <RevealLine className={`${styles.line} ${styles.soft}`}>
                    worth building?
                  </RevealLine>
                </span>
              </h2>
            </RevealGroup>
            <SignOff />
          </div>

          <RevealGroup className={styles.links}>
            <ul className={styles.list}>
              {contactLinks.map((link, i) => (
                <li key={link.id} className={styles.row}>
                  <RevealItem className={styles.number}>
                    <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  </RevealItem>
                  <a
                    className={styles.link}
                    href={link.href}
                    {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    {...(link.download && { download: "" })}
                  >
                    <RevealItem className={styles.linkInner}>
                      <span className={styles.linkLabel}>{link.label}</span>
                      <span className={styles.srOnly}>, {link.destination}</span>
                      <svg
                        className={styles.arrow}
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M3 13 13 3M5 3h8v8" />
                      </svg>
                    </RevealItem>
                    <RevealRule className={styles.rule} />
                    <span className={styles.ruleActive} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </RevealGroup>
        </div>

        <RevealGroup className={styles.footer}>
          <RevealRule className={styles.footerRule} />
          <RevealItem>
            <p className={styles.focus}>
              {contactFocus.map((item, i) => (
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
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
