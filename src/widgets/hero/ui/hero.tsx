import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "../../../shared/config";
import { HeroMotion } from "./hero-motion";

import styles from "./hero.module.css";

export function Hero() {
  return (
    <HeroMotion>
      <a className={styles.skip} href="#hero-title">
        Skip to content
      </a>
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.orb} aria-hidden="true" />
      <div className={styles.portrait} data-portrait>
        <Image
          src="/images/illia-coastal-hero-lossless.webp"
          alt="Portrait of Illia Kryvoshchenkov overlooking the Mediterranean at sunset"
          fill
          sizes="(max-width: 760px) max(112vw, 1740px), max(100vw, 200svh, 1480px)"
          unoptimized
          preload
          className={styles.photo}
        />
      </div>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/" aria-label="Illia Kryvoshchenkov home">
          IK
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href={siteConfig.cv} aria-label="Work experience in my CV">
            Work
          </a>
          <a href={siteConfig.linkedin} aria-label="About me on LinkedIn">
            About
          </a>
          <a href="#hero-stack">Stack</a>
          <a href={siteConfig.email}>Contact</a>
        </nav>
      </header>
      <div className={styles.sideLabel}>ILLIA KRYVOSHCHENKOV</div>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>FULL-STACK ENGINEER · 5+ YEARS</p>
        <h1 id="hero-title">
          Building the engine
          <br />
          behind the
          <br />
          experience.
        </h1>
        <p className={styles.description}>
          React interfaces. Node.js services. React Native apps.
          <br className={styles.desktopBreak} /> I build and ship products end to end.
        </p>
        <p id="hero-stack" className={styles.stack}>
          TYPESCRIPT <span>/</span> REACT <span>/</span> NEXT.JS <span>/</span> NODE.JS{" "}
          <span>/</span> NESTJS
        </p>
      </div>
      <div className={styles.location}>
        <p className={styles.locationLabel}>BASED IN</p>
        <p className={styles.locationName}>Berlin, Germany</p>
        <span className={styles.availability}>Open to relocation</span>
        <a href={siteConfig.email}>
          Let’s talk <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className={styles.scrim} aria-hidden="true" />
      <a className={styles.explore} href={siteConfig.cv}>
        <span className={styles.arrow} aria-hidden="true">
          ↓
        </span>
        <span>
          EXPLORE MY EXPERIENCE <span className={styles.pdf}> / CV</span>
        </span>
      </a>
      <p className={styles.signature}>
        ILLIA KRYVOSHCHENKOV<span>WEB / MOBILE / CLOUD</span>
      </p>
    </HeroMotion>
  );
}
