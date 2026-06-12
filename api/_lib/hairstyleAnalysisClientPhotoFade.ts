import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';

/** Symmetrical bottom fade — same on every generation (not Fal-painted). */
const FADE_START_PCT = 72;
const FADE_STOPS: Array<{ offset: number; opacity: number }> = [
  { offset: 0, opacity: 1 },
  { offset: FADE_START_PCT, opacity: 1 },
  { offset: 86, opacity: 0.5 },
  { offset: 94, opacity: 0.12 },
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

async function marbleUnderlay(
  sharp: Awaited<ReturnType<typeof import('sharp')['default']>>,
  templateBuf: Buffer,
  rect: PixelRect
): Promise<Buffer> {
  const meta = await sharp(templateBuf).metadata();
  const canvasW = meta.width ?? 2048;
  const stripW = Math.max(80, Math.min(rect.left + 24, canvasW));
  return sharp(templateBuf)
    .extract({ left: 0, top: rect.top, width: stripW, height: rect.height })
    .resize(rect.width, rect.height, { fit: 'cover', position: 'left' })
    .png()
    .toBuffer();
}

/**
 * Symmetrical alpha mask on the client photo — bottom fades to transparent over card marble
 * (not flat gray panel fill). Does not repaint or extend the photo.
 */
export async function applyClientPhotoBottomFade(
  falBuf: Buffer,
  templateBuf: Buffer,
  rect: PixelRect
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const { left, top, width, height } = rect;

  const maskPng = await sharp(buildSymmetricalBottomFadeMaskSvg(width, height)).png().toBuffer();
  const falRegion = await sharp(falBuf)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .png()
    .toBuffer();

  const maskedPhoto = await sharp(falRegion)
    .composite([{ input: maskPng, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const underlay = await marbleUnderlay(sharp, templateBuf, rect);
  const patch = await sharp(underlay).composite([{ input: maskedPhoto }]).png().toBuffer();

  return sharp(falBuf).composite([{ input: patch, left, top }]).png().toBuffer();
}
