// Vercel Function: GET /api/github — lógica em server/github.ts
import type { IncomingMessage, ServerResponse } from "node:http";
import { handleGitHub } from "../server/github.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleGitHub(req, res, process.env);
}
