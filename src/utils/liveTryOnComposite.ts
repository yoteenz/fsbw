import type { NormPoint } from './liveTryOnYaw';
import { faceOvalFromLandmarks } from './liveTryOnYaw';

type Placement = { cx: number; cy: number; width: number; rotationRad: number };

/**
 * Draw wig overlay and punch a soft face hole so the live camera face shows through
 * (hides mannequin face when Fal assets still include the bust).
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

  octx.save();
  octx.translate(cx, placement.cy);
  octx.rotate(rot);
  octx.globalAlpha = 0.96;
  octx.drawImage(wigImg, -drawW / 2, -drawH * 0.1, drawW, drawH);
  octx.restore();

  const oval = faceOvalFromLandmarks(landmarks, canvasW, canvasH);
  if (oval) {
    const faceCx = canvasW - oval.cx;
    octx.save();
    octx.globalCompositeOperation = 'destination-out';
    octx.fillStyle = '#000';
    octx.beginPath();
    octx.ellipse(faceCx, oval.cy, oval.rx, oval.ry, 0, 0, Math.PI * 2);
    octx.fill();
    octx.globalAlpha = 0.45;
    octx.beginPath();
    octx.ellipse(faceCx, oval.cy, oval.rx * 1.12, oval.ry * 1.1, 0, 0, Math.PI * 2);
    octx.fill();
    octx.restore();
  }

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}
