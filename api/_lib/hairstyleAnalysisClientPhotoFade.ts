import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import {
  intersectPixelRects,
} from './hairstyleAnalysisLayoutSlots.js';
import { chromaKeyStudioBackgroundInPlace } from './hairstyleAnalysisClientPhotoCutout.js';

/** Symmetrical bottom fade on the client photo alpha only — template marble shows through. */
const FADE_START_PCT = 72;
const FADE_STOPS: Array<{ offset: number; opacity: number }> = [
  { offset: 0, opacity: 1 },
  { offset: FADE_START_PCT, opacity: 1 },
  { offset: 82, opacity: 0 },
  { offset: 100, opacity: 0 },
];

function buildSymmetricalBottomFadeMaskSvg(width: number, height: number): Buffer {
  const stops = FADE_STOPS.map(
    (s) =>
      `<stop offset="${s.offset}%" stop-color="white" stop-opacity="${s.opacity}"/>`
  ).join('');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
      ${stops}
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#fade)"/>
</svg>`;
  return Buffer.from(svg);
}

function clampExtractRect(rect: PixelRect, imageW: number, imageH: number): PixelRect {
  const left = Math.max(0, Math.min(rect.left, imageW - 1));
  const top = Math.max(0, Math.min(rect.top, imageH - 1));
  const width = Math.max(1, Math.min(rect.width, imageW - left));
  const height = Math.max(1, Math.min(rect.height, imageH - top));
  return { left, top, width, height };
}

/**
 * Server post-process: in-place bottom fade on the Fal-painted photo window only.
 * No Ideogram cutout, no bottom-anchor rescale, no second portrait layer — that
 * stack caused a smaller cutout pasted over the original inside a white frame.
 */
export async function applyClientPhotoBottomFade(
  falBuf: Buffer,
  templateBuf: Buffer,
  fadeRect: PixelRect,
  panelRect: PixelRect
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const falMeta = await sharp(falBuf).metadata();
  const templateMeta = await sharp(templateBuf).metadata();
  const canvasW = falMeta.width ?? templateMeta.width ?? 2048;
  const canvasH = falMeta.height ?? templateMeta.height ?? 2560;

  const panel = clampExtractRect(panelRect, canvasW, canvasH);
  const fadeInsidePanel = intersectPixelRects(panel, fadeRect);
  if (!fadeInsidePanel) {
    console.warn('[hairstyle-analysis] client photo fade rect outside panel — skipping post-process');
    return falBuf;
  }

  const { left, top, width, height } = fadeInsidePanel;

  const maskPng = await sharp(buildSymmetricalBottomFadeMaskSvg(width, height)).png().toBuffer();

  const falRegion = await sharp(falBuf)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .png()
    .toBuffer();

  const keyedRegion = await chromaKeyStudioBackgroundInPlace(falRegion);

  const maskedPhoto = await sharp(keyedRegion)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const templateFadeWindow = await sharp(templateBuf)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();

  const fadePatch = await sharp(templateFadeWindow)
    .composite([{ input: maskedPhoto, blend: 'over' }])
    .png()
    .toBuffer();

  return sharp(falBuf)
    .composite([{ input: fadePatch, left, top }])
    .png()
    .toBuffer();
}
