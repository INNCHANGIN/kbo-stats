// Copies the canonical dataset (../players_data.json, written by sync_data.py)
// into public/ so Vite serves it as a static asset. Runs automatically before
// `npm run dev` and `npm run build` (see predev/prebuild scripts).
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, '..', 'players_data.json');
const destDir = resolve(__dirname, 'public');
const dest = resolve(destDir, 'players_data.json');

if (!existsSync(src)) {
  console.error(`[copy-data] source not found: ${src}`);
  console.error('[copy-data] run `python sync_data.py` (or force_sync.py) first.');
  process.exit(1);
}

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`[copy-data] copied players_data.json -> public/`);
