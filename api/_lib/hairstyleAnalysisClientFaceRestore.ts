import type { PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { intersectPixelRects } from './hairstyleAnalysisLayoutSlots.js';

/** Ellipse center relative to fade window (face sits upper-center in bottom-anchored portrait). */
const FACE_CX_PCT = 50;
const FACE_CY_PCT = 34;
const FACE_RX_PCT = 31;
const FACE_RY_PCT = 27;
const FACE_MASK_BLUR = 10;

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

function buildFaceEllipseMaskSvg(width: number, height: number): Buffer {
  const cx = (width * FACE_CX_PCT) / 100;
  const cy = (height * FACE_CY_PCT) / 100;
  const rx = (width * FACE_RX_PCT) / 100;
  const ry = (height * FACE_RY_PCT) / 100;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${FACE_MASK_BLUR}"/>
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

  const { left, top, width, height } = fadeInsidePanel;

  const [falRegion, clientLayer, faceMask] = await Promise.all([
    sharp(falBuf).extract({ left, top, width, height }).ensureAlpha().png().toBuffer(),
    scaleClientToFadeWindow(clientBuf, width, height),
    sharp(buildFaceEllipseMaskSvg(width, height)).png().toBuffer(),
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
