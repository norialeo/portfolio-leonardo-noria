import { afterEach, describe, expect, it, vi } from "vitest";
import { handleContact } from "../server/contact";
import { contactSchema } from "../shared/contact";
import { mockRequest, mockResponse } from "./helpers";

const valid = { name: "  Ana Clara ", email: " ana@example.com ", message: "Olá! Vi seu portfólio e quero conversar." };

// Cada teste usa um IP diferente para não esbarrar no limite por visitante.
let ipCounter = 0;
const nextIp = () => `198.51.100.${++ipCounter}`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("contactSchema (compartilhado entre navegador e servidor)", () => {
  it("aceita uma mensagem válida e remove espaços das pontas", () => {
    const parsed = contactSchema.parse(valid);
    expect(parsed.name).toBe("Ana Clara");
    expect(parsed.email).toBe("ana@example.com");
  });

  it("devolve códigos de erro traduzíveis", () => {
    const result = contactSchema.safeParse({ name: "A", email: "nao-é-email", message: "curta" });
    expect(result.success).toBe(false);
    const codes = Object.fromEntries(result.error!.issues.map((i) => [i.path[0], i.message]));
    expect(codes).toEqual({ name: "name_min", email: "email_invalid", message: "message_min" });
  });

  it("recusa mensagem acima do limite", () => {
    const result = contactSchema.safeParse({ ...valid, message: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe("POST /api/contact", () => {
  it("recusa métodos diferentes de POST", async () => {
    const res = mockResponse();
    await handleContact(mockRequest({ method: "GET", ip: nextIp() }), res, {});
    expect(res.statusCode).toBe(405);
    expect(res.headersSet.allow).toBe("POST");
  });

  it("finge sucesso quando um robô preenche a isca, sem enviar e-mail", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = mockResponse();
    await handleContact(mockRequest({ body: { ...valid, website: "http://spam.example" }, ip: nextIp() }), res, { RESEND_API_KEY: "re_test" });
    expect(res.statusCode).toBe(202);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("responde 422 com os campos inválidos", async () => {
    const res = mockResponse();
    await handleContact(mockRequest({ body: { name: "", email: "x", message: "" }, ip: nextIp() }), res, {});
    expect(res.statusCode).toBe(422);
    expect(res.json().fields).toMatchObject({ name: "name_min", email: "email_invalid", message: "message_min" });
  });

  it("responde 400 para JSON quebrado", async () => {
    const res = mockResponse();
    await handleContact(mockRequest({ body: "{ não é json", ip: nextIp() }), res, {});
    expect(res.statusCode).toBe(400);
  });

  it("avisa 503 not_configured quando falta a RESEND_API_KEY", async () => {
    const res = mockResponse();
    await handleContact(mockRequest({ body: valid, ip: nextIp() }), res, {});
    expect(res.statusCode).toBe(503);
    expect(res.json().error).toBe("not_configured");
  });

  it("envia pelo Resend com reply_to do visitante", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = mockResponse();
    await handleContact(mockRequest({ body: valid, ip: nextIp() }), res, { RESEND_API_KEY: "re_test" });

    expect(res.statusCode).toBe(202);
    expect(res.json()).toEqual({ ok: true, id: "email_123" });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const payload = JSON.parse(init.body);
    expect(payload.to).toEqual(["leonoria09@gmail.com"]);
    expect(payload.reply_to).toBe("ana@example.com");
    expect(payload.subject).toContain("Ana Clara");
  });

  it("escapa HTML da mensagem no e-mail", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = mockResponse();
    const body = { ...valid, message: "<script>alert('x')</script> mensagem longa" };
    await handleContact(mockRequest({ body, ip: nextIp() }), res, { RESEND_API_KEY: "re_test" });
    const payload = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(payload.html).not.toContain("<script>");
    expect(payload.html).toContain("&#60;script&#62;");
  });

  it("devolve 502 se o Resend recusar", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 422 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = mockResponse();
    await handleContact(mockRequest({ body: valid, ip: nextIp() }), res, { RESEND_API_KEY: "re_test" });
    expect(res.statusCode).toBe(502);
  });

  it("limita a 3 mensagens por minuto por IP", async () => {
    const ip = nextIp();
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) {
      const res = mockResponse();
      await handleContact(mockRequest({ body: valid, ip }), res, {});
      statuses.push(res.statusCode);
    }
    // sem chave: as 3 primeiras chegam até o 503; a 4ª é barrada antes
    expect(statuses).toEqual([503, 503, 503, 429]);
  });
});
