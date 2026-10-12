import { FiGithub } from "react-icons/fi";
import { profile } from "../../data/profile";
import { useGitHub } from "../../hooks/useGitHub";
import { useLang } from "../../hooks/useLang";
import { timeAgo } from "../../lib/format";
import { languageColor } from "../../lib/languages";
import { Reveal } from "../ui/Reveal";
import { SectionTitle } from "../ui/SectionTitle";
import styles from "./GitHubActivity.module.css";

const LEVEL: Record<string, string> = {
  PushEvent: "PUSH",
  CreateEvent: "CREATE",
  DeleteEvent: "DELETE",
  PullRequestEvent: "PR",
  IssuesEvent: "ISSUE",
  WatchEvent: "STAR",
  ForkEvent: "FORK",
  PublicEvent: "PUBLIC",
  MemberEvent: "MEMBER",
  ReleaseEvent: "RELEASE",
};

// Atividade pública do GitHub, ao vivo, no formato de um log de servidor.
export function GitHubActivity() {
  const { t, lang } = useLang();
  const github = useGitHub();

  return (
    <section className="container" aria-labelledby="activity-title">
      <SectionTitle index="02" id="activity-title" aside={<span className="mono">GET /api/github</span>}>
        {t("home.activityTitle")}
      </SectionTitle>

      <Reveal className={styles.grid}>
        <div className={styles.log} role="log" aria-live="off" aria-label={t("home.activityLog")}>
          <div className={`mono ${styles.logBar}`}>
            <span>$ tail -f github.events</span>
            <span className={styles.badge}>
              {github.status === "loading" && t("common.connecting")}
              {github.status === "ready" && (
                <>
                  <span className={styles.dot} aria-hidden="true" /> {t("common.live")}
                </>
              )}
              {github.status === "error" && t("common.offline")}
            </span>
          </div>

          <ol className={styles.lines}>
            {github.status === "loading" &&
              Array.from({ length: 6 }, (_, i) => <li key={i} className={styles.skeleton} style={{ width: `${88 - i * 9}%` }} />)}

            {github.status === "error" && (
              <li className={styles.line}>
                <span className={styles.lvlErr}>WARN</span>
                <span className={styles.msg}>{t("home.activityError")}</span>
              </li>
            )}

            {github.status === "ready" &&
              github.data.events.slice(0, 9).map((event) => (
                <li key={event.id} className={styles.line}>
                  <time className={styles.when} dateTime={event.createdAt}>
                    {timeAgo(event.createdAt, lang)}
                  </time>
                  <span className={styles.lvl}>{LEVEL[event.type] ?? "EVENT"}</span>
                  <span className={styles.msg}>
                    <a href={`https://github.com/${event.repo}`} target="_blank" rel="noreferrer">
                      {event.repo}
                    </a>
                    {event.ref && <span className={styles.ref}> → {event.ref}</span>}
                    {event.sha && <span className={styles.sha}> {event.sha}</span>}
                  </span>
                </li>
              ))}
            {github.status === "ready" && github.data.events.length === 0 && (
              <li className={styles.line}>
                <span className={styles.msg}>{t("home.activityEmpty")}</span>
              </li>
            )}
            <li className={styles.cursor} aria-hidden="true">
              ▍
            </li>
          </ol>
        </div>

        <aside className={styles.side} aria-label={t("home.activityStats")}>
          <dl className={styles.stats}>
            <div>
              <dt className="mono">{t("github.repos")}</dt>
              <dd>{github.data?.profile.publicRepos ?? "—"}</dd>
            </div>
            <div>
              <dt className="mono">{t("github.followers")}</dt>
              <dd>{github.data?.profile.followers ?? "—"}</dd>
            </div>
          </dl>

          <p className={`mono ${styles.langTitle}`}>{t("github.languages")}</p>
          <div className={styles.bar} aria-hidden="true">
            {github.data?.languages.map((l) => (
              <span key={l.name} style={{ flexGrow: l.share, background: languageColor(l.name) }} />
            ))}
          </div>
          <ul className={styles.langs}>
            {github.data?.languages.slice(0, 5).map((l) => (
              <li key={l.name}>
                <span className={styles.swatch} style={{ background: languageColor(l.name) }} aria-hidden="true" />
                {l.name}
                <span className={styles.pct}>{Math.round(l.share * 100)}%</span>
              </li>
            ))}
          </ul>

          <a className="btn" href={profile.github} target="_blank" rel="noreferrer">
            <FiGithub aria-hidden="true" /> @{profile.handle}
          </a>
        </aside>
      </Reveal>
    </section>
  );
}
