// Mapa rota → handler, usado pelo vite.config.ts para servir /api/* no
// npm run dev e no npm run preview. Em produção, cada rota é um arquivo em api/.
import { ASK_PATH, handleAsk } from "./ask.js";
import { CONTACT_PATH, handleContact } from "./contact.js";
import { GITHUB_PATH, handleGitHub } from "./github.js";
import type { ApiHandler } from "./http.js";

export const routes: Record<string, ApiHandler> = {
  [CONTACT_PATH]: handleContact,
  [ASK_PATH]: handleAsk,
  [GITHUB_PATH]: handleGitHub,
};
