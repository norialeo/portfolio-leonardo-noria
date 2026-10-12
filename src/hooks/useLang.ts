import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { L10n, Lang } from "../data/types";

/** Idioma atual + helper para escolher a versão certa de um texto { pt, en }. */
export function useLang() {
  const { t, i18n } = useTranslation();
  const lang: Lang = (i18n.resolvedLanguage ?? i18n.language ?? "pt").startsWith("en") ? "en" : "pt";

  const tr = useCallback((text: L10n) => text[lang], [lang]);
  const setLang = useCallback((next: Lang) => void i18n.changeLanguage(next), [i18n]);
  const locale = lang === "en" ? "en-US" : "pt-BR";

  return { t, lang, tr, setLang, locale };
}
