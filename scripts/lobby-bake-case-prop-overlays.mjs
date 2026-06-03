#!/usr/bin/env node
/**
 * Download Final LP register/phone open overlays and chroma-key to transparent PNGs.
 * Requires: python3 + pillow + numpy (`scripts/lobby-chroma-key.py`).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FINAL_LP =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

const ASSETS = [
  {
    remote: `${FINAL_LP}/524y401iPlVoR0f6uT0OP_AvC0J19z%20(1).png`,
    out: 'final-lobby-register-open.png',
    maxW: 1400,
  },
  {
    remote: `${FINAL_LP}/8f5ce48Q8jlQ2BvEy5I-m_pkBqVvGQ-1.png`,
    out: 'final-lobby-phone-open.png',
    maxW: 1400,
  },
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const py = path.join(root, 'scripts', 'lobby-chroma-key.py');
const assetsDir = path.join(root, 'public', 'assets');
const tmpDir = path.join(root, 'tmp');

mkdirSync(tmpDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

for (const { remote, out, maxW } of ASSETS) {
  const src = path.join(tmpDir, out.replace('.png', '-src.png'));
  const keyed = path.join(tmpDir, out.replace('.png', '-keyed.png'));
  const dest = path.join(assetsDir, out);
  execFileSync('curl', ['-fsSL', '-o', src, remote], { stdio: 'inherit' });
  execFileSync('python3', [py, src, keyed, String(maxW)], { stdio: 'inherit', cwd: root });
  execFileSync('cp', [keyed, dest], { stdio: 'inherit' });
  console.log('Wrote', dest);
}

console.log(
  'Bump FINAL_LOBBY_*_OPEN_OVERLAY_VERSION and *_PX in src/constants/finalLobbyCasePropOverlays.ts after rebake.'
);
