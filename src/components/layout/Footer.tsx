import { FiArrowUp, FiArrowUpRight } from "react-icons/fi";
import { Link, useLocation } from "react-router";
import { profile } from "../../data/profile";
import { useLang } from "../../hooks/useLang";
import { useNow } from "../../hooks/useNow";
import { navItems } from "../../lib/nav";
import { socials } from "../../lib/socials";
import styles from "./Footer.module.css";

export function Footer() {
  const { t, locale } = useLang();
  const { pathname } = useLocation();
  const now = useNow(1000);
  const time = now.toLocaleTimeString(locale, { timeZone: profile.timezone, hour12: false });

  return (
    <footer className={styles.footer}>
      {pathname !== "/contato" && (
        <section className={`container ${styles.cta}`} aria-labelledby="footer-cta">
          <p className={`mono ${styles.ctaLabel}`}>{t("footer.ctaLabel")}</p>
          <h2 id="footer-cta" className={`display ${styles.ctaTitle}`}>
            {t("footer.ctaTitle")}
          </h2>
          <div className={styles.ctaActions}>
            <Link to="/contato" className="btn btn--primary">
              {t("footer.ctaButton")}
              <FiArrowUpRight aria-hidden="true" />
            </Link>
            <a href={`mailto:${profile.email}`} className="btn">
              {profile.email}
            </a>
          </div>
        </section>
      )}

      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <p className={styles.name}>{profile.name}</p>
          <p className="muted">{t("footer.tagline")}</p>
        </div>

        <nav aria-label={t("footer.navLabel")}>
          <p className={`mono ${styles.colTitle}`}>{t("footer.pages")}</p>
          <ul className={styles.list}>
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>
                  <span className={styles.ch}>{item.ch}</span> {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className={`mono ${styles.colTitle}`}>{t("footer.elsewhere")}</p>
          <ul className={styles.socials}>
            {socials.map(({ id, label, href, icon: Icon }) => (
              <li key={id}>
                <a href={href} target={id === "email" ? undefined : "_blank"} rel="noreferrer" aria-label={label} title={label}>
                  <Icon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.status}>
        <div className={`container ${styles.statusRow}`}>
          <span className={styles.online}>
            <span className={styles.dot} aria-hidden="true" /> {t("footer.online")}
          </span>
          <span className={styles.hideSm}>
            BH {profile.coords.lat.toFixed(4)}, {profile.coords.lng.toFixed(4)}
          </span>
          <span>
            <time dateTime={now.toISOString()}>{time}</time> BRT
          </span>
          <a className={styles.hideSm} href={profile.repoUrl} target="_blank" rel="noreferrer">
            v1.0.0 · {t("footer.source")}
          </a>
          <span className={styles.spacer} />
          <span>© {now.getFullYear()} {profile.name}</span>
          <button type="button" className={styles.top} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <FiArrowUp aria-hidden="true" /> {t("footer.top")}
          </button>
        </div>
      </div>
    </footer>
  );
}
