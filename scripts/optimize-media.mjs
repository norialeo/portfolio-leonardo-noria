// Converte imagens e GIFs de public/ para WebP otimizado.
//
//   npm run media                 → converte tudo que ainda não foi convertido
//   npm run media -- --force      → reconverte tudo
//
// Fluxo para trocar a prévia de um projeto por uma gravação real:
//   1. grave o projeto rodando (ScreenToGif, OBS…) e salve como .gif ou .png
//      em public/projects/<slug>/
//   2. rode `npm run media` — o arquivo vira .webp (GIF vira WebP animado)
//      e o original é apagado
//   3. aponte o caminho .webp em src/data/projects.ts

import { readdir, stat, unlink } from "node:fs/promises";
import { extname, join } from "node:path";
import sharp from "sharp";

const ROOTS = ["public/projects", "public/images"];
const INPUT = new Set([".png", ".jpg", ".jpeg", ".gif"]);
const MAX_WIDTH = 1600;
const force = process.argv.includes("--force");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const ext = extname(file).toLowerCase();
    if (!INPUT.has(ext)) continue;

    const out = file.slice(0, -ext.length) + ".webp";
    const exists = await stat(out).catch(() => null);
    if (exists && !force) continue;

    const animated = ext === ".gif";
    const before = (await stat(file)).size;

    await sharp(file, { animated })
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: animated ? 70 : 82, effort: 6 })
      .toFile(out);

    const after = (await stat(out)).size;
    await unlink(file);
    console.log(`${file} → ${out}  (${kb(before)} → ${kb(after)})`);
  }
}
