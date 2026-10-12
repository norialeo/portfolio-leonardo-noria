import react from "@vitejs/plugin-react";
import type { Connect, Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";
import type { Env } from "./server/http.js";
import { routes } from "./server/routes.js";

// No npm run dev e no npm run preview, as rotas /api/* são atendidas por este
// middleware, com o MESMO código que roda nas Vercel Functions (pasta api/).
// Assim as chaves (RESEND_API_KEY, GEMINI_API_KEY…) ficam só no servidor.
function apiRoutes(env: Env): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const handler = routes[new URL(req.url ?? "/", "http://localhost").pathname];
    if (!handler) return next();
    handler(req, res, env).catch(next);
  };

  return {
    name: "portfolio-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  // Prefixo "" lê TODAS as variáveis do .env.local (inclusive as sem VITE_).
  // Isso não as expõe: para o navegador só vão as VITE_*.
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return {
    plugins: [react(), apiRoutes(env)],
    build: {
      rollupOptions: {
        output: {
          // bibliotecas em pacotes próprios: mudam pouco, ficam em cache no navegador
          manualChunks(id: string) {
            const path = id.replaceAll("\\", "/");
            if (/node_modules\/(react|react-dom|react-router|scheduler)\//.test(path)) return "react";
            if (/node_modules\/(motion|motion-dom|motion-utils|framer-motion)\//.test(path)) return "motion";
            if (/node_modules\/(i18next|react-i18next|i18next-browser-languagedetector)\//.test(path)) return "i18n";
            if (path.includes("node_modules/react-icons")) return "icons";
            return undefined;
          },
        },
      },
    },
  };
});
