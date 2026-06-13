import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import {
  photoPostProcessLayoutOverrides,
  resolveClientImageSlotOrDefault,
  resolveClientPhotoFadeSlotOrDefault,
  resolveRatingSlot,
  resolveTopScoreSlot,
} from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';
import { applyClientPhotoMirrorReflection } from './hairstyleAnalysisClientPhotoReflection.js';
import { matchRatingFilledStarsFromScore } from './hairstyleAnalysisDisplay.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  expandPixelRect,
  HAIRSTYLE_ANALYSIS_CANVAS,
  matchRatingStarRects,
  type PixelRect,
} from './hairstyleAnalysisLayoutSlots.js';
import {
  buildTextPathsSvg,
  matchRatingFalStarSize,
  overallScorePathItems,
} from './hairstyleAnalysisTextPaths.js';

const BRAND_RED = '#EB1C24';
const STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
const STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function readBundledStarPng(fileName: string): Buffer | null {
  try {
    return readFileSync(join(REPO_ROOT, 'public/assets/NOIR', fileName));
  } catch {
    return null;
  }
}

const BUNDLED_STAR_EMPTY = readBundledStarPng('star-symbol.png');
const BUNDLED_STAR_FILLED = readBundledStarPng('filled-star.png');

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Fal may return `auto` size — slot rects are calibrated for 2048×2560. */
async function resizeToAnalysisCanvas(buf: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { width, height } = HAIRSTYLE_ANALYSIS_CANVAS;
  const meta = await sharp(buf).metadata();
  if (meta.width === width && meta.height === height) return buf;
  return sharp(buf).resize(width, height, { fit: 'fill' }).png().toBuffer();
}

async function extractSlotPatch(templateBuf: Buffer, slot: PixelRect): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(templateBuf)
    .extract({
      left: Math.max(0, slot.left),
      top: Math.max(0, slot.top),
      width: slot.width,
      height: slot.height,
    })
    .png()
    .toBuffer();
}

/** Wipe Fal/template placeholder score % and star outlines — blank frosted value boxes for server overlay. */
async function buildBlankValueSlotPatch(templateBuf: Buffer, slot: PixelRect): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const patch = await extractSlotPatch(templateBuf, slot);
  const meta = await sharp(patch).metadata();
  const w = meta.width ?? slot.width;
  const h = meta.height ?? slot.height;

  const { data, info } = await sharp(patch).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const samples: Array<[number, number, number]> = [];
  const corners: Array<[number, number]> = [
    [1, 1],
    [w - 2, 1],
    [1, h - 2],
    [w - 2, h - 2],
  ];
  for (const [x, y] of corners) {
    const i = (y * info.width + x) * info.channels;
    samples.push([data[i] ?? 245, data[i + 1] ?? 245, data[i + 2] ?? 245]);
  }
  const r = Math.round(samples.reduce((sum, px) => sum + px[0], 0) / samples.length);
  const g = Math.round(samples.reduce((sum, px) => sum + px[1], 0) / samples.length);
  const b = Math.round(samples.reduce((sum, px) => sum + px[2], 0) / samples.length);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="rgb(${r},${g},${b})"/>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function prepareScoreRatingSlots(
  baseBuf: Buffer,
  templateBuf: Buffer,
  slots: PixelRect[]
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const layers = await Promise.all(
    slots.map(async (slot) => ({
      input: await buildBlankValueSlotPatch(templateBuf, slot),
      left: slot.left,
      top: slot.top,
    }))
  );
  return sharp(baseBuf).composite(layers).png().toBuffer();
}

async function loadStarBuffers(siteOrigin: string): Promise<{ empty: Buffer; filled: Buffer }> {
  if (BUNDLED_STAR_EMPTY && BUNDLED_STAR_FILLED) {
    return { empty: BUNDLED_STAR_EMPTY, filled: BUNDLED_STAR_FILLED };
  }
  const origin = siteOrigin.replace(/\/$/, '');
  const [empty, filled] = await Promise.all([
    fetchBuffer(`${origin}${STAR_EMPTY_PATH}`),
    fetchBuffer(`${origin}${STAR_FILLED_PATH}`),
  ]);
  return { empty, filled };
}

