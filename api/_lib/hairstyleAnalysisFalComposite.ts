import { formatScorePercent } from './hairstyleAnalysisDisplay.js';
import {
  type CompositeLayoutOverrides,
  matchScoreSlotIds,
  resolveCompositeSlotRect,
  resolveRatingSlot,
  resolveTopScoreSlot,
} from './hairstyleAnalysisCompositeLayout.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { buildTextPathsSvg, textPathData } from './hairstyleAnalysisTextPaths.js';

const BRAND_RED = '#EB1C24';
const MATCH_SCORE_GRAY = '#808080';
const STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
const STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function buildScoreOverlaySvg(score: number, rect: PixelRect): Buffer {
  const text = formatScorePercent(score);
  const fontSize = Math.min(64, Math.round(rect.height * 0.78));
  const pathData = textPathData(text, rect, {
    fontFile: 'CoveredByYourGrace.ttf',
    fontSize,
    fill: BRAND_RED,
    align: 'center',
  });
  return buildTextPathsSvg([{ pathData, fill: BRAND_RED }]);
}

function buildMatchScoresOverlaySvg(
  entries: Array<{ score: number; rect: PixelRect }>
): Buffer | null {
  if (entries.length === 0) return null;

  const paths = entries.map(({ score, rect }) => {
    const text = formatScorePercent(score);
    const fontSize = Math.max(18, Math.round(Math.min(rect.height * 0.82, rect.width * 0.22)));
    return {
      pathData: textPathData(text, rect, {
        fontFile: 'FuturaPTMedium.ttf',
        fontSize,
        fill: MATCH_SCORE_GRAY,
        align: 'left',
      }),
      fill: MATCH_SCORE_GRAY,
    };
  });

  return buildTextPathsSvg(paths);
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

function matchScoreEntries(
  analysis: FalHairstyleAnalysis,
  layoutOverrides?: CompositeLayoutOverrides
): Array<{ score: number; rect: PixelRect }> {
  const tier = analysis.tier;
  const slotIds = matchScoreSlotIds(tier);
  if (slotIds.length === 0) return [];

  let scores: number[] = [];
  if (tier === 'three_month') {
    scores = analysis.additionalLooks.slice(0, slotIds.length).map((look) => look.score);
  } else if (tier === 'six_month') {
    scores = [analysis.topMatch, ...analysis.additionalLooks]
      .slice(0, slotIds.length)
      .map((look) => look.score);
  } else if (tier === 'twelve_month' || tier === 'black') {
    scores = analysis.additionalLooks.slice(0, slotIds.length).map((look) => look.score);
  }

  const entries: Array<{ score: number; rect: PixelRect }> = [];
  slotIds.forEach((slotId, i) => {
    const rect = resolveCompositeSlotRect(slotId, tier, layoutOverrides);
    const score = scores[i];
    if (rect != null && score != null) entries.push({ score, rect });
  });
  return entries;
}

/** Overlay overall score %, match-rating stars, and per-row match scores — Fal fills specs only. */
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
  const matchScoreOverlay = buildMatchScoresOverlaySvg(
    matchScoreEntries(analysis, layoutOverrides)
  );
  const [scoreOverlay, starOverlays] = await Promise.all([
    Promise.resolve(buildScoreOverlaySvg(analysis.topMatch.score, topScoreSlot)),
    buildStarComposites(analysis.topMatch.rating, ratingSlot, siteOrigin),
  ]);

  const overlays: Array<{ input: Buffer; left: number; top: number }> = [
    { input: await sharp(scoreOverlay).png().toBuffer(), left: 0, top: 0 },
    ...starOverlays,
  ];

  if (matchScoreOverlay) {
    overlays.push({
      input: await sharp(matchScoreOverlay).png().toBuffer(),
      left: 0,
      top: 0,
    });
  }

  return sharp(baseBuf).composite(overlays).png().toBuffer();
}
