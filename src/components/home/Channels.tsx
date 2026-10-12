import { FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router";
import { useLang } from "../../hooks/useLang";
import { navItems } from "../../lib/nav";
import { Detection } from "../ui/Detection";
import { Reveal } from "../ui/Reveal";
import { SectionTitle } from "../ui/SectionTitle";
import styles from "./Channels.module.css";

// Grade de "monitores": cada página do site é um canal.
export function Channels() {
  const { t } = useLang();
  return (
    <section className="container" aria-labelledby="channels-title">
      <SectionTitle index="01" id="channels-title" aside={<span className="mono">4 {t("home.channelsAside")}</span>}>
        {t("home.channelsTitle")}
      </SectionTitle>
      <ul className={styles.grid}>
        {navItems.map((item, i) => (
          <Reveal as="li" key={item.to} delay={i * 0.06}>
            <Detection hoverOnly label={`route ${item.to}`} trackId={`CH-${item.ch}`} className={styles.tile}>
              <Link to={item.to} className={styles.link}>
                <span className={`mono ${styles.top}`}>
                  <span>CH-{item.ch}</span>
                  <span className={styles.live}>
                    <span className={styles.dot} aria-hidden="true" /> LIVE
                  </span>
                </span>
                <span className={`display ${styles.title}`}>{t(`nav.${item.key}`)}</span>
                <span className={styles.text}>{t(`home.channels.${item.key}`)}</span>
                <span className={`mono ${styles.go}`}>
                  {t("home.open")} <FiArrowUpRight aria-hidden="true" />
                </span>
              </Link>
            </Detection>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
