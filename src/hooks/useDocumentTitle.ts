import { useEffect } from "react";
import { profile } from "../data/profile";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${profile.name}` : `${profile.name} — Desenvolvedor Full Stack & Mobile`;
  }, [title]);
}
