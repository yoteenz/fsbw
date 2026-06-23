#!/usr/bin/env node
/**
 * Build a reversed copy of the desktop tower elevator MP4 for downward-travel fallback.
 * Requires ffmpeg on PATH. Output: public/assets/desktop-tower-elevator-reverse.mp4
 *
 * Usage: node scripts/elevator-reverse-video.mjs
 * Then set DESKTOP_TOWER_ELEVATOR_VIDEO_REVERSE_URL in desktopTowerElevatorVideo.ts
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public', 'assets');
const outFile = join(outDir, 'desktop-tower-elevator-reverse.mp4');

const SOURCE_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/openart-d19d94364e879943ccc984d3098cb2ce-bb9476a9-210f-44a0-bbe1-a1804c5eeee8_1782168829542_3c9c8d0f.mp4';

const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
if (ffmpegCheck.status !== 0) {
  console.error('ffmpeg not found — install ffmpeg to generate the reversed elevator clip.');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const tmpInput = join(outDir, '.elevator-source-tmp.mp4');
if (!existsSync(tmpInput)) {
  console.log('Downloading source elevator video…');
  execFileSync('curl', ['-fsSL', SOURCE_URL, '-o', tmpInput], { stdio: 'inherit' });
}

console.log('Reversing elevator video →', outFile);
execFileSync(
  'ffmpeg',
  [
    '-y',
    '-i',
    tmpInput,
    '-vf',
    'reverse',
    '-af',
    'areverse',
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '18',
    '-c:a',
    'aac',
    outFile,
  ],
  { stdio: 'inherit' },
);

console.log(
  'Done. Set DESKTOP_TOWER_ELEVATOR_VIDEO_REVERSE_URL to /assets/desktop-tower-elevator-reverse.mp4',
);
