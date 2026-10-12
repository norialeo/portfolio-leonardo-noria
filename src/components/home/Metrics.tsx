import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { experiences } from "../../data/experience";
import { projects } from "../../data/projects";
import { useGitHub } from "../../hooks/useGitHub";
import { useLang } from "../../hooks/useLang";
import styles from "./Metrics.module.css";

function Counter({ to, pad = 0 }: { to: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return <span ref={ref}>{String(value).padStart(pad, "0")}</span>;
}

export function Metrics() {
  const { t } = useLang();
  const github = useGitHub();
  const items = [
    { value: experiences.filter((job) => job.end === null).length, pad: 2, label: t("home.metrics.companies") },
    { value: 3, pad: 2, label: t("home.metrics.fronts") },
    { value: projects.length, pad: 2, label: t("home.metrics.projects") },
    // número ao vivo da API do GitHub (13 enquanto carrega)
    { value: github.data?.profile.publicRepos ?? 13, pad: 2, label: t("home.metrics.repos") },
  ];
  return (
    <section className="container" aria-label={t("home.metrics.label")}>
      <dl className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.cell}>
            <dt className={`mono ${styles.label}`}>{item.label}</dt>
            <dd className={`display ${styles.value}`}>
              <Counter to={item.value} pad={item.pad} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
