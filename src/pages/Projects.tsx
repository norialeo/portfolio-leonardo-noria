import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { FiGithub, FiStar } from "react-icons/fi";
import { MediaViewer } from "../components/projects/MediaViewer";
import { PageHeader } from "../components/ui/PageHeader";
import { categoryLabels, projects, type ProjectCategory } from "../data/projects";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGitHub } from "../hooks/useGitHub";
import { useLang } from "../hooks/useLang";
import { formatDate, shortHash, timeAgo } from "../lib/format";
import styles from "./Projects.module.css";

type Filter = "all" | ProjectCategory;

// Ordem cronológica garantida: do mais antigo ao mais recente.
const timeline = [...projects].sort((a, b) => a.date.localeCompare(b.date));

export function Projects() {
  const { t, tr, lang } = useLang();
  const reduce = useReducedMotion();
  const github = useGitHub();
  const [filter, setFilter] = useState<Filter>("all");
  useDocumentTitle(t("projects.title"));

  const filters = useMemo(() => {
    const counts = new Map<ProjectCategory, number>();
    for (const p of timeline) for (const c of p.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const visible = filter === "all" ? timeline : timeline.filter((p) => p.categories.includes(filter));
  const repoStats = new Map(github.data?.repos.map((r) => [r.name.toLowerCase(), r]) ?? []);

  // A linha do tempo "acende" conforme a rolagem
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <>
      <PageHeader channel="02" label={t("projects.label")} title={t("projects.title")} lead={t("projects.lead")} />

      <div className={`container ${styles.toolbar}`}>
        <div className={styles.filters} role="group" aria-label={t("projects.filterLabel")}>
          <button type="button" className={styles.filter} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            {t("projects.all")} <span>{timeline.length}</span>
          </button>
          {filters.map(([category, count]) => (
            <button key={category} type="button" className={styles.filter} aria-pressed={filter === category} onClick={() => setFilter(category)}>
              {tr(categoryLabels[category])} <span>{count}</span>
            </button>
          ))}
        </div>
        <p className={`mono ${styles.cmd}`} aria-live="polite">
          <span className="accent">$</span> git log --reverse · {t("projects.count", { count: visible.length })}
        </p>
      </div>

      <section className={`container ${styles.timelineWrap}`} aria-label={t("projects.title")}>
        <div className={styles.rail} aria-hidden="true">
          <motion.div className={styles.railFill} style={{ scaleY: reduce ? 1 : progress }} />
        </div>

        <ol ref={listRef} className={styles.timeline}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((project, i) => {
              const hash = shortHash(project.slug);
              const isFirst = project === timeline[0];
              const isLast = project === timeline[timeline.length - 1];
              const stats = repoStats.get(project.repo.toLowerCase());
              return (
                <motion.li
                  key={project.slug}
                  layout={!reduce}
                  className={styles.entry}
                  initial={reduce ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className={`${styles.node} ${isLast ? styles.nodeHead : ""}`} aria-hidden="true" />

                  <article className={styles.card} aria-labelledby={`p-${project.slug}`}>
                    <div className={styles.info}>
                      <p className={`mono ${styles.meta}`}>
                        <span className={styles.hash}>{hash}</span>
                        <time dateTime={project.date}>{formatDate(project.date, lang)}</time>
                        {isFirst && <span className={styles.refTag}>{t("projects.init")}</span>}
                        {isLast && <span className={`${styles.refTag} ${styles.refHead}`}>HEAD → main · {t("projects.head")}</span>}
                        <span className={styles.index}>
                          {String(timeline.indexOf(project) + 1).padStart(2, "0")}/{String(timeline.length).padStart(2, "0")}
                        </span>
                      </p>

                      <h2 id={`p-${project.slug}`} className={styles.title}>
                        {tr(project.title)}
                      </h2>
                      <p className={styles.summary}>{tr(project.summary)}</p>

                      <ul className={styles.details}>
                        {project.details.map((d, j) => (
                          <li key={j}>{tr(d)}</li>
                        ))}
                      </ul>

                      {project.context && <p className={`mono ${styles.context}`}>{tr(project.context)}</p>}

                      <div className={styles.stackRow}>
                        <span className={`mono ${styles.stackLabel}`}>{t("projects.stack")}</span>
                        <ul className={styles.tech}>
                          {project.tech.map((tech) => (
                            <li key={tech}>{tech}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={styles.links}>
                        <a className="btn" href={project.github} target="_blank" rel="noreferrer">
                          <FiGithub aria-hidden="true" /> {t("projects.repo")}
                          <span className="sr-only"> — {tr(project.title)}</span>
                        </a>
                        {stats && (
                          <span className={`mono ${styles.live}`}>
                            {stats.language && <span>{stats.language}</span>}
                            <span>
                              <FiStar aria-label={t("github.stars")} /> {stats.stars}
                            </span>
                            <span>{t("github.updated", { when: timeAgo(stats.pushedAt, lang) })}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <MediaViewer media={project.media} title={tr(project.title)} trackId={`#${hash.slice(0, 3)}`} />
                  </article>

                  {i < visible.length - 1 && <span className={styles.gap} aria-hidden="true" />}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>

        {visible.length === 0 && <p className="muted">{t("projects.empty")}</p>}
      </section>
    </>
  );
}
