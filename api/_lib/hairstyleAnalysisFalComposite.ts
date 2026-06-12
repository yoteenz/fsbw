import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { formatScorePercent } from './hairstyleAnalysisDisplay.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { RATING_SLOT, TOP_SCORE_SLOT } from './hairstyleAnalysisLayoutSlots.js';

const BRAND_RED = '#EB1C24';
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

/** Overlay only overall score % and match-rating stars — Fal fills specs and match scores. */
export async function compositeHairstyleAnalysisFalImage(
  falImageUrl: string,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchBuffer(falImageUrl);
  const [scoreOverlay, starOverlays] = await Promise.all([
    Promise.resolve(buildScoreOverlaySvg(analysis.topMatch.score)),
    buildStarComposites(analysis.topMatch.rating, siteOrigin),
  ]);

  const scorePng = await sharp(scoreOverlay).png().toBuffer();

  return sharp(baseBuf)
    .composite([{ input: scorePng, left: 0, top: 0 }, ...starOverlays])
    .png()
    .toBuffer();
}
