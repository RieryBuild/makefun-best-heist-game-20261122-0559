// main.ts — THE GILDED HOUR, a make.fun best-heist-game entry.
//
// The game itself is plain static files under game/ (a vanilla Canvas 2D
// heist game: game/index.html plus its ES modules, no library, no network
// request). This program is the hand-in: it copies game/ and screenshots/
// from this repository into the grader's output directory and writes
// /output/dossier.json, the summary the judge reads, using the vendored
// make.fun library (vendor/makefun-game.ts, the kit's copy, unchanged).
// It uses only the Node 22 standard library, writes the same bytes on
// every run, and never touches /output itself or anything outside it.
//
// Run it locally (outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the game itself with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader gives us a writable /output; anywhere else, the caller may
// point MAKEFUN_OUTPUT_DIR at a scratch directory instead.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

// Start from a clean output directory (its contents only — never the
// directory itself, which the grader owns), then lay the entry out.
mkdirSync(outputDir, { recursive: true });
for (const entry of ['game', 'screenshots', 'dossier.json']) {
  const target = join(outputDir, entry);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}

copyTree(join(repoRoot, 'game'), join(outputDir, 'game'));
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
}

// The scorer's own caps, from the kit's gate: the dossier text is capped,
// and the other caps refuse exactly what the scorer would refuse — more
// than 4 screenshots or one over 256 KiB, more than 993 files in game/ or
// 48 MiB of game files in all, or a path under game/ over 1000 bytes.
// game/ counts beside /output's own 1000-entry cap, its screenshots/ and
// dossier.json, so the caps leave them room.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
