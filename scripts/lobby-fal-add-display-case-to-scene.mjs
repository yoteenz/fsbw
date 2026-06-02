#!/usr/bin/env node
/**
 * Fal: add photoreal acrylic display case to a full lobby hero image (same slot as lobby page).
 *
 * Env:
 *   FAL_KEY — required
 *   LOBBY_SCENE_IMAGE — path to lobby composite JPEG/PNG (default: public/assets/landing-background.png)
 *   LOBBY_CASE_REF_IMAGE — path to case reference (default: public/assets/CASE.png)
 *   LOBBY_FAL_RESOLUTION — 2K (default) | 4K | 1K
 *   OUTPUT_PATH — default tmp/lobby-scene-with-display-case.png
 *
 * Usage:
 *   source .env.wig-preview 2>/dev/null || true
 *   LOBBY_SCENE_IMAGE=/path/to/your-lobby-composite.jpeg npm run lobby:fal-add-display-case
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const falKey = process.env.FAL_KEY || '';
const resolution = process.env.LOBBY_FAL_RESOLUTION || '2K';
const sceneArg = process.argv[2] || process.env.LOBBY_SCENE_IMAGE || '';
const caseArg = process.env.LOBBY_CASE_REF_IMAGE || '';
const defaultScene = join(repoRoot, 'public/assets/landing-background.png');
const defaultCase = join(repoRoot, 'public/assets/CASE.png');
const outputPath =
  process.env.OUTPUT_PATH || join(repoRoot, 'tmp/lobby-scene-with-display-case.png');

function resolvePath(p, fallback) {
  const s = (p || fallback || '').trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/') && existsSync(s)) return s;
  const rel = join(repoRoot, s.replace(/^\//, ''));
  return existsSync(rel) ? rel : s;
}

function mimeForPath(absPath) {
  const lower = String(absPath).toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

async function falUploadFile(absPath, mime) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const buf = readFileSync(absPath);
  const blob = new Blob([buf], { type: mime });
  const name = absPath.split(/[/\\]/).pop() || 'upload.png';
  const file = new File([blob], name, { type: mime });
  return fal.storage.upload(file);
}

async function falUploadUrl(url) {
  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  return fal.storage.upload(url);
}

async function resolveUploadUrl(pathOrUrl) {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return falUploadUrl(pathOrUrl);
  }
  return falUploadFile(pathOrUrl, mimeForPath(pathOrUrl));
}

async function downloadToFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  return dest;
}

async function main() {
  if (!falKey) {
    console.error('Missing FAL_KEY (set in .env.wig-preview or environment)');
    process.exit(1);
  }

  const scenePath = resolvePath(sceneArg, defaultScene);
  const casePath = resolvePath(caseArg, defaultCase);

  if (!scenePath.startsWith('http') && !existsSync(scenePath)) {
    console.error(`Scene image not found: ${scenePath}`);
    process.exit(1);
  }
  if (!casePath.startsWith('http') && !existsSync(casePath)) {
    console.error(`Case reference not found: ${casePath}`);
    process.exit(1);
  }

  const { LOBBY_DISPLAY_CASE_ON_SCENE_FAL_PROMPT } = await import('./lobby-fal-display-case-prompt.mjs');
  const prompt = LOBBY_DISPLAY_CASE_ON_SCENE_FAL_PROMPT;

  console.log('Uploading scene:', scenePath);
  console.log('Uploading case ref:', casePath);
  const sceneUrl = await resolveUploadUrl(scenePath);
  const caseUrl = await resolveUploadUrl(casePath);

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  console.log(`Calling fal-ai/nano-banana-pro/edit (${resolution})…`);
  const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt,
      image_urls: [sceneUrl, caseUrl],
      aspect_ratio: 'auto',
      resolution,
      output_format: 'png',
      num_images: 1,
    },
    logs: true,
  });

  const imageUrl = result?.data?.images?.[0]?.url;
  if (!imageUrl) {
    console.error('Unexpected fal response:', JSON.stringify(result?.data).slice(0, 800));
    process.exit(1);
  }

  await downloadToFile(imageUrl, outputPath);
  console.log('\nDone.');
  console.log('Fal output URL:', imageUrl);
  console.log('Saved:', outputPath);
  console.log('\nPrompt (first 500 chars):\n', prompt.slice(0, 500), '…');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
