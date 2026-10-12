// Cliente das rotas do back-end (/api/*).
import type { ContactInput } from "../../shared/contact";
import type { GitHubSnapshot } from "../../server/github";

export type { GitHubSnapshot };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
    readonly retryAfter?: number,
  ) {
    super(message);
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string; fields?: Record<string, string> };
  const retry = Number(response.headers.get("Retry-After")) || undefined;
  return new ApiError(response.status, body.error ?? "unknown", body.message ?? response.statusText, body.fields, retry);
}

/* ------------------------------- contato -------------------------------- */

export type ContactResult = { ok: true; id?: string; ms: number; status: number };

export async function sendContact(input: ContactInput & { website?: string }): Promise<ContactResult> {
  const started = performance.now();
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw await toApiError(response);
  const data = (await response.json()) as { id?: string };
  return { ok: true, id: data.id, ms: Math.round(performance.now() - started), status: response.status };
}

/* ------------------------------- GitHub --------------------------------- */

let githubRequest: Promise<GitHubSnapshot> | null = null;

/** Uma chamada por visita, compartilhada por todos os componentes. */
export function fetchGitHub(): Promise<GitHubSnapshot> {
  githubRequest ??= fetch("/api/github")
    .then(async (response) => {
      if (!response.ok) throw await toApiError(response);
      return (await response.json()) as GitHubSnapshot;
    })
    .catch((error: unknown) => {
      githubRequest = null; // permite tentar de novo depois
      throw error;
    });
  return githubRequest;
}

/* --------------------------------- IA ----------------------------------- */

export type ChatTurn = { role: "user" | "model"; text: string };

/** Pergunta à IA e entrega a resposta em pedaços (streaming). */
export async function askAI(
  message: string,
  history: ChatTurn[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });
  if (!response.ok || !response.body) throw await toApiError(response);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(chunk);
  }
  return full;
}
