import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
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

/**
 * Server post-process: wipe the full client panel to template (removes Fal ghost layers),
 * Ideogram-cut the hair-edited panel, bottom-anchor + fade in the inner window, composite back.
 */
export async function applyClientPhotoBottomFade(
  falBuf: Buffer,
  templateBuf: Buffer,
  fadeRect: PixelRect,
  panelRect: PixelRect,
  fal?: FalClient | null
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { left, top, width, height } = fadeRect;
  const {
    left: panelLeft,
    top: panelTop,
    width: panelWidth,
    height: panelHeight,
  } = panelRect;

  const maskPng = await sharp(buildSymmetricalBottomFadeMaskSvg(width, height)).png().toBuffer();

  const falPanelRaw = await sharp(falBuf)
    .extract({ left: panelLeft, top: panelTop, width: panelWidth, height: panelHeight })
    .ensureAlpha()
    .png()
    .toBuffer();

  const cutout = await removeBackgroundFromClientRegion(fal ?? null, falPanelRaw);
  const falRegion = await bottomAnchorCutoutInCanvas(cutout, width, height);

  const maskedPhoto = await sharp(falRegion)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const templatePanel = await sharp(templateBuf)
    .extract({ left: panelLeft, top: panelTop, width: panelWidth, height: panelHeight })
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

  const fadeLeftInPanel = left - panelLeft;
  const fadeTopInPanel = top - panelTop;

  const panelWithPhoto = await sharp(templatePanel)
    .composite([{ input: fadePatch, left: fadeLeftInPanel, top: fadeTopInPanel }])
    .png()
    .toBuffer();

  return sharp(falBuf)
    .composite([{ input: panelWithPhoto, left: panelLeft, top: panelTop }])
    .png()
    .toBuffer();
}
