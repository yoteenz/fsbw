import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { intersectPixelRects } from './hairstyleAnalysisLayoutSlots.js';

/** Ellipse center relative to fade window (face sits upper-center in bottom-anchored portrait). */
const FACE_CX_PCT = 50;
const FACE_CY_PCT = 34;
const FACE_RX_PCT = 31;
const FACE_RY_PCT = 27;
const FACE_MASK_BLUR = 10;

/** Square MATCH thumb — face-centered ellipse inside the slot. */
const THUMB_FACE_CX_PCT = 50;
const THUMB_FACE_CY_PCT = 42;
const THUMB_FACE_RX_PCT = 38;
const THUMB_FACE_RY_PCT = 36;
const THUMB_MASK_BLUR = 6;

export function hairstyleAnalysisClientFaceRestoreEnabled(): boolean {
  const raw = process.env.HAIRSTYLE_ANALYSIS_CLIENT_FACE_RESTORE?.trim().toLowerCase();
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

function buildEllipseMaskSvg(
  width: number,
  height: number,
  cxPct: number,
  cyPct: number,
  rxPct: number,
  ryPct: number,
  blur: number
): Buffer {
  const cx = (width * cxPct) / 100;
  const cy = (height * cyPct) / 100;
  const rx = (width * rxPct) / 100;
  const ry = (height * ryPct) / 100;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${blur}"/>
    </filter>
  </defs>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="white" filter="url(#soft)"/>
</svg>`;
  return Buffer.from(svg);
}

/** Bottom-anchored portrait in fade window — matches Fal client-photo framing. */
async function scaleClientToFadeWindow(
  clientBuf: Buffer,
  fadeW: number,
  fadeH: number
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const rotated = await sharp(clientBuf).rotate().ensureAlpha().png().toBuffer();
  const meta = await sharp(rotated).metadata();
  const subW = meta.width ?? fadeW;
  const subH = meta.height ?? fadeH;

  const targetW = Math.round(fadeW * 0.94);
  const maxH = Math.round(fadeH * 0.98);
  const scale = Math.min(targetW / subW, maxH / subH);
  const scaledW = Math.max(1, Math.round(subW * scale));
  const scaledH = Math.max(1, Math.round(subH * scale));

  const scaled = await sharp(rotated).resize(scaledW, scaledH, { fit: 'fill' }).png().toBuffer();
  const left = Math.round((fadeW - scaledW) / 2);
  const top = fadeH - scaledH;

  return sharp({
    create: {
      width: fadeW,
      height: fadeH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: scaled, left, top }])
    .png()
    .toBuffer();
}

/** Face-centered square crop for MATCH 02–04 thumbnails. */
async function scaleClientToThumbWindow(clientBuf: Buffer, thumbW: number, thumbH: number): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const rotated = await sharp(clientBuf).rotate().ensureAlpha().png().toBuffer();
  const meta = await sharp(rotated).metadata();
  const subW = meta.width ?? thumbW;
  const subH = meta.height ?? thumbH;

  const cropSize = Math.min(subW, Math.max(thumbW, Math.round(subH * 0.52)));
  const cropLeft = Math.max(0, Math.round((subW - cropSize) / 2));
  const cropTop = Math.max(0, Math.round(subH * 0.06));

  return sharp(rotated)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: Math.min(cropSize, subW - cropLeft),
      height: Math.min(cropSize, subH - cropTop),
    })
    .resize(thumbW, thumbH, { fit: 'cover' })
    .png()
    .toBuffer();
}

async function pasteMaskedClientRegion(
  falBuf: Buffer,
  region: PixelRect,
  clientLayer: Buffer,
  maskSvg: Buffer
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const meta = await sharp(falBuf).metadata();
  const canvasW = meta.width ?? 2048;
  const canvasH = meta.height ?? 2560;
  const slot = clampExtractRect(region, canvasW, canvasH);
  const { left, top, width, height } = slot;

  const [falRegion, faceMask] = await Promise.all([
    sharp(falBuf).extract({ left, top, width, height }).ensureAlpha().png().toBuffer(),
    sharp(maskSvg).resize(width, height).png().toBuffer(),
  ]);

  const maskedClient = await sharp(clientLayer)
    .composite([{ input: faceMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const patchedRegion = await sharp(falRegion)
    .composite([{ input: maskedClient, blend: 'over' }])
    .png()
    .toBuffer();

  return sharp(falBuf)
    .composite([{ input: patchedRegion, left, top }])
    .png()
    .toBuffer();
}

/**
 * Paste the submitted client's real face (elliptical soft mask) over Fal-painted skin.
 * Hair outside the mask keeps Fal edits; identity inside the mask stays from the upload.
 */
export async function applyClientFaceRestore(
  falBuf: Buffer,
  clientBuf: Buffer,
  panelRect: PixelRect,
  fadeRect: PixelRect
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  const meta = await sharp(falBuf).metadata();
  const canvasW = meta.width ?? 2048;
  const canvasH = meta.height ?? 2560;

  const panel = clampExtractRect(panelRect, canvasW, canvasH);
  const fadeInsidePanel = intersectPixelRects(panel, fadeRect);
  if (!fadeInsidePanel) return falBuf;

  const { width, height } = fadeInsidePanel;
  const clientLayer = await scaleClientToFadeWindow(clientBuf, width, height);
  const maskSvg = buildEllipseMaskSvg(
    width,
    height,
    FACE_CX_PCT,
    FACE_CY_PCT,
    FACE_RX_PCT,
    FACE_RY_PCT,
    FACE_MASK_BLUR
  );

  return pasteMaskedClientRegion(falBuf, fadeInsidePanel, clientLayer, maskSvg);
}

/** Same client face on every MATCH 02–04 thumbnail — premium template only. */
export async function applyClientFaceRestoreToThumbnails(
  falBuf: Buffer,
  clientBuf: Buffer,
  thumbSlots: PixelRect[]
): Promise<Buffer> {
  if (thumbSlots.length === 0) return falBuf;

  let base = falBuf;
  for (const slot of thumbSlots) {
    const { width, height } = slot;
    const clientLayer = await scaleClientToThumbWindow(clientBuf, width, height);
    const maskSvg = buildEllipseMaskSvg(
      width,
      height,
      THUMB_FACE_CX_PCT,
      THUMB_FACE_CY_PCT,
      THUMB_FACE_RX_PCT,
      THUMB_FACE_RY_PCT,
      THUMB_MASK_BLUR
    );
    base = await pasteMaskedClientRegion(base, slot, clientLayer, maskSvg);
  }
  return base;
}