async function resizeStarIntoRect(
  sharp: Awaited<ReturnType<typeof import('sharp')['default']>>,
  srcBuf: Buffer,
  rect: PixelRect
): Promise<{ input: Buffer; left: number; top: number }> {
  const resized = await sharp(srcBuf)
    .resize(rect.width, rect.height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const w = meta.width ?? rect.width;
  const h = meta.height ?? rect.height;
  return {
    input: resized,
    left: rect.left + Math.round((rect.width - w) / 2),
    top: rect.top + Math.round((rect.height - h) / 2),
  };
}

async function buildPetiteStarOverlays(
  score: number,
  ratingSlot: PixelRect,
  siteOrigin: string
): Promise<Array<{ input: Buffer; left: number; top: number }>> {
  const { empty: emptyBuf, filled: filledBuf } = await loadStarBuffers(siteOrigin);

  const starSize = matchRatingFalStarSize(ratingSlot);
  const starRects = matchRatingStarRects(ratingSlot, starSize);
  const filled = matchRatingFilledStarsFromScore(score);
  const sharp = (await import('sharp')).default;
  const overlays: Array<{ input: Buffer; left: number; top: number }> = [];

  for (let i = 0; i < starRects.length; i++) {
    const rect = starRects[i]!;
    const isFilled = i < filled;
    overlays.push(await resizeStarIntoRect(sharp, isFilled ? filledBuf : emptyBuf, rect));
  }

  return overlays;
}

function buildPetiteOverallScoreOverlay(score: number, scoreSlot: PixelRect): Buffer {
  return buildTextPathsSvg(overallScorePathItems(score, scoreSlot, BRAND_RED));
}

/** Overlay petite overall score % + match-rating stars (Fal leaves those slots blank). */
export async function compositeOverallScoreAndStars(
  falBuf: Buffer,
  templateBuf: Buffer,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string,
  layoutOverrides?: CompositeLayoutOverrides
): Promise<Buffer> {
  const scoreSlot = resolveTopScoreSlot(analysis.tier, layoutOverrides);
  const ratingSlot = resolveRatingSlot(analysis.tier, layoutOverrides);
  const sharp = (await import('sharp')).default;

  const wipePad = 10;
  let base = await prepareScoreRatingSlots(falBuf, templateBuf, [
    expandPixelRect(scoreSlot, wipePad),
    expandPixelRect(ratingSlot, wipePad),
  ]);

  const scoreOverlay = await sharp(buildPetiteOverallScoreOverlay(analysis.topMatch.score, scoreSlot))
    .png()
    .toBuffer();
  const starOverlays = await buildPetiteStarOverlays(
    analysis.topMatch.score,
    ratingSlot,
    siteOrigin
  );

  return sharp(base)
    .composite([
      { input: scoreOverlay, left: 0, top: 0 },
      ...starOverlays,
    ])
    .png()
    .toBuffer();
}

/** Post-process: optional photo fade + mirror reflection, then petite score/stars always on top. */
export async function compositeHairstyleAnalysisPostProcess(
  falImageUrl: string,
  templateImageUrl: string,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string,
  layoutOverrides?: CompositeLayoutOverrides,
  applyPhotoFade = false
): Promise<Buffer> {
  const [falRaw, templateRaw] = await Promise.all([
    fetchBuffer(falImageUrl),
    fetchBuffer(templateImageUrl),
  ]);

  const [falBuf, templateBuf] = await Promise.all([
    resizeToAnalysisCanvas(falRaw),
    resizeToAnalysisCanvas(templateRaw),
  ]);

  let base = falBuf;

  const photoOverrides = photoPostProcessLayoutOverrides(layoutOverrides);
  const panelRect = resolveClientImageSlotOrDefault(photoOverrides);
  const fadeRect = resolveClientPhotoFadeSlotOrDefault(photoOverrides);

  if (applyPhotoFade) {
    base = await applyClientPhotoBottomFade(base, templateBuf, fadeRect, panelRect);
  }

  base = await applyClientPhotoMirrorReflection(base, panelRect, fadeRect);

  base = await compositeOverallScoreAndStars(
    base,
    templateBuf,
    analysis,
    siteOrigin,
    layoutOverrides
  );

  return base;
}
