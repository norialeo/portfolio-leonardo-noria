import type { Lang } from "../data/types";

const MONTHS: Record<Lang, string[]> = {
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/** "2026-08" → "ago/2026" (pt) ou "Aug 2026" (en) */
export function formatMonth(yyyyMm: string, lang: Lang): string {
  const [year, month] = yyyyMm.split("-");
  if (!month) return year ?? yyyyMm;
  const name = MONTHS[lang][Number(month) - 1] ?? month;
  return lang === "pt" ? `${name}/${year}` : `${name} ${year}`;
}

/** "2026-03-12" → "12 mar 2026" / "Mar 12, 2026" */
export function formatDate(iso: string, lang: Lang): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  const name = MONTHS[lang][Number(month) - 1] ?? month;
  return lang === "pt" ? `${Number(day)} ${name} ${year}` : `${name} ${Number(day)}, ${year}`;
}

/** Tempo relativo curto: "há 3 dias" / "3 days ago" */
export function timeAgo(iso: string, lang: Lang, now = Date.now()): string {
  const rtf = new Intl.RelativeTimeFormat(lang === "pt" ? "pt-BR" : "en", { numeric: "auto" });
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, "second");
}

/** Hash curto e estável (estilo commit) a partir de um texto. */
export function shortHash(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return (h1 >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}
