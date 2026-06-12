import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';

const FONTS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'fonts');

export const BRAND_RED = '#EB1C24';
export const MATCH_SCORE_GRAY = '#808080';
export const SPEC_TEXT_BLACK = '#1a1a1a';

export type AnalysisFontStyle = 'covered-red' | 'futura-black' | 'futura-red' | 'futura-gray';

const FONT_FILES: Record<Exclude<AnalysisFontStyle, never>, string> = {
  'covered-red': 'CoveredByYourGrace.ttf',
  'futura-black': 'FuturaPTMedium.ttf',
  'futura-red': 'FuturaPTMedium.ttf',
  'futura-gray': 'FuturaPTMedium.ttf',
};

const FONT_COLORS: Record<AnalysisFontStyle, string> = {
  'covered-red': BRAND_RED,
  'futura-black': SPEC_TEXT_BLACK,
  'futura-red': BRAND_RED,
  'futura-gray': MATCH_SCORE_GRAY,
};

const fontCache = new Map<string, opentype.Font>();

function loadFont(fileName: string): opentype.Font {
  const cached = fontCache.get(fileName);
  if (cached) return cached;
  const buf = readFileSync(join(FONTS_DIR, fileName));
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  fontCache.set(fileName, font);
  return font;
}

function fontForStyle(style: AnalysisFontStyle): opentype.Font {
  return loadFont(FONT_FILES[style]);
}

function fontSizeToFit(
  font: opentype.Font,
  text: string,
  maxWidth: number,
  maxHeight: number,
  startSize: number
): number {
  let size = startSize;
  while (size > 10) {
    const bb = font.getPath(text, 0, 0, size).getBoundingBox();
    if (bb.x2 - bb.x1 <= maxWidth && bb.y2 - bb.y1 <= maxHeight) return size;
    size -= 1;
  }
  return 10;
}

export function textPathInRect(
  text: string,
  rect: PixelRect,
  style: AnalysisFontStyle,
  opts?: { maxFontSize?: number; align?: 'left' | 'center' }
): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const font = fontForStyle(style);
  const align = opts?.align ?? 'left';
  const maxFontSize = opts?.maxFontSize ?? Math.round(rect.height * 0.92);
  const fontSize = fontSizeToFit(font, trimmed, rect.width, rect.height, maxFontSize);
  const measure = font.getPath(trimmed, 0, 0, fontSize);
  const bb = measure.getBoundingBox();
  const pathW = bb.x2 - bb.x1;
  const pathH = bb.y2 - bb.y1;
  const x =
    align === 'center'
      ? rect.left + (rect.width - pathW) / 2 - bb.x1
      : rect.left - bb.x1;
  const y = rect.top + (rect.height - pathH) / 2 - bb.y1;
  return font.getPath(trimmed, x, y, fontSize).toPathData(2);
}

export function buildTextOverlaySvg(
  items: Array<{ text: string; rect: PixelRect; style: AnalysisFontStyle; align?: 'left' | 'center' }>
): Buffer {
  const paths: string[] = [];
  for (const item of items) {
    const path = textPathInRect(item.text, item.rect, item.style, {
      align: item.align,
      maxFontSize: item.style === 'covered-red' ? 64 : undefined,
    });
    if (!path) continue;
    paths.push(`<path d="${escapeXml(path)}" fill="${FONT_COLORS[item.style]}"/>`);
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2560">
${paths.join('\n')}
</svg>`;
  return Buffer.from(svg);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
