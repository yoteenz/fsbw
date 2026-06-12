import {
  type CompositeLayoutOverrides,
  resolveRatingSlot,
  resolveTopScoreSlot,
} from './hairstyleAnalysisCompositeLayout.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  premiumMatchRowValueSlots,
  type PixelRect,
} from './hairstyleAnalysisLayoutSlots.js';
import {
  buildTextPathsSvg,
  matchRowValueFontSize,
  overallScorePathItems,
  textPathData,
} from './hairstyleAnalysisTextPaths.js';
import { displayLength, formatScorePercent } from './hairstyleAnalysisDisplay.js';

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

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function buildMatchRowOverlaySvg(analysis: FalHairstyleAnalysis): Buffer | null {
  if (normalizeTier(analysis.tier) === 'free') return null;

  const slotById = new Map(premiumMatchRowValueSlots().map((slot) => [slot.id, slot]));
  const pathItems: Array<{ pathData: string; fill: string }> = [];

  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    const prefix = `match${i + 2}`;
    const values: Record<string, string> = {
      texture: look.unit.trim().toUpperCase(),
      color: look.color.trim().toUpperCase(),
      length: displayLength(look.length),
      score: formatScorePercent(look.score),
    };

    for (const key of ['texture', 'color', 'length', 'score'] as const) {
      const slot = slotById.get(`${prefix}-${key}`);
      if (!slot) continue;
      pathItems.push({
        pathData: textPathData(values[key], slot.rect, {
          fontFile: 'FuturaPTMedium.ttf',
          fontSize: matchRowValueFontSize(slot.rect),
          fill: slot.fill,
          align: 'left',
        }),
        fill: slot.fill,
      });
    }
  });

  if (pathItems.length === 0) return null;
  return buildTextPathsSvg(pathItems);
}

/** Overlay overall score %, match-rating stars, and match-row values (Fal leaves those slots blank). */
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
  const [scoreOverlay, starOverlays, matchRowOverlay] = await Promise.all([
    Promise.resolve(buildScoreOverlaySvg(analysis.topMatch.score, topScoreSlot)),
    buildStarComposites(analysis.topMatch.rating, ratingSlot, siteOrigin),
    Promise.resolve(buildMatchRowOverlaySvg(analysis)),
  ]);

  const overlays: Array<{ input: Buffer; left: number; top: number }> = [
    { input: await sharp(scoreOverlay).png().toBuffer(), left: 0, top: 0 },
    ...starOverlays,
  ];

  if (matchRowOverlay) {
    overlays.push({ input: await sharp(matchRowOverlay).png().toBuffer(), left: 0, top: 0 });
  }

  return sharp(baseBuf).composite(overlays).png().toBuffer();
}

