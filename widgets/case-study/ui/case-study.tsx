import Link from "next/link";

import {
  getProject,
  type CaseSection,
  type CaseStudyContent,
  type Project,
} from "@/entities/project";
import { cn } from "@/shared/lib";

import { CaseVisual } from "./case-visual";

import styles from "./case-study.module.css";

type CaseMode = "overlay" | "page";

interface CaseStudyProps {
  project: Project;
  content?: CaseStudyContent;
  mode: CaseMode;
}

type HeadingTag = "h2" | "h3";

function SectionBlock({ section, Heading }: { section: CaseSection; Heading: HeadingTag }) {
  const headingId = `case-section-${section.number}`;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div>
        <p className={styles.sectionNumber}>{section.number}</p>
        <Heading id={headingId} className={styles.sectionTitle}>
          {section.title}
        </Heading>
      </div>
      <div className={styles.sectionBody}>
        {section.highlight && <p className={styles.highlight}>{section.highlight}</p>}
        {section.lead && <p className={styles.lead}>{section.lead}</p>}
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {section.bullets && (
          <ul className={styles.bullets}>
            {section.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        )}
        {section.decisions && (
          <dl className={styles.decisions}>
            {section.decisions.map((decision) => (
              <div key={decision.title}>
                <dt>{decision.title}</dt>
                <dd>{decision.body}</dd>
              </div>
            ))}
          </dl>
        )}
        {section.system && (
          <ol className={styles.system} aria-label="System layers, top to bottom">
            {section.system.map((layer) => (
              <li key={layer.label} className={styles.layer}>
                <p className={styles.layerLabel}>{layer.label}</p>
                <ul className={styles.layerItems}>
                  {layer.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
        {section.stack && (
          <ul className={styles.stack}>
            {section.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function CaseStudy({ project, content, mode }: CaseStudyProps) {
  const next = getProject(project.next);
  const titleId = `case-${project.slug}-title`;
  const Title = mode === "page" ? "h1" : "h2";
  const Heading: HeadingTag = mode === "page" ? "h2" : "h3";

  return (
    <div className={cn(styles.root, mode === "page" && styles.rootPage)}>
      <article
        className={cn(styles.case, mode === "overlay" && styles.caseOverlay)}
        aria-labelledby={titleId}
      >
        {mode === "page" && (
          <nav className={styles.pageNav} aria-label="Case navigation">
            <Link href="/#selected-work">
              <span aria-hidden="true">←</span> All work
            </Link>
          </nav>
        )}
        <header>
          <div className={styles.meta}>
            <p>
              {project.number} / {project.sector}
            </p>
            <span>{project.period}</span>
          </div>
          <Title id={titleId} className={styles.title}>
            {project.headline[0]}
            <br />
            {project.headline[1]}
          </Title>
          <p className={styles.lede}>{content?.summary ?? project.summary}</p>
          <div className={styles.visual}>
            <CaseVisual visual={project.visual} />
            {project.visual === "placeholder" && (
              <div className={styles.placeholder} aria-hidden="true">
                Visualization in progress
              </div>
            )}
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>{project.company}</dd>
            </div>
            <div>
              <dt>Tech</dt>
              <dd className={styles.factTech}>{project.tech.join(" / ")}</dd>
            </div>
          </dl>
          {content && (
            <p className={styles.scrollHint}>
              Scroll to explore <span aria-hidden="true">↓</span>
            </p>
          )}
        </header>

        {content ? (
          content.sections.map((section) => (
            <SectionBlock key={section.number} section={section} Heading={Heading} />
          ))
        ) : (
          <section className={styles.section} aria-labelledby="case-pending">
            <div>
              <p className={styles.sectionNumber}>01</p>
              <Heading id="case-pending" className={styles.sectionTitle}>
                Case study in progress
              </Heading>
            </div>
            <div className={styles.sectionBody}>
              <p>The detailed write-up for this project is being prepared.</p>
            </div>
          </section>
        )}

        {next && (
          <footer className={styles.next}>
            <p className={styles.nextLabel}>Next case</p>
            <Link
              href={`/work/${next.slug}`}
              replace={mode === "overlay"}
              scroll={false}
              className={styles.nextLink}
            >
              <span className={styles.nextMeta}>
                {next.number} / {next.sector}
              </span>
              <span className={styles.nextTitle}>
                {next.headline[0]} {next.headline[1]}{" "}
                <span className={styles.nextArrow} aria-hidden="true">
                  →
                </span>
              </span>
            </Link>
          </footer>
        )}
      </article>
    </div>
  );
}
