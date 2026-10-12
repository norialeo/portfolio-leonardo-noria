// Vercel Function: POST /api/ask — lógica em server/ask.ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAsk } from "../server/ask.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleAsk(req, res, process.env);
}
