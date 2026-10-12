// Utilitários HTTP compartilhados pelas rotas de /api.
//
// Os handlers recebem (req, res) do Node puro, sem framework: assim o mesmo
// código roda nas Vercel Functions (produção) e no middleware do Vite
// (npm run dev / npm run preview). Veja vite.config.ts e api/*.ts.

import type { IncomingMessage, ServerResponse } from "node:http";

export type Env = Record<string, string | undefined>;

// Na Vercel, req.body já chega parseado; no Vite, não.
export type ApiRequest = IncomingMessage & { body?: unknown };
export type ApiHandler = (req: ApiRequest, res: ServerResponse, env: Env) => Promise<void>;

export function sendJson(
  res: ServerResponse,
  status: number,
  data: unknown,
  headers: Record<string, string> = {},
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (!headers["Cache-Control"]) res.setHeader("Cache-Control", "no-store");
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.end(JSON.stringify(data));
}

export function sendError(
  res: ServerResponse,
  status: number,
  error: string,
  message: string,
  retryAfter?: number,
): void {
  const headers: Record<string, string> = {};
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  sendJson(res, status, { error, message }, headers);
}

export function allowMethods(req: ApiRequest, res: ServerResponse, methods: string[]): boolean {
  if (methods.includes(req.method ?? "")) return true;
  res.setHeader("Allow", methods.join(", "));
  sendError(res, 405, "method_not_allowed", `Use ${methods.join(" ou ")}.`);
  return false;
}

export class BodyError extends Error {
  constructor(readonly code: "too_large" | "invalid_json") {
    super(code);
  }
}

export async function readJson(req: ApiRequest, maxBytes = 16 * 1024): Promise<unknown> {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;

  let raw = "";
  if (typeof req.body === "string") raw = req.body;
  else if (Buffer.isBuffer(req.body)) raw = req.body.toString("utf8");
  else {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > maxBytes) throw new BodyError("too_large");
    }
  }
  if (raw.length > maxBytes) throw new BodyError("too_large");

  try {
    return JSON.parse(raw || "{}");
  } catch {
    throw new BodyError("invalid_json");
  }
}

export function clientIp(req: ApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim();
  return first || req.socket?.remoteAddress || "unknown";
}

// Limite por visitante, guardado na memória da função. Em serverless cada
// instância tem a sua memória, então isto é um freio contra abuso, não uma
// garantia — o suficiente para um portfólio.
export function createRateLimiter(limits: { windowMs: number; max: number }[]) {
  const hits = new Map<string, number[]>();
  const longest = Math.max(...limits.map((l) => l.windowMs));

  // Registra a tentativa e devolve quantos segundos esperar (0 = liberado).
  return function check(key: string, now = Date.now()): number {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < longest);
    for (const { windowMs, max } of limits) {
      const inWindow = recent.filter((t) => now - t < windowMs);
      if (inWindow.length >= max) {
        hits.set(key, recent);
        return Math.max(1, Math.ceil((inWindow[0]! + windowMs - now) / 1000));
      }
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // não deixa a memória crescer sem limite
    return 0;
  };
}
