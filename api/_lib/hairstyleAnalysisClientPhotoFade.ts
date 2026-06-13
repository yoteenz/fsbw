import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import {
  intersectPixelRects,
  pixelRectRelativeTo,
} from './hairstyleAnalysisLayoutSlots.js';
import {
  bottomAnchorCutoutInCanvas,
  removeBackgroundFromClientRegion,
} from './hairstyleAnalysisClientPhotoCutout.js';

type FalClient = {
  storage: { upload: (file: File) => Promise<string> };
  subscribe: (
    model: string,
    opts: { input: Record<string, unknown>; logs?: boolean }
  ) => Promise<unknown>;
};

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

async function resizePng(buf: Buffer, width: number, height: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buf).resize(width, height, { fit: 'fill' }).png().toBuffer();
}

async function compositeOverlay(
  base: Buffer,
  overlay: Buffer,
  left: number,
  top: number
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const baseMeta = await sharp(base).metadata();
  const overlayMeta = await sharp(overlay).metadata();
  const baseW = baseMeta.width ?? 0;
  const baseH = baseMeta.height ?? 0;
  let overlayW = overlayMeta.width ?? 0;
  let overlayH = overlayMeta.height ?? 0;

  const maxW = baseW - left;
  const maxH = baseH - top;
  if (maxW <= 0 || maxH <= 0) {
    return base;
  }

  if (overlayW > maxW || overlayH > maxH) {
    overlay = await resizePng(overlay, maxW, maxH);
    overlayW = maxW;
    overlayH = maxH;
  }

  return sharp(base)
    .composite([{ input: overlay, left, top }])
    .png()
    .toBuffer();
}

function clampExtractRect(rect: PixelRect, imageW: number, imageH: number): PixelRect {
  const left = Math.max(0, Math.min(rect.left, imageW - 1));
  const top = Math.max(0, Math.min(rect.top, imageH - 1));
  const width = Math.max(1, Math.min(rect.width, imageW - left));
  const height = Math.max(1, Math.min(rect.height, imageH - top));
  return { left, top, width, height };
}

/**
 * Server post-process: Ideogram-cut the hair-edited panel, bottom-anchor + fade inside
 * the inner photo window only, then patch that window back onto the Fal card.
 * Never wipe the full client panel to template marble — that caused a floating white card
 * and duplicated TOP MATCH chrome over the portrait.
 */
export async function applyClientPhotoBottomFade(
  falBuf: Buffer,
  templateBuf: Buffer,
  fadeRect: PixelRect,
  panelRect: PixelRect,
  fal?: FalClient | null
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
  const { left: panelLeft, top: panelTop, width: panelWidth, height: panelHeight } = panel;

  const maskPng = await sharp(buildSymmetricalBottomFadeMaskSvg(width, height)).png().toBuffer();

  const falPanelRaw = await sharp(falBuf)
    .extract({ left: panelLeft, top: panelTop, width: panelWidth, height: panelHeight })
    .ensureAlpha()
    .png()
    .toBuffer();

  let cutoutPanel = await removeBackgroundFromClientRegion(fal ?? null, falPanelRaw);
  const cutoutMeta = await sharp(cutoutPanel).metadata();
  if (cutoutMeta.width !== panelWidth || cutoutMeta.height !== panelHeight) {
    cutoutPanel = await resizePng(cutoutPanel, panelWidth, panelHeight);
  }

  const fadeInPanel = pixelRectRelativeTo(panel, fadeInsidePanel);
  const cutoutFade = await sharp(cutoutPanel)
    .extract({
      left: fadeInPanel.left,
      top: fadeInPanel.top,
      width,
      height,
    })
    .png()
    .toBuffer();

  const falRegion = await bottomAnchorCutoutInCanvas(cutoutFade, width, height);

  const maskedPhoto = await sharp(await resizePng(falRegion, width, height))
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

  return compositeOverlay(falBuf, fadePatch, left, top);
}
