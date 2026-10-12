export type Lang = "pt" | "en";

/** Texto nos dois idiomas do site. */
export type L10n = Record<Lang, string>;

export const LANGS: Lang[] = ["pt", "en"];
