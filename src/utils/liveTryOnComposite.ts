import type { CanvasPoint } from './liveTryOnYaw';
import {
  belowChinPunchPolygon,
  faceContourPolygonFromLandmarks,
  type NormPoint,
} from './liveTryOnYaw';

type Placement = { cx: number; cy: number; width: number; rotationRad: number };

/**
 * Lace band in pre-generated overlay PNGs — fraction from top of full wig bitmap.
 * When drawing the head band only, see HAIRLINE_IN_BAND.
 */
const WIG_ASSET_HAIRLINE_Y = 0.17;

/** Top fraction of overlay PNG to use (excludes chest-length portrait hair). */
const WIG_HEAD_BAND_HEIGHT = 0.46;

const HAIRLINE_IN_BAND = WIG_ASSET_HAIRLINE_Y / WIG_HEAD_BAND_HEIGHT;

function clipToPolygon(ctx: CanvasRenderingContext2D, points: CanvasPoint[]): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.clip();
}

function fillPolygon(ctx: CanvasRenderingContext2D, points: CanvasPoint[]): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fill();
}

/** Remove wig pixels inside a polygon (face zone or below-chin strip). */
function punchFromWigLayer(
  ctx: CanvasRenderingContext2D,
  contour: CanvasPoint[],
  featherPx: number
): void {
  if (contour.length < 3) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  if (featherPx > 0) ctx.filter = `blur(${featherPx}px)`;
  fillPolygon(ctx, contour);
  ctx.filter = 'none';
  ctx.restore();
}

/** Paint live camera back over the face mesh — eliminates hole-punch artifacts. */
export function drawMirroredVideoClippedToFace(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvasW: number,
  canvasH: number,
  faceContour: CanvasPoint[]
): void {
  if (faceContour.length < 3) return;
  ctx.save();
  clipToPolygon(ctx, faceContour);
  ctx.translate(canvasW, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvasW, canvasH);
  ctx.restore();
}

/**
 * Realistic stack: full video → head hair outside face mask → live face reinjected on top.
 * Portrait overlays include bust/chest hair; we crop to the head band and punch below the jaw.
 */
export function drawWigOverlayTracked(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  wigImg: HTMLImageElement,
  placement: Placement,
  landmarks: NormPoint[],
  offscreen: HTMLCanvasElement,
  video: HTMLVideoElement
): void {
  const punchContour = faceContourPolygonFromLandmarks(landmarks, canvasW, canvasH, {
    mirror: true,
    expand: 1.18,
  });
  const faceContour = faceContourPolygonFromLandmarks(landmarks, canvasW, canvasH, {
    mirror: true,
    expand: 1.05,
  });
  const belowChin = belowChinPunchPolygon(landmarks, canvasW, canvasH, true);
  if (!punchContour || !faceContour) return;

  if (offscreen.width !== canvasW || offscreen.height !== canvasH) {
    offscreen.width = canvasW;
    offscreen.height = canvasH;
  }
  const octx = offscreen.getContext('2d');
  if (!octx) return;

  octx.clearRect(0, 0, canvasW, canvasH);

  const drawW = placement.width;
  const srcBandH = wigImg.naturalHeight * WIG_HEAD_BAND_HEIGHT;
  const aspect = srcBandH / Math.max(1, wigImg.naturalWidth);
  const drawH = drawW * aspect;
  const cx = canvasW - placement.cx;
  const rot = -placement.rotationRad;
  const topOffset = -drawH * HAIRLINE_IN_BAND;

  octx.save();
  octx.translate(cx, placement.cy);
  octx.rotate(rot);
  octx.drawImage(
    wigImg,
    0,
    0,
    wigImg.naturalWidth,
    srcBandH,
    -drawW / 2,
    topOffset,
    drawW,
    drawH
  );
  octx.restore();

  punchFromWigLayer(octx, punchContour, 5);
  if (belowChin) punchFromWigLayer(octx, belowChin, 0);

  ctx.save();
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();

  drawMirroredVideoClippedToFace(ctx, video, canvasW, canvasH, faceContour);
}

/** Dev-only face outline. */
export function strokeFaceTrackingGuide(ctx: CanvasRenderingContext2D, contour: CanvasPoint[]): void {
  if (contour.length < 3) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(235, 28, 36, 0.45)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(contour[0].x, contour[0].y);
  for (let i = 1; i < contour.length; i++) ctx.lineTo(contour[i].x, contour[i].y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
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
  drawWigOverlayTracked(ctx, canvasW, canvasH, wigImg, placement, landmarks, offscreen, document.createElement('video'));
}
