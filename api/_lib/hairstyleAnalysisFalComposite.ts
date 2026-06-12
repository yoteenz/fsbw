import {
  displayDensity,
  displayHairline,
  displayLace,
  displayLength,
  displayPart,
  displayStyle,
  formatScorePercent,
} from './hairstyleAnalysisDisplay.js';
import type { FalAnalysisLook, FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  HAIRSTYLE_ANALYSIS_CANVAS,
  RATING_SLOT,
  sixMonthPortfolioScoreSlots,
  twelveMonthAltScoreSlots,
  threeMonthMatchScoreSlots,
  TOP_SCORE_SLOT,
  topMatchSpecSlots,
  type PixelRect,
} from './hairstyleAnalysisLayoutSlots.js';

const BRAND_RED = '#EB1C24';
const BLACK = '#000000';
const FUTURA_PATH = '/assets/Futura%20PT%20Medium.ttf';
const STAR_EMPTY_PATH = '/assets/NOIR/star-symbol.png';
const STAR_FILLED_PATH = '/assets/NOIR/filled-star.png';
const COVERED_FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap';

type FontCache = {
  futuraB64?: string;
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

async function futuraFontBase64(siteOrigin: string): Promise<string> {
  if (fontCache.futuraB64) return fontCache.futuraB64;
  const buf = await fetchBuffer(`${siteOrigin.replace(/\/$/, '')}${FUTURA_PATH}`);
  fontCache.futuraB64 = buf.toString('base64');
  return fontCache.futuraB64;
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

function textY(rect: PixelRect, fontSize: number): number {
  return rect.top + Math.round(rect.height * 0.78);
}

function specValues(look: FalAnalysisLook): Record<string, string> {
  return {
    specTexture: look.unit,
    specColor: look.color,
    specLength: displayLength(look.length),
    specLace: displayLace(look.lace),
    specDensity: displayDensity(look.density),
    specParting: displayPart(look.part),
    specHairline: displayHairline(look.hairline),
    specStyle: displayStyle(look.styling),
  };
}

type SvgText = {
  rect: PixelRect;
  text: string;
  fontFamily: 'futura' | 'covered';
  fontSize: number;
  fill: string;
  fontWeight?: number;
};

function scoreTextsForTier(tier: FalHairstyleAnalysis['tier'], analysis: FalHairstyleAnalysis): SvgText[] {
  const texts: SvgText[] = [];
  const top = analysis.topMatch;

  if (tier === 'three_month') {
    analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
      texts.push({
        rect: threeMonthMatchScoreSlots()[i],
        text: formatScorePercent(look.score),
        fontFamily: 'futura',
        fontSize: 34,
        fill: BRAND_RED,
        fontWeight: 500,
      });
    });
  } else if (tier === 'six_month') {
    const portfolio = [top, ...analysis.additionalLooks];
    portfolio.slice(0, 5).forEach((look, i) => {
      texts.push({
        rect: sixMonthPortfolioScoreSlots()[i],
        text: formatScorePercent(look.score),
        fontFamily: 'futura',
        fontSize: 32,
        fill: BRAND_RED,
        fontWeight: 500,
      });
    });
  } else if (tier === 'twelve_month' || tier === 'black') {
    analysis.additionalLooks.slice(0, 9).forEach((look, i) => {
      texts.push({
        rect: twelveMonthAltScoreSlots()[i],
        text: formatScorePercent(look.score),
        fontFamily: 'futura',
        fontSize: 28,
        fill: BRAND_RED,
        fontWeight: 500,
      });
    });
  }

  return texts;
}

async function buildOverlaySvg(
  analysis: FalHairstyleAnalysis,
  siteOrigin: string
): Promise<Buffer> {
  const top = analysis.topMatch;
  const values = specValues(top);
  const futuraB64 = await futuraFontBase64(siteOrigin);
  const coveredB64 = await coveredFontBase64();

  const texts: SvgText[] = [
    {
      rect: TOP_SCORE_SLOT,
      text: formatScorePercent(top.score),
      fontFamily: 'covered',
      fontSize: 56,
      fill: BRAND_RED,
    },
    ...topMatchSpecSlots().map((slot) => ({
      rect: slot.rect,
      text: values[slot.id],
      fontFamily: 'futura' as const,
      fontSize: 38,
      fill: BLACK,
      fontWeight: 500,
    })),
    ...scoreTextsForTier(analysis.tier, analysis),
  ];

  const fontFaces = [
    `@font-face { font-family: 'FuturaSlot'; src: url(data:font/truetype;charset=utf-8;base64,${futuraB64}) format('truetype'); font-weight: 500; }`,
    coveredB64
      ? `@font-face { font-family: 'CoveredSlot'; src: url(data:font/truetype;charset=utf-8;base64,${coveredB64}) format('truetype'); }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const textNodes = texts
    .map((t) => {
      const family = t.fontFamily === 'covered' && coveredB64 ? 'CoveredSlot' : 'FuturaSlot';
      const weight = t.fontWeight ? ` font-weight="${t.fontWeight}"` : '';
      return `<text x="${t.rect.left}" y="${textY(t.rect, t.fontSize)}" font-family="${family}" font-size="${t.fontSize}" fill="${t.fill}"${weight}>${escapeXml(t.text)}</text>`;
    })
    .join('\n');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${HAIRSTYLE_ANALYSIS_CANVAS.width}" height="${HAIRSTYLE_ANALYSIS_CANVAS.height}">
  <defs><style>${fontFaces}</style></defs>
  ${textNodes}
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
  const starW = Math.max(28, Math.round(RATING_SLOT.width / 5.8));
  const gap = Math.max(2, Math.round(starW * 0.08));
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
      left: RATING_SLOT.left + i * (starW + gap),
      top,
    });
  }

  return overlays;
}

export async function compositeHairstyleAnalysisFalImage(
  falImageUrl: string,
  analysis: FalHairstyleAnalysis,
  siteOrigin: string
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseBuf = await fetchBuffer(falImageUrl);
  const [textOverlay, starOverlays] = await Promise.all([
    buildOverlaySvg(analysis, siteOrigin),
    buildStarComposites(analysis.topMatch.rating, siteOrigin),
  ]);

  const textPng = await sharp(textOverlay).png().toBuffer();

  return sharp(baseBuf)
    .composite([
      { input: textPng, left: 0, top: 0 },
      ...starOverlays,
    ])
    .png()
    .toBuffer();
}
