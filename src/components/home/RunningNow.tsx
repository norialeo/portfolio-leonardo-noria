import { FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router";
import { experiences } from "../../data/experience";
import { useLang } from "../../hooks/useLang";
import { useNow } from "../../hooks/useNow";
import { formatMonth } from "../../lib/format";
import { Reveal } from "../ui/Reveal";
import { SectionTitle } from "../ui/SectionTitle";
import styles from "./RunningNow.module.css";

function uptime(since: string, now: Date) {
  const start = new Date(`${since}-01T09:00:00-03:00`).getTime();
  let seconds = Math.max(0, Math.floor((now.getTime() - start) / 1000));
  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${days}d ${hh}:${mm}:${ss}`;
}

// "Onde trabalho hoje": as experiências atuais como serviços rodando.
export function RunningNow() {
  const { t, tr, lang } = useLang();
  const now = useNow(1000);
  const running = [...experiences].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <section className="container" aria-labelledby="running-title">
      <SectionTitle index="00" id="running-title" aside={<span className="mono">kubectl get services</span>}>
        {t("home.runningTitle")}
      </SectionTitle>

      <div className={styles.table}>
        {running.map((job, i) => (
          <Reveal key={job.id} delay={i * 0.08}>
            <Link to="/experiencias" className={styles.row}>
              <span className={`mono ${styles.status}`}>
                <span className={styles.dot} aria-hidden="true" /> RUNNING
              </span>
              <span className={styles.company}>
                <strong>{job.company}</strong>
                <span className="muted">{tr(job.role)}</span>
              </span>
              <span className={`mono ${styles.product}`}>{tr(job.product.name)}</span>
              <span className={`mono ${styles.uptime}`}>
                <span className={styles.cellLabel}>uptime</span>
                <span className={styles.ticker}>{uptime(job.start, now)}</span>
                <span className={styles.since}>
                  {t("home.since")} {formatMonth(job.start, lang)}
                </span>
              </span>
              <span className={styles.stack}>
                {job.stack.slice(0, 5).map((s) => (
                  <span key={s} className={styles.chip}>
                    {s}
                  </span>
                ))}
              </span>
              <FiArrowUpRight className={styles.arrow} aria-hidden="true" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
