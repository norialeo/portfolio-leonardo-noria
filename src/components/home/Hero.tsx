import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { FiArrowDownRight, FiTerminal } from "react-icons/fi";
import { Link } from "react-router";
import { profile } from "../../data/profile";
import { heroDetections } from "../../data/skills";
import { useLang } from "../../hooks/useLang";
import { useNow } from "../../hooks/useNow";
import { useTerminal } from "../terminal/TerminalContext";
import { Detection } from "../ui/Detection";
import { Detector, type DetectorStats } from "./Detector";
import styles from "./Hero.module.css";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const { t, locale } = useLang();
  const terminal = useTerminal();
  const reduce = useReducedMotion() ?? false;
  const now = useNow(1000);
  const [stats, setStats] = useState<DetectorStats>({ fps: 0, tracks: 0 });
  const onStats = useCallback((next: DetectorStats) => setStats(next), []);

  const date = now.toLocaleDateString("sv-SE", { timeZone: profile.timezone }); // AAAA-MM-DD
  const time = now.toLocaleTimeString(locale, { timeZone: profile.timezone, hour12: false });

  const reveal = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease },
        };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.feed}>
        <Detector
          labels={heroDetections}
          visitorLabel={t("hero.visitor")}
          lostLabel={t("hero.lost")}
          onStats={onStats}
          reducedMotion={reduce}
        />
        <div className={styles.scanlines} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
      </div>

      {/* HUD da "câmera" */}
      <div className={`mono ${styles.hud}`} aria-hidden="true">
        <div className={styles.hudTL}>
          <span className={styles.rec}>
            <span className={styles.recDot} /> REC
          </span>
          <span>CAM-01 · NORIA/PORTFOLIO</span>
          <span className={styles.hideSm}>
            {profile.coords.lat.toFixed(4)}° {profile.coords.lng.toFixed(4)}° · BH
          </span>
        </div>
        <div className={styles.hudTR}>
          <span>{date}</span>
          <span className={styles.time}>{time} BRT</span>
        </div>
        <div className={styles.hudBR}>
          <span>FPS {reduce ? "—" : String(stats.fps).padStart(2, "0")}</span>
          <span>TRACKS {String(stats.tracks).padStart(2, "0")}</span>
          <span className={styles.hideSm}>MODEL yolo-noria-v1 · CONF ≥ 0.50</span>
        </div>
        <span className={`${styles.frame} ${styles.frameTL}`} />
        <span className={`${styles.frame} ${styles.frameTR}`} />
        <span className={`${styles.frame} ${styles.frameBL}`} />
        <span className={`${styles.frame} ${styles.frameBR}`} />
        <span className={styles.crosshair} />
      </div>

      <div className={`container ${styles.content}`}>
        <motion.p className={`mono ${styles.kicker}`} {...reveal(0.1)}>
          <span className="accent">{"//"}</span> {t("hero.kicker")}
        </motion.p>

        <motion.div {...reveal(0.2)}>
          <Detection label="person 0.99 · leonardo_noria" trackId="#001" className={styles.nameBox}>
            <h1 id="hero-title" className={`display ${styles.name}`}>
              <span>{profile.firstName}</span>
              <span>{profile.lastName}</span>
            </h1>
          </Detection>
        </motion.div>

        <motion.div className={styles.bottom} {...reveal(0.4)}>
          <p className={styles.pitch}>{t("hero.pitch")}</p>
          <div className={styles.actions}>
            <Link to="/projetos" className="btn btn--primary">
              {t("hero.ctaProjects")}
              <FiArrowDownRight aria-hidden="true" />
            </Link>
            <button type="button" className="btn" onClick={() => terminal.open()}>
              <FiTerminal aria-hidden="true" />
              {t("hero.ctaTerminal")}
            </button>
          </div>
          <p className={`mono ${styles.hint}`}>{t("hero.hint")}</p>
        </motion.div>
      </div>
    </section>
  );
}
