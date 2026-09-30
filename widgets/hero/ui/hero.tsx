import Image from "next/image";
import Link from "next/link";

import { sectionOrder, sections, siteConfig } from "@/shared/config";
import { ArrowIcon } from "@/shared/ui/arrow-icon";
import { TextLink } from "@/shared/ui/text-link";

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
          {sectionOrder.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.nav}
            </a>
          ))}
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
        <p className={styles.stack}>
          TYPESCRIPT <span>/</span> REACT <span>/</span> NEXT.JS <span>/</span> NODE.JS{" "}
          <span>/</span> NESTJS
        </p>
      </div>
      <div className={styles.location}>
        <p className={styles.locationLabel}>BASED IN</p>
        <p className={styles.locationName}>Berlin, Germany</p>
        <span className={styles.availability}>Open to relocation</span>
        <TextLink className={styles.talk} href={siteConfig.email}>
          Let’s talk
        </TextLink>
      </div>
      <div className={styles.scrim} aria-hidden="true" />
      <a className={styles.explore} href={`#${sections.work.id}`}>
        <span className={styles.arrow}>
          <ArrowIcon direction="down" />
        </span>
        <span>Explore selected work</span>
      </a>
      <p className={styles.signature}>
        ILLIA KRYVOSHCHENKOV<span>WEB / MOBILE / CLOUD</span>
      </p>
    </HeroMotion>
  );
}
