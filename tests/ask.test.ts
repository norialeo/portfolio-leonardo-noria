import { afterEach, describe, expect, it, vi } from "vitest";
import { callGemini, modelsToTry } from "../server/ask";

const signal = new AbortController().signal;
const reply = (status: number) => new Response(status === 200 ? "data: {}\n\n" : "erro", { status });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("modelsToTry", () => {
  it("usa o modelo configurado primeiro e não repete modelos", () => {
    expect(modelsToTry("gemini-flash-latest")).toEqual(["gemini-flash-latest", "gemini-flash-lite-latest"]);
    expect(modelsToTry(undefined)[0]).toBe("gemini-3.5-flash-lite");
  });
});

describe("callGemini", () => {
  it("tenta de novo quando o modelo está sobrecarregado (503)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValueOnce(reply(503)).mockResolvedValueOnce(reply(200));
    vi.stubGlobal("fetch", fetchMock);
    const res = await callGemini(["a", "b"], "key", "{}", signal);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]![0]).toContain("/a:");
  });

  it("passa para o próximo modelo se o primeiro continuar falhando", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValueOnce(reply(503)).mockResolvedValueOnce(reply(500)).mockResolvedValueOnce(reply(200));
    vi.stubGlobal("fetch", fetchMock);
    const res = await callGemini(["a", "b"], "key", "{}", signal);
    expect(res.status).toBe(200);
    expect(fetchMock.mock.calls[2]![0]).toContain("/b:");
  });

  it("não troca de modelo em erro de cota ou chave", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(429));
    vi.stubGlobal("fetch", fetchMock);
    const res = await callGemini(["a", "b"], "key", "{}", signal);
    expect(res.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("devolve o 503 (e não o 404 do modelo reserva) quando tudo falha", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValueOnce(reply(503)).mockResolvedValueOnce(reply(503)).mockResolvedValueOnce(reply(404));
    vi.stubGlobal("fetch", fetchMock);
    const res = await callGemini(["a", "b"], "key", "{}", signal);
    expect(res.status).toBe(503);
  });
});
