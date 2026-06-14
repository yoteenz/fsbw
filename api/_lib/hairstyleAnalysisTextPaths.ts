import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';

const FONTS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'fonts');

const fontCache = new Map<string, opentype.Font>();

function loadFont(fileName: string): opentype.Font {
  const cached = fontCache.get(fileName);
  if (cached) return cached;
  const buf = readFileSync(join(FONTS_DIR, fileName));
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  fontCache.set(fileName, font);
  return font;
}

export function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function textPathData(
  text: string,
  rect: PixelRect,
  options: {
    fontFile: string;
    fontSize: number;
    fill: string;
    align?: 'left' | 'center';
    /** 0.5 = vertical center; higher nudges text down within the slot. */
    verticalBias?: number;
  }
): string {
  const font = loadFont(options.fontFile);
  const measure = font.getPath(text, 0, 0, options.fontSize);
  const bb = measure.getBoundingBox();
  const pathW = bb.x2 - bb.x1;
  const pathH = bb.y2 - bb.y1;
  const align = options.align ?? 'left';
  const x =
    align === 'center'
      ? rect.left + (rect.width - pathW) / 2 - bb.x1
      : rect.left + Math.round(rect.width * 0.02) - bb.x1;
  const y =
    options.verticalBias !== undefined
      ? rect.top + rect.height * options.verticalBias - pathH * 0.45 - bb.y1
      : rect.top + (rect.height - pathH) / 2 - bb.y1;
  const path = font.getPath(text, x, y, options.fontSize);
  return path.toPathData(2);
}

/** Per-glyph paths — librsvg chokes on some combined opentype paths (e.g. SOFT WAVE). */
export function centeredTextPathItems(
  text: string,
  rect: PixelRect,
  options: {
    fontFile: string;
    fontSize: number;
    fill: string;
  }
): Array<{ pathData: string; fill: string }> {
  const font = loadFont(options.fontFile);
  const measure = font.getPath(text, 0, 0, options.fontSize);
  const bb = measure.getBoundingBox();
  const pathW = bb.x2 - bb.x1;
  const pathH = bb.y2 - bb.y1;
  const x = rect.left + (rect.width - pathW) / 2 - bb.x1;
  const y = rect.top + (rect.height - pathH) / 2 - bb.y1;
  return font.getPaths(text, x, y, options.fontSize).map((glyphPath) => ({
    pathData: glyphPath.toPathData(2),
    fill: options.fill,
  }));
}

/** Admin BRAND card (StatsCard): CBYG number at text-lg (18px) + Futura PT Medium % at 14px. */
const ADMIN_BRAND_SCORE_NUMBER_PX = 18;
const ADMIN_BRAND_SCORE_PERCENT_PX = 14;
const ADMIN_BRAND_PERCENT_SIZE_RATIO =
  ADMIN_BRAND_SCORE_PERCENT_PX / ADMIN_BRAND_SCORE_NUMBER_PX;

/** @deprecated Legacy large composite size — use overallScoreFalFontSize for server overlay. */
export function overallScoreFontSize(rect: PixelRect): number {
  return Math.max(12, Math.min(64, Math.round(rect.height * 0.78)) - 4);
}

/** Petite overall score % — server composite + Fal prompt size target. */
export function overallScoreFalFontSize(rect: PixelRect): number {
  return Math.max(16, Math.min(36, Math.round(rect.height * 0.22)));
}

/** Petite MATCH RATING decimal (e.g. 5.0) — free tier only, stacks above stars. */
export function matchRatingDecimalFalFontSize(rect: PixelRect): number {
  return Math.max(12, Math.min(20, Math.round(rect.height * 0.24)));
}

/** Fal in-image MATCH RATING star glyph height — compact row inside value panel. */
export function matchRatingFalStarSize(rect: PixelRect): number {
  return Math.max(14, Math.min(26, Math.round(rect.height * 0.17)));
}

/** CBYG has no "%" glyph — render digits in Covered By Your Grace, suffix in Futura. */
export function overallScorePathItems(
  score: number,
  rect: PixelRect,
  fill: string
): Array<{ pathData: string; fill: string }> {
  const numText = String(Math.round(score));
  const scoreFont = loadFont('CoveredByYourGrace.ttf');
  const percentFont = loadFont('FuturaPTMedium.ttf');
  const fontSize = overallScoreFalFontSize(rect);
  const percentFontSize = Math.max(
    12,
    Math.round(fontSize * ADMIN_BRAND_PERCENT_SIZE_RATIO)
  );

  const numMeasure = scoreFont.getPath(numText, 0, 0, fontSize);
  const numBb = numMeasure.getBoundingBox();
  const numW = numBb.x2 - numBb.x1;

  const pctMeasure = percentFont.getPath('%', 0, 0, percentFontSize);
  const pctBb = pctMeasure.getBoundingBox();
  const pctW = pctBb.x2 - pctBb.x1;

  const gap = Math.max(2, Math.round(fontSize * 0.04));
  const totalW = numW + gap + pctW;
  const startX = rect.left + (rect.width - totalW) / 2;

  const ascender = (scoreFont.ascender / scoreFont.unitsPerEm) * fontSize;
  const descender = (Math.abs(scoreFont.descender) / scoreFont.unitsPerEm) * fontSize;
  const baselineY = rect.top + (rect.height + ascender - descender) / 2;

  const numX = startX - numBb.x1;
  const numPath = scoreFont.getPath(numText, numX, baselineY, fontSize);

  const pctX = startX + numW + gap - pctBb.x1;
  const pctPath = percentFont.getPath('%', pctX, baselineY, percentFontSize);

  return [
    { pathData: numPath.toPathData(2), fill },
    { pathData: pctPath.toPathData(2), fill },
  ];
}

export function buildTextPathsSvg(
  items: Array<{ pathData: string; fill: string }>
): Buffer {
  const paths = items
    .map(({ pathData, fill }) => `<path d="${escapeSvgText(pathData)}" fill="${fill}"/>`)
    .join('\n  ');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2560">
  ${paths}
</svg>`;
  return Buffer.from(svg);
}

/** Match-row value text — 2px smaller than slot height for label alignment. */
export function matchRowValueFontSize(rect: PixelRect): number {
  return Math.max(14, Math.round(rect.height * 0.88) - 2);
}

/** TOP MATCH spec column values — extra petite for baked label alignment. */
export function topMatchSpecValueFontSize(rect: PixelRect): number {
  return Math.max(9, Math.min(14, Math.round(rect.height * 0.26)));
}

/** Free-tier EDM build summary (UNIT · 22" · COLOR) — centered gray ribbon. */
export function edmPanelFooterFontSize(rect: PixelRect): number {
  return Math.max(12, Math.min(20, Math.round(rect.height * 0.72)));
}
