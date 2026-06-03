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
const OUTPUT_MOV = path.join(ROOT, 'public/assets/lounge-tv-animation.mov');
const OUTPUT_MP4 = path.join(ROOT, 'public/assets/lounge-tv-animation.mp4');

/** Pixels cropped from top/bottom of 720×1280 Seedance export (tune after QA). */
const CROP_TOP_PX = 200;
const CROP_HEIGHT_PX = 880;

const source = fs.existsSync(INPUT) ? INPUT : OUTPUT_MOV;

if (!fs.existsSync(source)) {
  console.error('Missing lounge TV animation:', source);
  process.exit(1);
}

const crop = `crop=720:${CROP_HEIGHT_PX}:0:${CROP_TOP_PX}`;

for (const output of [OUTPUT_MOV, OUTPUT_MP4]) {
  execFileSync(
    'ffmpeg',
    ['-y', '-i', source, '-vf', crop, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', output],
    { stdio: 'inherit' },
  );
  console.log('Wrote', output, `(${crop})`);
}
