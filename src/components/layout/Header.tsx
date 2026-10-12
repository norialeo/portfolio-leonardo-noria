import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FiMenu, FiTerminal, FiX } from "react-icons/fi";
import { Link, NavLink, useLocation } from "react-router";
import { profile } from "../../data/profile";
import { useLang } from "../../hooks/useLang";
import { navItems } from "../../lib/nav";
import { useTerminal } from "../terminal/TerminalContext";
import styles from "./Header.module.css";
import { LanguageSwitch } from "./LanguageSwitch";

export function Header() {
  const { t } = useLang();
  const terminal = useTerminal();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className={`${styles.header} ${scrolled || menuOpen ? styles.scrolled : ""}`}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand} aria-label={`${profile.name} — ${t("nav.home")}`}>
          <span className={styles.mark} aria-hidden="true">
            LN
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{profile.name}</span>
            <span className={`mono ${styles.brandRole}`}>{t("hero.roleShort")}</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label={t("nav.label")}>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                  <span className={styles.ch} aria-hidden="true">
                    {item.ch}
                  </span>
                  {t(`nav.${item.key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <LanguageSwitch />
          <button
            type="button"
            className={styles.termBtn}
            onClick={() => terminal.open()}
            aria-label={t("terminal.open")}
            title={t("terminal.open")}
          >
            <FiTerminal aria-hidden="true" />
            <kbd className={styles.kbd}>{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? t("nav.close") : t("nav.menu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="menu-mobile"
            className={styles.mobile}
            aria-label={t("nav.label")}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul className="container">
              <li>
                <NavLink to="/" end className={({ isActive }) => `${styles.mLink} ${isActive ? styles.active : ""}`}>
                  <span className={styles.ch}>00</span>
                  {t("nav.home")}
                </NavLink>
              </li>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({ isActive }) => `${styles.mLink} ${isActive ? styles.active : ""}`}>
                    <span className={styles.ch}>{item.ch}</span>
                    {t(`nav.${item.key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <p className={`container mono ${styles.mobileHint}`}>{t("terminal.hintMobile")}</p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
