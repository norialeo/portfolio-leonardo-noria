import { LANGS } from "../../data/types";
import { useLang } from "../../hooks/useLang";
import styles from "./LanguageSwitch.module.css";

export function LanguageSwitch({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { lang, setLang, t } = useLang();
  return (
    <div className={`${styles.switch} ${size === "lg" ? styles.lg : ""}`} role="group" aria-label={t("lang.label")}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          className={styles.option}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          title={t(`lang.${code}`)}
        >
          <span aria-hidden="true">{code.toUpperCase()}</span>
          <span className="sr-only">{t(`lang.${code}`)}</span>
        </button>
      ))}
    </div>
  );
}
