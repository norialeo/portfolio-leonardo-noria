import { describe, expect, it } from "vitest";
import { toSnapshot } from "../server/github";
import { createRateLimiter } from "../server/http";

const user = { login: "norialeo", name: "Leonardo Noria", avatar_url: "a", followers: 3, following: 1, public_repos: 3, created_at: "2026-02-05T00:00:00Z", html_url: "https://github.com/norialeo" };

const repo = (name: string, language: string | null, size: number, pushed: string, fork = false) => ({
  name,
  description: null,
  language,
  size,
  fork,
  stargazers_count: 1,
  forks_count: 0,
  html_url: `https://github.com/norialeo/${name}`,
  created_at: pushed,
  pushed_at: pushed,
});

describe("toSnapshot", () => {
  const snapshot = toSnapshot(
    user,
    [
      repo("a", "Python", 300, "2026-03-01T00:00:00Z"),
      repo("b", "Java", 100, "2026-09-01T00:00:00Z"),
      repo("c", "Python", 100, "2026-05-01T00:00:00Z"),
      repo("fork", "Go", 9999, "2026-10-01T00:00:00Z", true),
    ],
    [
      { id: 1, type: "PushEvent", repo: { name: "norialeo/b" }, payload: { ref: "refs/heads/main", head: "9c701f2238df" }, created_at: "2026-09-29T00:00:00Z" },
      { id: 2, type: "GollumEvent", repo: { name: "norialeo/b" }, payload: {}, created_at: "2026-09-28T00:00:00Z" },
    ],
  );

  it("ignora forks e ordena pelo push mais recente", () => {
    expect(snapshot.repos.map((r) => r.name)).toEqual(["b", "c", "a"]);
  });

  it("calcula a participação de cada linguagem pelo tamanho", () => {
    expect(snapshot.languages[0]).toMatchObject({ name: "Python", repos: 2 });
    expect(snapshot.languages[0]!.share).toBeCloseTo(0.8);
    expect(snapshot.languages[1]!.share).toBeCloseTo(0.2);
  });

  it("resume os eventos conhecidos (ref e sha curtos)", () => {
    expect(snapshot.events).toEqual([
      { id: "1", type: "PushEvent", repo: "norialeo/b", action: "push", ref: "main", sha: "9c701f2", createdAt: "2026-09-29T00:00:00Z" },
    ]);
  });
});

describe("createRateLimiter", () => {
  it("libera até o limite e depois pede para esperar", () => {
    const check = createRateLimiter([{ windowMs: 1000, max: 2 }]);
    expect(check("ip", 0)).toBe(0);
    expect(check("ip", 100)).toBe(0);
    expect(check("ip", 200)).toBe(1);
    expect(check("outro-ip", 200)).toBe(0);
    expect(check("ip", 1200)).toBe(0); // janela andou
  });
});
