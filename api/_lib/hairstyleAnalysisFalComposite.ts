import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { formatScorePercent } from './hairstyleAnalysisDisplay.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  RATING_SLOT,
  TOP_SCORE_SLOT,
  threeMonthMatchScoreSlots,
  sixMonthPortfolioScoreSlots,
  twelveMonthAltScoreSlots,
  type PixelRect,
} from './hairstyleAnalysisLayoutSlots.js';

const BRAND_RED = '#EB1C24';
const MATCH_SCORE_GRAY = '#808080';
const STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
const STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';
const COVERED_FONT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'fonts',
  'CoveredByYourGrace.ttf'
);

let coveredFont: opentype.Font | null = null;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function loadCoveredFont(): opentype.Font {
  if (coveredFont) return coveredFont;
  const buf = readFileSync(COVERED_FONT_PATH);
  coveredFont = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  return coveredFont;
}

function coveredScorePathSvg(text: string, rect: typeof TOP_SCORE_SLOT, fontSize: number): string {
  const font = loadCoveredFont();
  const measure = font.getPath(text, 0, 0, fontSize);
  const bb = measure.getBoundingBox();
  const pathW = bb.x2 - bb.x1;
  const pathH = bb.y2 - bb.y1;
  const x = rect.left + (rect.width - pathW) / 2 - bb.x1;
  const y = rect.top + (rect.height - pathH) / 2 - bb.y1;
  const path = font.getPath(text, x, y, fontSize);
  return path.toPathData(2);
}

function buildScoreOverlaySvg(score: number): Buffer {
  const rect = TOP_SCORE_SLOT;
  const text = formatScorePercent(score);
  const fontSize = Math.min(64, Math.round(rect.height * 0.78));
  const pathData = coveredScorePathSvg(text, rect, fontSize);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2560">
  <path d="${escapeXml(pathData)}" fill="${BRAND_RED}"/>
</svg>`;

  return Buffer.from(svg);
}

async function buildStarComposites(
  rating: number,
  siteOrigin: string
): Promise<Array<{ input: Buffer; left: number; top: number }>> {
  const origin = siteOrigin.replace(/\/$/, '');
  const [emptyBuf, filledBuf] = await Promise.all([
    fetchBuffer(`${origin}${STAR_EMPTY_PATH}`),
    fetchBuffer(`${origin}${STAR_FILLED_PATH}`),
  ]);

  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  const gap = Math.max(2, Math.round(RATING_SLOT.width * 0.02));
  const starW = Math.max(
    24,
    Math.min(Math.round(RATING_SLOT.height * 0.62), Math.floor((RATING_SLOT.width - gap * 4) / 5))
  );
  const rowWidth = 5 * starW + 4 * gap;
  const leftStart = RATING_SLOT.left + Math.round((RATING_SLOT.width - rowWidth) / 2);
  const top = RATING_SLOT.top + Math.round((RATING_SLOT.height - starW) / 2);

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

function matchScoreEntries(
  analysis: FalHairstyleAnalysis
): Array<{ score: number; rect: PixelRect }> {
  const tier = normalizeTier(analysis.tier);
  if (tier === 'free') return [];

  if (tier === 'three_month') {
    const rects = threeMonthMatchScoreSlots();
    return analysis.additionalLooks.slice(0, rects.length).map((look, i) => ({
      score: look.score,
      rect: rects[i]!,
    }));
  }

  if (tier === 'six_month') {
    const rects = sixMonthPortfolioScoreSlots();
    const portfolio = [analysis.topMatch, ...analysis.additionalLooks];
    return portfolio.slice(0, rects.length).map((look, i) => ({
      score: look.score,
      rect: rects[i]!,
    }));
  }

  const rects = twelveMonthAltScoreSlots();
  return analysis.additionalLooks.slice(0, rects.length).map((look, i) => ({
    score: look.score,
    rect: rects[i]!,
  }));
}

function buildMatchScoresOverlaySvg(entries: Array<{ score: number; rect: PixelRect }>): Buffer | null {
  if (entries.length === 0) return null;

  const textNodes = entries
    .map(({ score, rect }) => {
      const text = formatScorePercent(score);
      const fontSize = Math.max(18, Math.round(Math.min(rect.height * 0.82, rect.width * 0.22)));
      const x = rect.left + Math.round(rect.width * 0.02);
      const y = rect.top + Math.round(rect.height * 0.78);
      return `<text x="${x}" y="${y}" fill="${MATCH_SCORE_GRAY}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${fontSize}" font-weight="500">${escapeXml(text)}</text>`;
    })
    .join('\n  ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2560">
  ${textNodes}
</svg>`;

  return Buffer.from(svg);
}

/** Overlay overall score %, match-rating stars, and per-row match scores — Fal fills specs only. */
export async function compositeHairstyleAnalysisFalImage(
  falImageUrl: string,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchBuffer(falImageUrl);
  const matchScoreOverlay = buildMatchScoresOverlaySvg(matchScoreEntries(analysis));
  const [scoreOverlay, starOverlays] = await Promise.all([
    Promise.resolve(buildScoreOverlaySvg(analysis.topMatch.score)),
    buildStarComposites(analysis.topMatch.rating, siteOrigin),
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
