// Vercel Function: POST /api/contact — lógica em server/contact.ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleContact } from "../server/contact.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleContact(req, res, process.env);
}
