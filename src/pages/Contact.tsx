import { useState } from "react";
import { FiArrowUpRight, FiCheck, FiCopy, FiMapPin } from "react-icons/fi";
import { ContactForm } from "../components/contact/ContactForm";
import { PageHeader } from "../components/ui/PageHeader";
import { Reveal } from "../components/ui/Reveal";
import { profile } from "../data/profile";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLang } from "../hooks/useLang";
import { useNow } from "../hooks/useNow";
import { socials } from "../lib/socials";
import styles from "./Contact.module.css";

const copyable: Record<string, string> = {
  email: profile.email,
  whatsapp: profile.phoneDisplay,
};

export function Contact() {
  const { t, locale } = useLang();
  const now = useNow(1000);
  const [copied, setCopied] = useState<string | null>(null);
  useDocumentTitle(t("contact.title"));

  const copy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1800);
    } catch {
      // sem permissão de área de transferência: o link continua funcionando
    }
  };

  return (
    <>
      <PageHeader channel="04" label={t("contact.label")} title={t("contact.title")} lead={t("contact.lead")} />

      <div className={`container ${styles.grid}`}>
        <section aria-labelledby="channels-title">
          <h2 id="channels-title" className={`mono ${styles.colTitle}`}>
            {t("contact.channelsTitle")}
          </h2>
          <ul className={styles.channels}>
            {socials.map(({ id, label, handle, href, icon: Icon }, i) => (
              <Reveal as="li" key={id} delay={i * 0.04} className={styles.channel}>
                <a href={href} target={id === "email" ? undefined : "_blank"} rel="noreferrer" className={styles.channelLink}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={styles.channelText}>
                    <span className={styles.channelLabel}>{label}</span>
                    <span className={`mono ${styles.handle}`}>{handle}</span>
                  </span>
                  <FiArrowUpRight className={styles.arrow} aria-hidden="true" />
                </a>
                {copyable[id] && (
                  <button
                    type="button"
                    className={styles.copy}
                    onClick={() => copy(id, copyable[id]!)}
                    aria-label={`${t("common.copy")} ${label}`}
                    title={copied === id ? t("common.copied") : t("common.copy")}
                  >
                    {copied === id ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                    <span className="sr-only" aria-live="polite">
                      {copied === id ? t("common.copied") : ""}
                    </span>
                  </button>
                )}
              </Reveal>
            ))}
          </ul>

          <div className={`mono ${styles.where}`}>
            <FiMapPin aria-hidden="true" />
            <span>{t("contact.location")}</span>
            <span className={styles.localTime}>{now.toLocaleTimeString(locale, { timeZone: profile.timezone, hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </section>

        <section aria-labelledby="form-title">
          <h2 id="form-title" className={`mono ${styles.colTitle}`}>
            {t("contact.formTitle")}
          </h2>
          <Reveal>
            <ContactForm />
          </Reveal>
        </section>
      </div>
    </>
  );
}
