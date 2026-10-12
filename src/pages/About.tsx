import { useReducedMotion } from "motion/react";
import { FiDownload, FiGithub, FiStar } from "react-icons/fi";
import { DetectedPortrait } from "../components/about/DetectedPortrait";
import { SkillsSphere } from "../components/about/SkillsSphere";
import { LanguageSwitch } from "../components/layout/LanguageSwitch";
import { Detection } from "../components/ui/Detection";
import { PageHeader } from "../components/ui/PageHeader";
import { Reveal } from "../components/ui/Reveal";
import { SectionTitle } from "../components/ui/SectionTitle";
import { facts, intro, languages } from "../data/about";
import { profile } from "../data/profile";
import { skillGroups } from "../data/skills";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useGitHub } from "../hooks/useGitHub";
import { useLang } from "../hooks/useLang";
import { formatMonth, timeAgo } from "../lib/format";
import { languageColor } from "../lib/languages";
import styles from "./About.module.css";

const allSkills = skillGroups.flatMap((group) => group.items);
// As que mais uso no dia a dia aparecem destacadas na esfera
const coreSkills = new Set(["Flutter", "Dart", "Go", "Python", "TypeScript", "React", "Vue 3", "FastAPI", "PostgreSQL", "YOLO"]);

export function About() {
  const { t, tr, lang } = useLang();
  const reduce = useReducedMotion() ?? false;
  const github = useGitHub();
  useDocumentTitle(t("about.title"));

  return (
    <>
      <PageHeader
        channel="01"
        label={t("about.label")}
        title={t("about.title")}
        aside={
          <div className={styles.readIn}>
            <span className="mono">{t("about.readIn")}</span>
            <LanguageSwitch size="lg" />
          </div>
        }
      />

      {/* ------------------------------ apresentação ------------------------------ */}
      <section className={`container ${styles.intro}`} aria-label={t("about.title")}>
        <Reveal className={styles.portrait}>
          <DetectedPortrait />
        </Reveal>
        <div className={styles.text} lang={lang === "en" ? "en" : "pt-BR"}>
          <Reveal>
            <p className={styles.lead}>{tr(intro.lead)}</p>
          </Reveal>
          {intro.body.map((paragraph, i) => (
            <Reveal key={i} delay={0.08 * (i + 1)}>
              <p className={styles.body}>{tr(paragraph)}</p>
            </Reveal>
          ))}
          <Reveal delay={0.25}>
            <dl className={styles.quick}>
              <div>
                <dt className="mono">{t("about.quick.base")}</dt>
                <dd>{profile.city}</dd>
              </div>
              <div>
                <dt className="mono">{t("about.quick.focus")}</dt>
                <dd>Full Stack · Mobile</dd>
              </div>
              <div>
                <dt className="mono">{t("about.quick.status")}</dt>
                <dd className={styles.statusOk}>{t("about.quick.open")}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- ficha -------------------------------- */}
      <section className={`container ${styles.block}`} aria-labelledby="facts-title">
        <SectionTitle index="01" id="facts-title">
          {t("about.factsTitle")}
        </SectionTitle>
        <ul className={styles.facts}>
          {facts.map((fact, i) => (
            <Reveal as="li" key={fact.id} delay={i * 0.06}>
              <Detection hoverOnly label={`${fact.id} 0.9${9 - i}`} className={styles.fact}>
                <p className={`mono ${styles.factLabel}`}>
                  <span className="accent">0{i + 1}</span> {tr(fact.label)}
                </p>
                <h3 className={styles.factTitle}>{tr(fact.title)}</h3>
                <p className={styles.factText}>{tr(fact.text)}</p>
              </Detection>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* -------------------------------- stack -------------------------------- */}
      <section className={`container ${styles.block}`} aria-labelledby="skills-title">
        <SectionTitle index="02" id="skills-title" aside={<span className="mono">{t("about.skillsHint")}</span>}>
          {t("about.skillsTitle")}
        </SectionTitle>
        <div className={styles.skills}>
          <Reveal className={styles.sphere}>
            <SkillsSphere items={allSkills} highlight={coreSkills} label={t("about.skillsCanvas")} reducedMotion={reduce} />
          </Reveal>
          <div className={styles.groups}>
            {skillGroups.map((group, i) => (
              <Reveal key={group.id} delay={i * 0.04} className={styles.group}>
                <h3 className={`mono ${styles.groupTitle}`}>{tr(group.label)}</h3>
                <ul className={styles.chips}>
                  {group.items.map((item) => (
                    <li key={item} className={coreSkills.has(item) ? styles.chipHot : styles.chip}>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------- GitHub, idiomas, CV ------------------------- */}
      <section className={`container ${styles.block}`} aria-label={`${t("about.githubTitle")}, ${t("about.languagesTitle")}, ${t("about.cvTitle")}`}>
        <div className={styles.triple}>
          <Reveal className={styles.panel}>
            <h2 className={`mono ${styles.panelTitle}`}>
              <FiGithub aria-hidden="true" /> {t("about.githubTitle")}
            </h2>
            {github.status === "error" && <p className="muted">{t("about.githubError")}</p>}
            {github.status !== "error" && (
              <>
                <dl className={styles.ghStats}>
                  <div>
                    <dt className="mono">{t("github.repos")}</dt>
                    <dd>{github.data?.profile.publicRepos ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="mono">{t("github.followers")}</dt>
                    <dd>{github.data?.profile.followers ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="mono">{t("about.member")}</dt>
                    <dd className={styles.small}>{github.data ? formatMonth(github.data.profile.createdAt.slice(0, 7), lang) : "—"}</dd>
                  </div>
                </dl>
                <div className={styles.langBar} aria-hidden="true">
                  {github.data?.languages.map((l) => (
                    <span key={l.name} style={{ flexGrow: l.share, background: languageColor(l.name) }} />
                  ))}
                </div>
                <ul className={styles.repos}>
                  {github.data?.repos.slice(0, 4).map((repo) => (
                    <li key={repo.name}>
                      <a href={repo.url} target="_blank" rel="noreferrer">
                        {repo.name}
                      </a>
                      <span className="mono">
                        {repo.stars > 0 && (
                          <>
                            <FiStar aria-label={t("github.stars")} /> {repo.stars} ·{" "}
                          </>
                        )}
                        {timeAgo(repo.pushedAt, lang)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Reveal>

          <Reveal className={styles.panel} delay={0.06}>
            <h2 className={`mono ${styles.panelTitle}`}>{t("about.languagesTitle")}</h2>
            <ul className={styles.langs}>
              {languages.map((language) => (
                <li key={language.name.en}>
                  <div className={styles.langRow}>
                    <span>{tr(language.name)}</span>
                    <span className="mono muted">{tr(language.level)}</span>
                  </div>
                  <div className={styles.meter} aria-hidden="true">
                    <span style={{ width: `${language.value * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className={styles.panel} delay={0.12}>
            <h2 className={`mono ${styles.panelTitle}`}>{t("about.cvTitle")}</h2>
            <p className="muted">{t("about.cvText")}</p>
            <div className={styles.cvButtons}>
              <a className={`btn ${lang === "pt" ? "btn--primary" : ""}`} href={profile.cv.pt} download>
                <FiDownload aria-hidden="true" /> {t("about.cvPt")}
              </a>
              <a className={`btn ${lang === "en" ? "btn--primary" : ""}`} href={profile.cv.en} download>
                <FiDownload aria-hidden="true" /> {t("about.cvEn")}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
