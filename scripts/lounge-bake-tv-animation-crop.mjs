#!/usr/bin/env node
/**
 * Remove top/bottom letterbox from `public/assets/lounge-tv-animation.mov`.
 * Tune CROP_* then bump LOUNGE_TV_ANIMATION_VIDEO_VERSION in loungeTvAnimationVideo.ts.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const INPUT = path.join(ROOT, 'public/assets/lounge-tv-animation-source-letterbox.mov');
const OUTPUT = path.join(ROOT, 'public/assets/lounge-tv-animation.mov');

/** Pixels cropped from top/bottom of 720×1280 Seedance export. */
const CROP_TOP_PX = 128;
const CROP_HEIGHT_PX = 1024;

const source = fs.existsSync(INPUT) ? INPUT : OUTPUT;

if (!fs.existsSync(source)) {
  console.error('Missing lounge TV animation:', source);
  process.exit(1);
}

const crop = `crop=720:${CROP_HEIGHT_PX}:0:${CROP_TOP_PX}`;

execFileSync(
  'ffmpeg',
  ['-y', '-i', source, '-vf', crop, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', OUTPUT],
  { stdio: 'inherit' },
);

console.log('Wrote', OUTPUT, `(${crop})`);
