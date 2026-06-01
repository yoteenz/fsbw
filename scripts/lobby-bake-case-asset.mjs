#!/usr/bin/env node
/**
 * Bake lobby display-case PNG from green-screen JPEG (preserves acrylic edges/reflections).
 * Uses scripts/lobby-chroma-key.py (acrylic unspill + green haze removal).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REMOTE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/LP%20Images/7mfZBdMQEOXkht8MamYaG_DIB2ZDCl.jpeg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmpSrc = path.join(root, 'tmp/lobby-case-src.jpeg');
const outPath = path.join(root, 'public/assets/CASE.png');
const chromaKey = path.join(root, 'scripts/lobby-chroma-key.py');
const remote = process.argv[2] || REMOTE;

mkdirSync(path.dirname(tmpSrc), { recursive: true });
execFileSync('curl', ['-fsSL', '-o', tmpSrc, remote], { stdio: 'inherit' });
execFileSync('python3', [chromaKey, tmpSrc, outPath, '920'], { stdio: 'inherit', cwd: root });
console.log('Wrote', outPath);
console.log('Bump LOBBY_CASE_ASSET_VERSION in src/constants/lobbyCaseAssets.ts after deploy.');
