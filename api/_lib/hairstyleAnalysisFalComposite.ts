import type { CompositeLayoutOverrides } from './hairstyleAnalysisCompositeLayout.js';
import { resolveClientImageSlotOrDefault, resolveTopScoreSlot } from './hairstyleAnalysisCompositeLayout.js';
import { applyClientPhotoBottomFade } from './hairstyleAnalysisClientPhotoFade.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  MATCH_RATING_STAR_RECTS,
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

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function filledStarCount(rating: number): number {
  return Math.min(5, Math.max(0, Math.round(rating)));
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

async function buildStarComposites(
  rating: number,
  tier: FalHairstyleAnalysis['tier'],
  siteOrigin: string
): Promise<Array<{ input: Buffer; left: number; top: number }>> {
  const origin = siteOrigin.replace(/\/$/, '');
  const [emptyBuf, filledBuf] = await Promise.all([
    fetchBuffer(`${origin}${STAR_EMPTY_PATH}`),
    fetchBuffer(`${origin}${STAR_FILLED_PATH}`),
  ]);

  const filled = filledStarCount(rating);
  const premium = normalizeTier(tier) !== 'free';
  const sharp = (await import('sharp')).default;
  const overlays: Array<{ input: Buffer; left: number; top: number }> = [];

  for (let i = 0; i < MATCH_RATING_STAR_RECTS.length; i++) {
    const rect = MATCH_RATING_STAR_RECTS[i]!;
    const isFilled = i < filled;
    if (premium && !isFilled) continue;

    const overlay = await resizeStarIntoRect(sharp, isFilled ? filledBuf : emptyBuf, rect);
    overlays.push(overlay);
  }

  return overlays;
}

function buildOverallScoreOverlaySvg(score: number, layoutOverrides?: CompositeLayoutOverrides): Buffer {
  const slot = resolveTopScoreSlot(layoutOverrides);
  return buildTextPathsSvg(overallScorePathItems(score, slot, BRAND_RED));
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

/** Overlay client photo fade, overall score %, match-rating stars, and MATCH 02–04 row values. */
export async function compositeHairstyleAnalysisMatchRows(
  falImageUrl: string,
  templateImageUrl: string,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string,
  layoutOverrides?: CompositeLayoutOverrides
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const [falBuf, templateBuf] = await Promise.all([
    fetchBuffer(falImageUrl),
    fetchBuffer(templateImageUrl),
  ]);

  const clientRect = resolveClientImageSlotOrDefault(layoutOverrides);
  const fadedBase = await applyClientPhotoBottomFade(falBuf, templateBuf, clientRect);

  const svgOverlays: Buffer[] = [
    buildOverallScoreOverlaySvg(analysis.topMatch.score, layoutOverrides),
  ];
  const matchRowOverlay = buildMatchRowOverlaySvg(analysis);
  if (matchRowOverlay) svgOverlays.push(matchRowOverlay);

  const [svgCompositeInputs, starOverlays] = await Promise.all([
    Promise.all(svgOverlays.map((overlay) => sharp(overlay).png().toBuffer())),
    buildStarComposites(analysis.topMatch.rating, analysis.tier, siteOrigin),
  ]);

  const compositeLayers = [
    ...svgCompositeInputs.map((input) => ({ input, left: 0, top: 0 })),
    ...starOverlays,
  ];

  return sharp(fadedBase).composite(compositeLayers).png().toBuffer();
}
