import type { NormPoint } from './liveTryOnYaw';
import { faceOvalFromLandmarks } from './liveTryOnYaw';

type Placement = { cx: number; cy: number; width: number; rotationRad: number };

/** Studio mannequin: lace hairline sits ~this fraction from the top of the asset. */
const WIG_ASSET_HAIRLINE_Y = 0.27;

function sampleAlpha(img: HTMLImageElement, u: number, v: number): number {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx || img.naturalWidth < 1) return 255;
  const sx = Math.min(img.naturalWidth - 1, Math.max(0, Math.floor(u * img.naturalWidth)));
  const sy = Math.min(img.naturalHeight - 1, Math.max(0, Math.floor(v * img.naturalHeight)));
  ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
  return ctx.getImageData(0, 0, 1, 1).data[3];
}

const punchCache = new WeakMap<HTMLImageElement, boolean>();

/** Hair-only PNGs already have a transparent face window — do not punch (that caused tiny fragments). */
export function wigImageNeedsFacePunch(img: HTMLImageElement): boolean {
  const cached = punchCache.get(img);
  if (cached !== undefined) return cached;
  const center = sampleAlpha(img, 0.5, 0.38);
  const hair = sampleAlpha(img, 0.5, 0.12);
  const punch = center > 80 && hair > 80;
  punchCache.set(img, punch);
  return punch;
}

/**
 * Draw wig large enough to frame the face; optional face hole only for opaque mannequin assets.
 */
export function drawWigOverlayWithFaceHole(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  wigImg: HTMLImageElement,
  placement: Placement,
  landmarks: NormPoint[],
  offscreen: HTMLCanvasElement
): void {
  if (offscreen.width !== canvasW || offscreen.height !== canvasH) {
    offscreen.width = canvasW;
    offscreen.height = canvasH;
  }
  const octx = offscreen.getContext('2d');
  if (!octx) return;

  octx.clearRect(0, 0, canvasW, canvasH);

  const drawW = placement.width;
  const aspect = wigImg.naturalHeight / Math.max(1, wigImg.naturalWidth);
  const drawH = drawW * aspect;
  const cx = canvasW - placement.cx;
  const rot = -placement.rotationRad;
  const topOffset = -drawH * WIG_ASSET_HAIRLINE_Y;

  octx.save();
  octx.translate(cx, placement.cy);
  octx.rotate(rot);
  octx.globalAlpha = 0.97;
  octx.drawImage(wigImg, -drawW / 2, topOffset, drawW, drawH);
  octx.restore();

  if (wigImageNeedsFacePunch(wigImg)) {
    const oval = faceOvalFromLandmarks(landmarks, canvasW, canvasH);
    if (oval) {
      const faceCx = canvasW - oval.cx;
      octx.save();
      octx.globalCompositeOperation = 'destination-out';
      octx.fillStyle = '#000';
      octx.beginPath();
      octx.ellipse(faceCx, oval.cy, oval.rx * 0.92, oval.ry * 0.9, 0, 0, Math.PI * 2);
      octx.fill();
      octx.restore();
    }
  }

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}
