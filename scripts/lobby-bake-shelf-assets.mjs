#!/usr/bin/env node
/**
 * Download lobby shelf green-screen JPEGs and write chroma-keyed PNGs.
 * Uses scripts/lobby-chroma-key.py (acrylic unspill + green haze removal).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SHELVES = [
  {
    name: 'hd',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/5Cof6W3Y0p6Eyq8ew7Sil_dzSVHBRK.jpeg',
    out: 'hd-group.png',
  },
  {
    name: 'transparent',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7h5bbuiitNAnalQhkOszS_pP56MlDZ.jpeg',
    out: 'transparent-group.png',
  },
  {
    name: 'custom',
    remote:
      'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7iUsTnn1PQRK9Io3291KW_pHVg5Q26.jpeg',
    out: 'custom-group.png',
  },
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpDir = path.join(root, 'tmp/shelf-src');
const assetsDir = path.join(root, 'public/assets');
const chromaKey = path.join(root, 'scripts/lobby-chroma-key.py');

mkdirSync(tmpDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

const onlyName = process.argv[2];
const remoteOverride = process.argv[3];
const targets = onlyName ? SHELVES.filter((s) => s.name === onlyName) : SHELVES;
if (onlyName && targets.length === 0) {
  console.error(`Unknown shelf "${onlyName}". Use: hd | transparent | custom`);
  process.exit(1);
}

for (const shelf of targets) {
  const tmpSrc = path.join(tmpDir, `${shelf.name}.jpeg`);
  const outPath = path.join(assetsDir, shelf.out);
  const remote = remoteOverride?.startsWith('http') ? remoteOverride : shelf.remote;
  console.log('Fetching', shelf.name, '…');
  execFileSync('curl', ['-fsSL', '-o', tmpSrc, remote], { stdio: 'inherit' });
  execFileSync('python3', [chromaKey, tmpSrc, outPath, '800', '--shelf'], { stdio: 'inherit', cwd: root });
  console.log('Wrote', outPath);
}

console.log(
  'Bump LOBBY_SHELF_ASSET_VERSION in src/constants/lobbySceneAssets.ts after deploy (Vercel caches /assets/*).'
);
