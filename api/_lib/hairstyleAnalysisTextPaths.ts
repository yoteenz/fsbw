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
  const y = rect.top + (rect.height - pathH) / 2 - bb.y1;
  const path = font.getPath(text, x, y, options.fontSize);
  return path.toPathData(2);
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
