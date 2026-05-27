import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "dist");
const entries = [
  "index.html",
  "src",
  "assets",
  "presaves",
  "characters",
  "episodes",
  "dialogues",
  "scenes",
  "music",
  "ui",
  "systems",
  "save",
  "routes"
];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of entries) {
  const from = path.join(root, entry);
  if (!existsSync(from)) continue;
  await cp(from, path.join(out, entry), { recursive: true });
}

console.log(`Build estático gerado em ${out}`);
