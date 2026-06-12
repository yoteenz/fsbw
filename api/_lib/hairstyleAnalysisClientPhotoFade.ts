import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';

/** Symmetrical bottom fade — same on every generation (not Fal-painted). */
const FADE_START_PCT = 68;
const FADE_STOPS: Array<{ offset: number; opacity: number }> = [
  { offset: 0, opacity: 1 },
  { offset: FADE_START_PCT, opacity: 1 },
  { offset: 84, opacity: 0.55 },
  { offset: 93, opacity: 0.18 },
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
 * Mask the client photo bottom with a fixed horizontal gradient so the template
 * background (marble / panel interior) shows through — never Fal-painted clouds.
 */
export async function applyClientPhotoBottomFade(
  falBuf: Buffer,
  templateBuf: Buffer,
  rect: PixelRect
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { left, top, width, height } = rect;

  const maskPng = await sharp(buildSymmetricalBottomFadeMaskSvg(width, height)).png().toBuffer();
  const falRegion = await sharp(falBuf).extract({ left, top, width, height }).png().toBuffer();
  const templateRegion = await sharp(templateBuf).extract({ left, top, width, height }).png().toBuffer();

  const maskedPhoto = await sharp(falRegion)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const patch = await sharp(templateRegion).composite([{ input: maskedPhoto }]).png().toBuffer();

  return sharp(falBuf).composite([{ input: patch, left, top }]).png().toBuffer();
}
