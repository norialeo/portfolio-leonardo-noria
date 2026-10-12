// POST /api/contact  { name, email, message, website? }
//
// Valida a mensagem (mesmas regras do front-end, em shared/contact.ts) e envia
// por e-mail usando a API HTTP do Resend (https://resend.com), sem SDK.
//
// Variáveis de ambiente (secretas, SEM prefixo VITE_):
//   RESEND_API_KEY    → chave da API do Resend (obrigatória para enviar)
//   CONTACT_TO_EMAIL  → quem recebe (padrão: e-mail do Leonardo)
//   CONTACT_FROM      → remetente (padrão: "Portfólio <onboarding@resend.dev>",
//                       que funciona sem domínio próprio)
//
// Sem RESEND_API_KEY a rota responde 503 "not_configured" e o front-end
// oferece abrir o app de e-mail do visitante com a mensagem já preenchida.

import type { ServerResponse } from "node:http";
import { contactSchema, HONEYPOT_FIELD, type ContactMessage } from "../shared/contact.js";
import {
  allowMethods,
  BodyError,
  clientIp,
  createRateLimiter,
  readJson,
  sendError,
  sendJson,
  type ApiRequest,
  type Env,
} from "./http.js";

export const CONTACT_PATH = "/api/contact";

const DEFAULT_TO = "leonoria09@gmail.com";
const DEFAULT_FROM = "Portfólio Leonardo Noria <onboarding@resend.dev>";
const RESEND_URL = "https://api.resend.com/emails";
const TIMEOUT_MS = 10_000;

const limit = createRateLimiter([
  { windowMs: 60_000, max: 3 }, // 3 mensagens por minuto
  { windowMs: 24 * 60 * 60_000, max: 10 }, // 10 por dia
]);

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function buildEmail(msg: ContactMessage, meta: { ip: string }) {
  const subject = `Portfólio · nova mensagem de ${msg.name}`;
  const text = [
    `Nome: ${msg.name}`,
    `E-mail: ${msg.email}`,
    "",
    msg.message,
    "",
    "—",
    `Enviado pelo formulário do portfólio · IP ${meta.ip}`,
  ].join("\n");

  const html = `
  <div style="font-family:ui-monospace,Menlo,Consolas,monospace;background:#0b0d0c;color:#e9ede7;padding:24px">
    <p style="margin:0 0 4px;color:#c8ff3d;font-size:12px;letter-spacing:.12em">POST /api/contact · 202 ACCEPTED</p>
    <h1 style="margin:0 0 20px;font-size:20px">Nova mensagem do portfólio</h1>
    <table style="font-size:14px;border-collapse:collapse">
      <tr><td style="color:#a3ada6;padding:2px 16px 2px 0">nome</td><td>${escapeHtml(msg.name)}</td></tr>
      <tr><td style="color:#a3ada6;padding:2px 16px 2px 0">e-mail</td><td><a style="color:#c8ff3d" href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a></td></tr>
    </table>
    <pre style="white-space:pre-wrap;font:inherit;font-size:15px;line-height:1.6;margin:20px 0;padding:16px;border:1px solid #2f3733">${escapeHtml(msg.message)}</pre>
    <p style="color:#6b756f;font-size:12px;margin:0">Responda este e-mail para falar direto com ${escapeHtml(msg.name)}. · IP ${escapeHtml(meta.ip)}</p>
  </div>`;

  return { subject, text, html };
}

export async function handleContact(req: ApiRequest, res: ServerResponse, env: Env): Promise<void> {
  if (!allowMethods(req, res, ["POST"])) return;

  let body: unknown;
  try {
    body = await readJson(req);
  } catch (error) {
    const tooLarge = error instanceof BodyError && error.code === "too_large";
    return sendError(res, tooLarge ? 413 : 400, "bad_request", tooLarge ? "Mensagem grande demais." : "JSON inválido.");
  }

  // Robô caiu na isca: responde como se tivesse dado certo e não envia nada.
  const record = (body ?? {}) as Record<string, unknown>;
  if (typeof record[HONEYPOT_FIELD] === "string" && record[HONEYPOT_FIELD].trim() !== "") {
    return sendJson(res, 202, { ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fields[field] ??= issue.message;
    }
    return sendJson(res, 422, { error: "validation", message: "Confira os campos.", fields });
  }

  const ip = clientIp(req);
  const wait = limit(ip);
  if (wait > 0) {
    return sendError(res, 429, "rate_limited", "Muitas mensagens seguidas. Tente de novo em instantes.", wait);
  }

  const key = env.RESEND_API_KEY?.trim();
  if (!key) {
    return sendError(res, 503, "not_configured", "Envio de e-mail não configurado (RESEND_API_KEY).");
  }

  const email = buildEmail(parsed.data, { ip });

  try {
    const upstream = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM?.trim() || DEFAULT_FROM,
        to: [env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO],
        reply_to: parsed.data.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      console.error("Resend:", upstream.status, detail.slice(0, 300));
      return sendError(res, 502, "upstream_error", "O serviço de e-mail recusou o envio.");
    }

    const { id } = (await upstream.json().catch(() => ({}))) as { id?: string };
    return sendJson(res, 202, { ok: true, id });
  } catch (error) {
    console.error("Resend:", error instanceof Error ? error.message : error);
    return sendError(res, 504, "timeout", "O serviço de e-mail não respondeu a tempo.");
  }
}
