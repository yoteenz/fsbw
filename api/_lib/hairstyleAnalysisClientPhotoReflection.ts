import { CLIENT_PHOTO_FADE_START_PCT } from './hairstyleAnalysisClientPhotoFade.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { intersectPixelRects } from './hairstyleAnalysisLayoutSlots.js';

/** Peak opacity for the mirror reflection (very subtle). */
const REFLECTION_MAX_OPACITY = 0.1;
/** Bottom portion of the fade window used as the flipped mirror source. */
const REFLECTION_SOURCE_FRACTION = 0.24;

function clampExtractRect(rect: PixelRect, imageW: number, imageH: number): PixelRect {
  const left = Math.max(0, Math.min(rect.left, imageW - 1));
  const top = Math.max(0, Math.min(rect.top, imageH - 1));
  const width = Math.max(1, Math.min(rect.width, imageW - left));
  const height = Math.max(1, Math.min(rect.height, imageH - top));
  return { left, top, width, height };
}

function buildReflectionOpacityMaskSvg(width: number, height: number, maxOpacity: number): Buffer {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="refl" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="white" stop-opacity="${maxOpacity}"/>
      <stop offset="55%" stop-color="white" stop-opacity="${maxOpacity * 0.45}"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#refl)"/>
</svg>`;
  return Buffer.from(svg);
}

/**
 * Subtle vertical mirror reflection below the client photo fade, filling empty panel space.
 * Runs after Fal (and optional bottom-fade post-process) on every generate.
 */
export async function applyClientPhotoMirrorReflection(
  imageBuf: Buffer,
  panelRect: PixelRect,
  fadeRect: PixelRect
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const meta = await sharp(imageBuf).metadata();
  const canvasW = meta.width ?? 2048;
  const canvasH = meta.height ?? 2560;

  const panel = clampExtractRect(panelRect, canvasW, canvasH);
  const fade = clampExtractRect(fadeRect, canvasW, canvasH);
  const fadeInsidePanel = intersectPixelRects(panel, fade);
  if (!fadeInsidePanel) return imageBuf;

  const reflectionTop =
    fadeInsidePanel.top + Math.round((fadeInsidePanel.height * CLIENT_PHOTO_FADE_START_PCT) / 100);
  const reflectionBottom = panel.top + panel.height;
  const reflectionHeight = reflectionBottom - reflectionTop;
  if (reflectionHeight < 12) return imageBuf;

  const sourceHeight = Math.max(
    12,
    Math.min(
      Math.round(fadeInsidePanel.height * REFLECTION_SOURCE_FRACTION),
      reflectionTop - fadeInsidePanel.top
    )
  );
  const sourceTop = reflectionTop - sourceHeight;

  const sourceStrip = await sharp(imageBuf)
    .extract({
      left: fadeInsidePanel.left,
      top: sourceTop,
      width: fadeInsidePanel.width,
      height: sourceHeight,
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  const flipped = await sharp(sourceStrip)
    .flip()
    .resize({ width: fadeInsidePanel.width, height: reflectionHeight, fit: 'fill' })
    .png()
    .toBuffer();

  const maskPng = await sharp(
    buildReflectionOpacityMaskSvg(fadeInsidePanel.width, reflectionHeight, REFLECTION_MAX_OPACITY)
  )
    .png()
    .toBuffer();

  const reflection = await sharp(flipped)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  return sharp(imageBuf)
    .composite([{ input: reflection, left: fadeInsidePanel.left, top: reflectionTop }])
    .png()
    .toBuffer();
}
