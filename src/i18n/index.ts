import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import type { Lang } from "../data/types";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

export const LANG_STORAGE_KEY = "noria.lang";

// Textos da interface ficam nos JSON de locales/. Conteúdo longo (projetos,
// experiências, sobre) fica em src/data/ já com as versões { pt, en }.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { pt: { translation: pt }, en: { translation: en } },
    fallbackLng: "pt",
    supportedLngs: ["pt", "en"],
    nonExplicitSupportedLngs: true, // "pt-BR" → "pt", "en-US" → "en"
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      lookupQuerystring: "lang",
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ["localStorage"],
    },
    returnNull: false,
  });

const syncHtml = (lng: string) => {
  const lang: Lang = lng.startsWith("en") ? "en" : "pt";
  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
};
syncHtml(i18n.resolvedLanguage ?? "pt");
i18n.on("languageChanged", syncHtml);

export default i18n;
