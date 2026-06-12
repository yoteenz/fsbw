import { formatScorePercent } from './hairstyleAnalysisDisplay.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { RATING_SLOT, TOP_SCORE_SLOT } from './hairstyleAnalysisLayoutSlots.js';

const BRAND_RED = '#EB1C24';
const STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
const STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';
const COVERED_FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap';

type FontCache = {
  coveredB64?: string;
};

const fontCache: FontCache = {};

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

async function coveredFontBase64(): Promise<string | null> {
  if (fontCache.coveredB64) return fontCache.coveredB64;
  try {
    const cssRes = await fetch(COVERED_FONT_CSS, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const css = await cssRes.text();
    const match = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/.exec(css);
    if (!match?.[1]) return null;
    const buf = await fetchBuffer(match[1]);
    fontCache.coveredB64 = buf.toString('base64');
    return fontCache.coveredB64;
  } catch {
    return null;
  }
}

function textY(top: number, height: number, fontSize: number): number {
  return top + Math.round(height * 0.78);
}

async function buildScoreOverlaySvg(score: number): Promise<Buffer> {
  const coveredB64 = await coveredFontBase64();
  const family = coveredB64 ? 'CoveredSlot' : 'sans-serif';
  const fontFace = coveredB64
    ? `@font-face { font-family: 'CoveredSlot'; src: url(data:font/truetype;charset=utf-8;base64,${coveredB64}) format('truetype'); }`
    : '';

  const rect = TOP_SCORE_SLOT;
  const text = formatScorePercent(score);
  const fontSize = Math.min(56, Math.round(rect.height * 0.72));
  const x = rect.left + Math.round(rect.width / 2);
  const y = textY(rect.top, rect.height, fontSize);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2560">
  <defs><style>${fontFace}</style></defs>
  <text x="${x}" y="${y}" text-anchor="middle" font-family="${family}" font-size="${fontSize}" fill="${BRAND_RED}">${escapeXml(text)}</text>
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
    buildScoreOverlaySvg(analysis.topMatch.score),
    buildStarComposites(analysis.topMatch.rating, siteOrigin),
  ]);

  const scorePng = await sharp(scoreOverlay).png().toBuffer();

  return sharp(baseBuf)
    .composite([{ input: scorePng, left: 0, top: 0 }, ...starOverlays])
    .png()
    .toBuffer();
}
