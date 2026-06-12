import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Jimp } from 'jimp';
import {
  HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH,
  HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH,
} from './hairstyleAnalysisFalPrompt.js';

const TEMPLATE_W = 2048;
const TEMPLATE_H = 2560;

/** Matches src/utils/hairstyleAnalysisTemplateLayouts.ts RATING slot. */
const RATING_LEFT_PCT = 0.71;
const RATING_TOP_PCT = 0.158;
const RATING_WIDTH_PCT = 0.12;
const RATING_HEIGHT_PCT = 0.035;

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

function makeBlackTransparent(image: InstanceType<typeof Jimp>, threshold = 40): void {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (this: InstanceType<typeof Jimp>, x, y, idx) {
    const r = this.bitmap.data[idx]!;
    const g = this.bitmap.data[idx + 1]!;
    const b = this.bitmap.data[idx + 2]!;
    if (r < threshold && g < threshold && b < threshold) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
}

async function loadStarAsset(publicPath: string): Promise<InstanceType<typeof Jimp>> {
  const rel = publicPath.replace(/^\//, '');
  const buf = await readFile(join(repoRoot, 'public', rel));
  const img = await Jimp.read(buf);
  makeBlackTransparent(img);
  return img;
}

/** Overlays website-style empty/filled stars onto the Fal result (replaces model-drawn stars). */
export async function compositeMatchRatingStars(
  imageBuffer: Buffer,
  rating: number
): Promise<Buffer> {
  const filledCount = Math.min(5, Math.max(0, Math.round(rating)));
  const base = await Jimp.read(imageBuffer);
  const emptyStar = await loadStarAsset(HAIRSTYLE_ANALYSIS_STAR_EMPTY_PATH);
  const filledStar = await loadStarAsset(HAIRSTYLE_ANALYSIS_STAR_FILLED_PATH);

  const boxLeft = Math.round(RATING_LEFT_PCT * TEMPLATE_W);
  const boxTop = Math.round(RATING_TOP_PCT * TEMPLATE_H);
  const boxW = Math.round(RATING_WIDTH_PCT * TEMPLATE_W);
  const boxH = Math.round(RATING_HEIGHT_PCT * TEMPLATE_H);

  const starSize = Math.min(boxH - 4, Math.floor(boxW / 5.8));
  const totalStarsW = starSize * 5;
  const gap = Math.max(2, Math.floor((boxW - totalStarsW) / 4));
  const startX = boxLeft + Math.floor((boxW - (totalStarsW + gap * 4)) / 2);
  const startY = boxTop + Math.floor((boxH - starSize) / 2);

  for (let i = 0; i < 5; i++) {
    const star = (i < filledCount ? filledStar : emptyStar).clone();
    star.resize({ w: starSize, h: starSize });
    const x = startX + i * (starSize + gap);
    base.composite(star, x, startY);
  }

  return base.getBuffer('image/png');
}
