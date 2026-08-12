#!/usr/bin/env node
/**
 * Extract first + last frames from an approved Slay Forecast resting clip.
 * Preserves exact dimensions — no crop, no scale.
 *
 * Usage:
 *   node scripts/slay-forecast/extract-continuity-frames.mjs --input resting.mp4 --out-dir ./out
 *
 * Env (optional upload):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STORAGE_BUCKET=live-preview
 *   VERSION_SLUG=continuity-v1
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { input: '', outDir: join(__dirname, '.work', 'frames'), upload: false, versionSlug: 'continuity-v1' };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--input') args.input = argv[++i];
    else if (argv[i] === '--out-dir') args.outDir = argv[++i];
    else if (argv[i] === '--upload') args.upload = true;
    else if (argv[i] === '--version-slug') args.versionSlug = argv[++i];
  }
  return args;
}

function ffmpegAvailable() {
  return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
}

function probeDurationSec(videoPath) {
  const r = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', videoPath],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) return 3;
  const n = parseFloat(String(r.stdout).trim());
  return Number.isFinite(n) && n > 0 ? n : 3;
}

function extractFrame(videoPath, outPng, atSeconds) {
  const args =
    atSeconds > 0
      ? ['-y', '-ss', String(atSeconds), '-i', videoPath, '-frames:v', '1', '-q:v', '1', outPng]
      : ['-y', '-i', videoPath, '-frames:v', '1', '-q:v', '1', outPng];
  const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
  if (r.status !== 0 || !existsSync(outPng)) {
    throw new Error(`ffmpeg failed extracting frame at ${atSeconds}s`);
  }
}

async function maybeUpload(outDir, versionSlug) {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.log('Skipping upload — SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
    return null;
  }
  const bucket = process.env.STORAGE_BUCKET?.trim() || 'live-preview';
  const supabase = createClient(url, key);
  const first = readFileSync(join(outDir, 'resting-first.png'));
  const last = readFileSync(join(outDir, 'resting-last.png'));
  const prefix = `slay-forecast/continuity/${versionSlug}`;
  const up = async (name, buf) => {
    const path = `${prefix}/${name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, buf, {
      upsert: true,
      contentType: 'image/png',
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };
  return {
    restingFirstFrameUrl: await up('resting-first.png', first),
    restingLastFrameUrl: await up('resting-last.png', last),
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.input) {
    console.error('Usage: node scripts/slay-forecast/extract-continuity-frames.mjs --input resting.mp4');
    process.exit(1);
  }
  if (!ffmpegAvailable()) {
    console.error('ffmpeg is required on PATH');
    process.exit(1);
  }
  mkdirSync(args.outDir, { recursive: true });
  const duration = probeDurationSec(args.input);
  const lastAt = Math.max(0, duration - 0.04);
  const firstOut = join(args.outDir, 'resting-first.png');
  const lastOut = join(args.outDir, 'resting-last.png');
  extractFrame(args.input, firstOut, 0);
  extractFrame(args.input, lastOut, lastAt);
  console.log(`Extracted first frame → ${firstOut}`);
  console.log(`Extracted last frame (${lastAt.toFixed(3)}s) → ${lastOut}`);

  if (args.upload) {
    const urls = await maybeUpload(args.outDir, args.versionSlug);
    if (urls) console.log(JSON.stringify(urls, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
