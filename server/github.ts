// GET /api/github
//
// Junta perfil, repositórios e atividade pública do GitHub numa resposta só,
// já enxuta para o front-end. Fica no servidor por três motivos:
//   • o GITHUB_TOKEN (opcional) nunca vai para o navegador;
//   • a CDN da Vercel guarda a resposta (s-maxage), então milhares de visitas
//     viram poucas chamadas à API do GitHub (limite de 60/h sem token);
//   • o front-end recebe só os campos que usa.
//
// Variáveis de ambiente:
//   GITHUB_USER  → opcional, padrão "norialeo"
//   GITHUB_TOKEN → opcional, token de leitura (sobe o limite para 5000/h)

import type { ServerResponse } from "node:http";
import { allowMethods, sendError, sendJson, type ApiRequest, type Env } from "./http.js";

export const GITHUB_PATH = "/api/github";

const API = "https://api.github.com";
const DEFAULT_USER = "norialeo";
const MEMORY_TTL_MS = 10 * 60_000;
const CDN_CACHE = "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400";

export type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  size: number;
  url: string;
  createdAt: string;
  pushedAt: string;
};

export type GitHubEvent = {
  id: string;
  type: string;
  repo: string;
  action: string;
  ref: string | null;
  sha: string | null;
  createdAt: string;
};

export type GitHubSnapshot = {
  fetchedAt: string;
  profile: {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    location: string | null;
    followers: number;
    following: number;
    publicRepos: number;
    createdAt: string;
    url: string;
  };
  repos: GitHubRepo[];
  languages: { name: string; repos: number; share: number }[];
  events: GitHubEvent[];
};

// Formato cru da API do GitHub (só lemos alguns campos)
type Raw = Record<string, any>;

const EVENT_ACTIONS: Record<string, (p: Raw) => string> = {
  PushEvent: () => "push",
  CreateEvent: (p) => `create ${p.ref_type ?? ""}`.trim(),
  DeleteEvent: (p) => `delete ${p.ref_type ?? ""}`.trim(),
  PullRequestEvent: (p) => `pull_request ${p.action ?? ""}`.trim(),
  IssuesEvent: (p) => `issue ${p.action ?? ""}`.trim(),
  WatchEvent: () => "star",
  ForkEvent: () => "fork",
  PublicEvent: () => "publish",
  MemberEvent: (p) => `member ${p.action ?? ""}`.trim(),
  ReleaseEvent: (p) => `release ${p.action ?? ""}`.trim(),
};

export function toSnapshot(user: Raw, repos: Raw[], events: Raw[]): GitHubSnapshot {
  const own = repos
    .filter((r) => !r.fork)
    .map<GitHubRepo>((r) => ({
      name: r.name,
      description: r.description ?? null,
      language: r.language ?? null,
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      size: r.size ?? 0,
      url: r.html_url,
      createdAt: r.created_at,
      pushedAt: r.pushed_at,
    }))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));

  // Linguagem principal de cada repositório, ponderada pelo tamanho (KB)
  const weights = new Map<string, { repos: number; size: number }>();
  for (const repo of own) {
    if (!repo.language) continue;
    const entry = weights.get(repo.language) ?? { repos: 0, size: 0 };
    entry.repos += 1;
    entry.size += Math.max(repo.size, 1);
    weights.set(repo.language, entry);
  }
  const total = [...weights.values()].reduce((sum, w) => sum + w.size, 0) || 1;
  const languages = [...weights.entries()]
    .map(([name, w]) => ({ name, repos: w.repos, share: w.size / total }))
    .sort((a, b) => b.share - a.share);

  const activity = events
    .filter((e) => e.type in EVENT_ACTIONS)
    .slice(0, 12)
    .map<GitHubEvent>((e) => {
      const payload: Raw = e.payload ?? {};
      const ref = typeof payload.ref === "string" ? payload.ref.replace(/^refs\/(heads|tags)\//, "") : null;
      return {
        id: String(e.id),
        type: e.type,
        repo: e.repo?.name ?? "",
        action: EVENT_ACTIONS[e.type]!(payload),
        ref,
        sha: typeof payload.head === "string" ? payload.head.slice(0, 7) : null,
        createdAt: e.created_at,
      };
    });

  return {
    fetchedAt: new Date().toISOString(),
    profile: {
      login: user.login,
      name: user.name ?? null,
      avatarUrl: user.avatar_url,
      bio: user.bio ?? null,
      location: user.location ?? null,
      followers: user.followers ?? 0,
      following: user.following ?? 0,
      publicRepos: user.public_repos ?? own.length,
      createdAt: user.created_at,
      url: user.html_url,
    },
    repos: own,
    languages,
    events: activity,
  };
}

let cache: { key: string; at: number; data: GitHubSnapshot } | null = null;

async function getJson(path: string, token?: string): Promise<Raw> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "leonardo-noria-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    const error = new Error(`GitHub ${response.status} em ${path}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<Raw>;
}

export async function handleGitHub(req: ApiRequest, res: ServerResponse, env: Env): Promise<void> {
  if (!allowMethods(req, res, ["GET", "HEAD"])) return;

  const user = env.GITHUB_USER?.trim() || DEFAULT_USER;
  const token = env.GITHUB_TOKEN?.trim() || undefined;

  if (cache && cache.key === user && Date.now() - cache.at < MEMORY_TTL_MS) {
    return sendJson(res, 200, cache.data, { "Cache-Control": CDN_CACHE, "X-Cache": "HIT" });
  }

  try {
    const [profile, repos, events] = await Promise.all([
      getJson(`/users/${user}`, token),
      getJson(`/users/${user}/repos?per_page=100&sort=pushed`, token),
      getJson(`/users/${user}/events/public?per_page=40`, token).catch(() => []),
    ]);
    const data = toSnapshot(profile, repos as unknown as Raw[], events as unknown as Raw[]);
    cache = { key: user, at: Date.now(), data };
    return sendJson(res, 200, data, { "Cache-Control": CDN_CACHE, "X-Cache": "MISS" });
  } catch (error) {
    const status = (error as { status?: number }).status;
    console.error("GitHub:", error instanceof Error ? error.message : error);
    // Se a API falhar mas houver cópia antiga, entrega a cópia antiga.
    if (cache && cache.key === user) {
      return sendJson(res, 200, cache.data, { "Cache-Control": "no-store", "X-Cache": "STALE" });
    }
    if (status === 403 || status === 429) {
      return sendError(res, 503, "rate_limited", "Limite da API do GitHub atingido. Tente mais tarde.", 300);
    }
    return sendError(res, 502, "upstream_error", "Não foi possível falar com o GitHub agora.");
  }
}
