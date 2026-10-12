import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiMail, FiRotateCcw, FiSend } from "react-icons/fi";
import { CONTACT_LIMITS, contactSchema, HONEYPOT_FIELD, type ContactInput, type ContactMessage } from "../../../shared/contact";
import { profile } from "../../data/profile";
import { useLang } from "../../hooks/useLang";
import { ApiError, sendContact } from "../../lib/api";
import styles from "./ContactForm.module.css";

type Outcome =
  | { kind: "idle" }
  | { kind: "success"; status: number; ms: number; id?: string }
  | { kind: "error"; status: number; code: string; retryAfter?: number; data: ContactMessage };

export function ContactForm() {
  const { t } = useLang();
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });
  const [honeypot, setHoneypot] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactMessage>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", message: "" },
  });

  const messageLength = watch("message")?.length ?? 0;

  const onSubmit = async (data: ContactMessage) => {
    setOutcome({ kind: "idle" });
    try {
      const result = await sendContact({ ...data, [HONEYPOT_FIELD]: honeypot });
      setOutcome({ kind: "success", status: result.status, ms: result.ms, id: result.id });
      reset();
    } catch (error) {
      const api = error instanceof ApiError ? error : new ApiError(0, "network", String(error));
      if (api.fields) {
        for (const [field, code] of Object.entries(api.fields)) {
          if (field === "name" || field === "email" || field === "message") setError(field, { message: code });
        }
      }
      setOutcome({ kind: "error", status: api.status, code: api.code, retryAfter: api.retryAfter, data });
    }
  };

  const errorText = (code?: string) => (code ? t(`contact.errors.${code}`, { defaultValue: code }) : undefined);

  const mailto = (data: ContactMessage) =>
    `mailto:${profile.email}?subject=${encodeURIComponent(`Portfólio · ${data.name}`)}&body=${encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`)}`;

  return (
    <div className={styles.composer}>
      <div className={`mono ${styles.requestLine}`}>
        <span>
          <span className={styles.method}>POST</span> /api/contact <span className={styles.proto}>HTTP/1.1</span>
        </span>
        <span className={styles.ct}>application/json</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate aria-describedby="form-hint">
        <p id="form-hint" className={`mono ${styles.hint}`}>
          {t("contact.formHint")}
        </p>

        <div className={styles.field}>
          <label htmlFor="name" className={`mono ${styles.label}`}>
            <span className={styles.key}>"name"</span> {t("contact.name")}
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t("contact.namePh")}
            maxLength={CONTACT_LIMITS.name.max}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className={styles.error} role="alert">
              {errorText(errors.name.message)}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={`mono ${styles.label}`}>
            <span className={styles.key}>"email"</span> {t("contact.email")}
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t("contact.emailPh")}
            maxLength={CONTACT_LIMITS.email.max}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className={styles.error} role="alert">
              {errorText(errors.email.message)}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="message" className={`mono ${styles.label}`}>
            <span className={styles.key}>"message"</span> {t("contact.message")}
          </label>
          <textarea
            id="message"
            rows={6}
            placeholder={t("contact.messagePh")}
            maxLength={CONTACT_LIMITS.message.max}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`message-count${errors.message ? " message-error" : ""}`}
            {...register("message")}
          />
          <div className={styles.under}>
            {errors.message ? (
              <p id="message-error" className={styles.error} role="alert">
                {errorText(errors.message.message)}
              </p>
            ) : (
              <span />
            )}
            <span id="message-count" className={`mono ${styles.count} ${messageLength > CONTACT_LIMITS.message.max * 0.9 ? styles.countWarn : ""}`}>
              {messageLength}/{CONTACT_LIMITS.message.max}
            </span>
          </div>
        </div>

        {/* isca para robôs: escondida de pessoas e de leitores de tela */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor={HONEYPOT_FIELD}>Website</label>
          <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </div>

        <button type="submit" className={`btn btn--primary ${styles.submit}`} disabled={isSubmitting}>
          {isSubmitting ? t("contact.sending") : t("contact.send")}
          <FiSend aria-hidden="true" />
        </button>
      </form>

      <div className={styles.responseWrap} aria-live="polite">
        <AnimatePresence mode="wait">
          {isSubmitting && (
            <motion.div key="pending" className={`mono ${styles.response}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className={styles.spinner} aria-hidden="true" /> {t("contact.sending")}
            </motion.div>
          )}

          {!isSubmitting && outcome.kind === "success" && (
            <motion.div key="ok" className={`${styles.response} ${styles.ok}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="mono">
                HTTP/1.1 <strong>{outcome.status} Accepted</strong> · {outcome.ms}ms
              </p>
              <pre className={styles.json}>{JSON.stringify({ ok: true, ...(outcome.id ? { id: outcome.id } : {}) }, null, 2)}</pre>
              <p>{t("contact.success")}</p>
              <button type="button" className="btn" onClick={() => setOutcome({ kind: "idle" })}>
                <FiRotateCcw aria-hidden="true" /> {t("contact.sendAnother")}
              </button>
            </motion.div>
          )}

          {!isSubmitting && outcome.kind === "error" && (
            <motion.div key="err" className={`${styles.response} ${styles.err}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="mono">
                HTTP/1.1 <strong>{outcome.status || "ERR"}</strong> · {outcome.code}
              </p>
              <p>
                {outcome.code === "rate_limited"
                  ? t("contact.rateLimited", { seconds: outcome.retryAfter ?? 60 })
                  : outcome.code === "not_configured"
                    ? t("contact.notConfigured")
                    : outcome.code === "validation"
                      ? t("contact.errors.email_invalid")
                      : t("contact.fail")}
              </p>
              {outcome.code !== "validation" && outcome.code !== "rate_limited" && (
                <a className="btn" href={mailto(outcome.data)}>
                  <FiMail aria-hidden="true" /> {t("contact.openMail")}
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
