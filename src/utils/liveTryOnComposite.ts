import type { CanvasPoint } from './liveTryOnYaw';
import { faceContourPolygonFromLandmarks, type NormPoint } from './liveTryOnYaw';

type Placement = { cx: number; cy: number; width: number; rotationRad: number };

/** Lace hairline in prepped overlay assets sits near this fraction from the top. */
const WIG_ASSET_HAIRLINE_Y = 0.27;

function fillPolygon(ctx: CanvasRenderingContext2D, points: CanvasPoint[]): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fill();
}

/** Clears wig pixels inside the tracked face so the live camera shows through. */
export function punchFaceContourFromWigLayer(
  ctx: CanvasRenderingContext2D,
  contour: CanvasPoint[],
  featherPx = 4
): void {
  if (contour.length < 3) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  if (featherPx > 0) {
    ctx.filter = `blur(${featherPx}px)`;
  }
  fillPolygon(ctx, contour);
  ctx.filter = 'none';
  ctx.restore();
}

/** Subtle tracked outline — replaces the old static positioning oval. */
export function strokeFaceTrackingGuide(ctx: CanvasRenderingContext2D, contour: CanvasPoint[]): void {
  if (contour.length < 3) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(235, 28, 36, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(contour[0].x, contour[0].y);
  for (let i = 1; i < contour.length; i++) ctx.lineTo(contour[i].x, contour[i].y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw hair overlay aligned to tracked head pose; punch uses the face mesh (not a fixed oval)
 * so portrait background baked into bad cuts does not show through.
 */
export function drawWigOverlayTracked(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  wigImg: HTMLImageElement,
  placement: Placement,
  landmarks: NormPoint[],
  offscreen: HTMLCanvasElement
): CanvasPoint[] | null {
  const contour = faceContourPolygonFromLandmarks(landmarks, canvasW, canvasH, {
    mirror: true,
    expand: 1.14,
  });
  if (!contour) return null;

  if (offscreen.width !== canvasW || offscreen.height !== canvasH) {
    offscreen.width = canvasW;
    offscreen.height = canvasH;
  }
  const octx = offscreen.getContext('2d');
  if (!octx) return contour;

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
  octx.globalAlpha = 0.98;
  octx.drawImage(wigImg, -drawW / 2, topOffset, drawW, drawH);
  octx.restore();

  punchFaceContourFromWigLayer(octx, contour);

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();

  return contour;
}

/** @deprecated Use drawWigOverlayTracked */
export function drawWigOverlayWithFaceHole(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  wigImg: HTMLImageElement,
  placement: Placement,
  landmarks: NormPoint[],
  offscreen: HTMLCanvasElement
): void {
  drawWigOverlayTracked(ctx, canvasW, canvasH, wigImg, placement, landmarks, offscreen);
}
