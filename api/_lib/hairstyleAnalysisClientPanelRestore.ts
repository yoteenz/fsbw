import {
  bottomAnchorCutoutInCanvas,
  chromaKeyStudioBackgroundInPlace,
} from './hairstyleAnalysisClientPhotoCutout.js';
import { CLIENT_PHOTO_FADE_START_PCT } from './hairstyleAnalysisClientPhotoFade.js';
import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { intersectPixelRects } from './hairstyleAnalysisLayoutSlots.js';

const FADE_STOPS: Array<{ offset: number; opacity: number }> = [
  { offset: 0, opacity: 1 },
  { offset: CLIENT_PHOTO_FADE_START_PCT, opacity: 1 },
  { offset: 82, opacity: 0 },
  { offset: 100, opacity: 0 },
];

/** Free template: paste full step-1 client portrait into the photo window (not face-only mask). */
export function hairstyleAnalysisClientPanelRestoreEnabled(): boolean {
  const raw = process.env.HAIRSTYLE_ANALYSIS_CLIENT_PANEL_RESTORE?.trim().toLowerCase();
  if (raw === 'false' || raw === '0' || raw === 'no') return false;
  return true;
}

function clampExtractRect(rect: PixelRect, imageW: number, imageH: number): PixelRect {
  const left = Math.max(0, Math.min(rect.left, imageW - 1));
  const top = Math.max(0, Math.min(rect.top, imageH - 1));
  const width = Math.max(1, Math.min(rect.width, imageW - left));
  const height = Math.max(1, Math.min(rect.height, imageH - top));
  return { left, top, width, height };
}

function buildSymmetricalBottomFadeMaskSvg(width: number, height: number): Buffer {
  const stops = FADE_STOPS.map(
    (s) => `<stop offset="${s.offset}%" stop-color="white" stop-opacity="${s.opacity}"/>`
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

/**
 * Replace Fal-painted client panel with the upstream hair-edited selfie (step 1).
 * Full portrait composite — avoids elliptical face mask misalignment on the chest.
 */
export async function applyClientPanelPhotoRestore(
  falBuf: Buffer,
  templateBuf: Buffer,
  clientBuf: Buffer,
  panelRect: PixelRect,
  fadeRect: PixelRect
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const falMeta = await sharp(falBuf).metadata();
  const canvasW = falMeta.width ?? 2048;
  const canvasH = falMeta.height ?? 2560;

  const panel = clampExtractRect(panelRect, canvasW, canvasH);
  const fadeInsidePanel = intersectPixelRects(panel, fadeRect);
  if (!fadeInsidePanel) return falBuf;

  const { left, top, width, height } = fadeInsidePanel;

  const keyedClient = await chromaKeyStudioBackgroundInPlace(
    await sharp(clientBuf).rotate().ensureAlpha().png().toBuffer()
  );
  const anchoredClient = await bottomAnchorCutoutInCanvas(keyedClient, width, height);

  const maskPng = await sharp(buildSymmetricalBottomFadeMaskSvg(width, height)).png().toBuffer();
  const maskedClient = await sharp(anchoredClient)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const templateFadeWindow = await sharp(templateBuf)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();

  const fadePatch = await sharp(templateFadeWindow)
    .composite([{ input: maskedClient, blend: 'over' }])
    .png()
    .toBuffer();

  return sharp(falBuf).composite([{ input: fadePatch, left, top }]).png().toBuffer();
}
