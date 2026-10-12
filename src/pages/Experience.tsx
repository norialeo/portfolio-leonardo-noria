import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Reveal } from "../components/ui/Reveal";
import { SectionTitle } from "../components/ui/SectionTitle";
import { education, experiences, type LogTag } from "../data/experience";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLang } from "../hooks/useLang";
import { formatMonth } from "../lib/format";
import styles from "./Experience.module.css";

const ordered = [...experiences].sort((a, b) => b.start.localeCompare(a.start));
const tagsInUse = [...new Set(ordered.flatMap((job) => job.highlights.map((h) => h.tag)))] as LogTag[];

export function Experience() {
  const { t, tr, lang } = useLang();
  const reduce = useReducedMotion();
  const [tag, setTag] = useState<LogTag | null>(null);
  useDocumentTitle(t("experience.title"));

  return (
    <>
      <PageHeader channel="03" label={t("experience.label")} title={t("experience.title")} lead={t("experience.lead")} />

      <div className={`container ${styles.legend}`}>
        <span className={`mono ${styles.legendLabel}`}>{t("experience.legend")}</span>
        <div className={styles.tags} role="group" aria-label={t("experience.legend")}>
          {tagsInUse.map((name) => (
            <button
              key={name}
              type="button"
              className={styles.tagBtn}
              data-tag={name}
              aria-pressed={tag === name}
              onClick={() => setTag((current) => (current === name ? null : name))}
            >
              <span className={styles.tagCode}>{name}</span> {t(`experience.tags.${name}`)}
            </button>
          ))}
        </div>
      </div>

      <div className={`container ${styles.jobs}`}>
        {ordered.map((job, index) => {
          const visible = tag ? job.highlights.filter((h) => h.tag === tag) : job.highlights;
          return (
            <article key={job.id} className={styles.job} aria-labelledby={`job-${job.id}`}>
              <Reveal className={styles.side}>
                <p className={`mono ${styles.status}`}>
                  <span className={styles.dot} aria-hidden="true" /> RUNNING
                  <span className={styles.num}>#{String(index + 1).padStart(2, "0")}</span>
                </p>
                <h2 id={`job-${job.id}`} className={`display ${styles.company}`}>
                  {job.company}
                </h2>
                <p className={styles.role}>{tr(job.role)}</p>
                <p className={`mono ${styles.period}`}>
                  <time dateTime={job.start}>{formatMonth(job.start, lang)}</time> — {job.end ? formatMonth(job.end, lang) : t("experience.present")}
                  <span aria-hidden="true"> · </span>
                  {tr(job.mode)}
                </p>

                <div className={styles.product}>
                  <p className={`mono ${styles.blockLabel}`}>
                    {t("experience.product")} · <span className={styles.productName}>{tr(job.product.name)}</span>
                  </p>
                  <p className={styles.productText}>{tr(job.product.text)}</p>
                </div>

                <dl className={styles.metrics}>
                  {job.metrics.map((m) => (
                    <div key={m.value}>
                      <dt className="mono">{tr(m.label)}</dt>
                      <dd>{m.value}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <p className={`mono ${styles.blockLabel}`}>{t("experience.stack")}</p>
                  <ul className={styles.stack}>
                    {job.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <div className={styles.log}>
                <p className={`mono ${styles.logBar}`}>
                  <span>
                    $ kubectl logs deploy/{job.id} --since={job.start}
                  </span>
                  <span>{t("experience.impact")}</span>
                </p>
                <ol className={styles.lines}>
                  <AnimatePresence initial={false}>
                    {visible.map((h, i) => (
                      <motion.li
                        key={h.title.en}
                        layout={!reduce}
                        className={styles.line}
                        initial={reduce ? false : { opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, delay: reduce ? 0 : i * 0.03 }}
                      >
                        <span className={styles.lineTag} data-tag={h.tag}>
                          {h.tag}
                        </span>
                        <div>
                          <h3 className={styles.lineTitle}>{tr(h.title)}</h3>
                          <p className={styles.lineText}>{tr(h.text)}</p>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {visible.length === 0 && (
                    <li className={`mono ${styles.empty}`}>
                      — grep {tag}: {t("experience.noResults")}
                    </li>
                  )}
                </ol>
              </div>
            </article>
          );
        })}
      </div>

      <section className={`container ${styles.education}`} aria-labelledby="edu-title">
        <SectionTitle index="//" id="edu-title">
          {t("experience.education")}
        </SectionTitle>
        <Reveal className={styles.eduCard}>
          <div>
            <p className={`mono ${styles.blockLabel}`}>{tr(education.status)}</p>
            <h3 className={styles.eduCourse}>{tr(education.course)}</h3>
            <p className={styles.eduInst}>{education.institution}</p>
          </div>
          <p className={`display ${styles.eduYears}`}>
            {education.start}
            <span aria-hidden="true">→</span>
            <span className="sr-only"> — </span>
            {education.end}
          </p>
        </Reveal>
      </section>
    </>
  );
}
