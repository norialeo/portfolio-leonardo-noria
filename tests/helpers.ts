import type { ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { ApiRequest } from "../server/http";

/** Requisição falsa no formato que os handlers esperam (Node puro). */
export function mockRequest(options: { method?: string; body?: unknown; ip?: string; headers?: Record<string, string> } = {}): ApiRequest {
  const raw = options.body === undefined ? "" : typeof options.body === "string" ? options.body : JSON.stringify(options.body);
  const stream = Readable.from(raw ? [Buffer.from(raw)] : []);
  return Object.assign(stream, {
    method: options.method ?? "POST",
    headers: { "x-forwarded-for": options.ip ?? "203.0.113.10", ...options.headers },
    socket: { remoteAddress: options.ip ?? "203.0.113.10" },
  }) as unknown as ApiRequest;
}

export type MockResponse = ServerResponse & { body: string; json: () => any; headersSet: Record<string, string> };

/** Resposta falsa que guarda status, cabeçalhos e corpo. */
export function mockResponse(): MockResponse {
  const res = {
    statusCode: 200,
    headersSent: false,
    body: "",
    headersSet: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headersSet[name.toLowerCase()] = String(value);
    },
    write(chunk: string) {
      this.headersSent = true;
      this.body += chunk;
    },
    end(chunk?: string) {
      this.headersSent = true;
      if (chunk) this.body += chunk;
    },
    on() {
      return this;
    },
    json() {
      return JSON.parse(this.body);
    },
  };
  return res as unknown as MockResponse;
}
