import {
  type CompositeLayoutOverrides,
  resolveRatingSlot,
  resolveTopScoreSlot,
} from './hairstyleAnalysisCompositeLayout.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { buildTextPathsSvg, overallScorePathItems } from './hairstyleAnalysisTextPaths.js';

const BRAND_RED = '#EB1C24';
const STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
const STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function buildScoreOverlaySvg(score: number, rect: PixelRect): Buffer {
  return buildTextPathsSvg(overallScorePathItems(score, rect, BRAND_RED));
}

async function buildStarComposites(
  rating: number,
  ratingSlot: PixelRect,
  siteOrigin: string
): Promise<Array<{ input: Buffer; left: number; top: number }>> {
  const origin = siteOrigin.replace(/\/$/, '');
  const [emptyBuf, filledBuf] = await Promise.all([
    fetchBuffer(`${origin}${STAR_EMPTY_PATH}`),
    fetchBuffer(`${origin}${STAR_FILLED_PATH}`),
  ]);

  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  const gap = Math.max(2, Math.round(ratingSlot.width * 0.02));
  const starW = Math.max(
    24,
    Math.min(Math.round(ratingSlot.height * 0.62), Math.floor((ratingSlot.width - gap * 4) / 5))
  );
  const rowWidth = 5 * starW + 4 * gap;
  const leftStart = ratingSlot.left + Math.round((ratingSlot.width - rowWidth) / 2);
  const top = ratingSlot.top + Math.round((ratingSlot.height - starW) / 2);

  const sharp = (await import('sharp')).default;
  const overlays: Array<{ input: Buffer; left: number; top: number }> = [];

  for (let i = 0; i < 5; i++) {
    const input = await sharp(i < filled ? filledBuf : emptyBuf)
      .resize(starW, starW, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    overlays.push({
      input,
      left: leftStart + i * (starW + gap),
      top,
    });
  }

  return overlays;
}

/** Overlay overall score % and match-rating stars — Fal fills specs and gray match-row scores. */
export async function compositeHairstyleAnalysisFalImage(
  falImageUrl: string,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string,
  layoutOverrides?: CompositeLayoutOverrides
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchBuffer(falImageUrl);
  const topScoreSlot = resolveTopScoreSlot(layoutOverrides);
  const ratingSlot = resolveRatingSlot(layoutOverrides);
  const [scoreOverlay, starOverlays] = await Promise.all([
    Promise.resolve(buildScoreOverlaySvg(analysis.topMatch.score, topScoreSlot)),
    buildStarComposites(analysis.topMatch.rating, ratingSlot, siteOrigin),
  ]);

  const overlays: Array<{ input: Buffer; left: number; top: number }> = [
    { input: await sharp(scoreOverlay).png().toBuffer(), left: 0, top: 0 },
    ...starOverlays,
  ];

  return sharp(baseBuf).composite(overlays).png().toBuffer();
}

