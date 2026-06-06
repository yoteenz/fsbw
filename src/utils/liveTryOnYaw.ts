/** Normalized landmark point from MediaPipe (0–1, origin top-left). */
export type NormPoint = { x: number; y: number };

/** MediaPipe Face Mesh indices used for pose + placement. */
export const FACE_LM = {
  noseTip: 1,
  forehead: 10,
  chin: 152,
  leftTemple: 234,
  rightTemple: 454,
  jawLeft: 172,
  jawRight: 400,
} as const;

/** Face skin outline (MediaPipe face mesh oval). */
export const FACE_MESH_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176,
  149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
] as const;

export type CanvasPoint = { x: number; y: number };

function mirrorX(x: number, canvasW: number, mirror: boolean): number {
  return mirror ? canvasW - x : x;
}

/**
 * Rough head yaw in [-1, 1]: negative = user turned to their left (camera sees more right cheek).
 */
export function estimateHeadYawNorm(landmarks: NormPoint[]): number {
  const nose = landmarks[FACE_LM.noseTip];
  const left = landmarks[FACE_LM.leftTemple];
  const right = landmarks[FACE_LM.rightTemple];
  if (!nose || !left || !right) return 0;
  const midX = (left.x + right.x) / 2;
  const halfW = Math.max(0.02, (right.x - left.x) / 2);
  return Math.max(-1, Math.min(1, (nose.x - midX) / halfW));
}

export function pickWigViewFromYaw(yaw: number): 'left' | 'front' | 'right' {
  if (yaw < -0.26) return 'left';
  if (yaw > 0.26) return 'right';
  return 'front';
}

/** Reduces L/F/R flicker when head pose hovers near thresholds. */
export function pickWigViewFromYawWithHysteresis(
  yaw: number,
  prev: 'left' | 'front' | 'right'
): 'left' | 'front' | 'right' {
  if (prev === 'left') {
    if (yaw > -0.1) return yaw > 0.26 ? 'right' : 'front';
    return 'left';
  }
  if (prev === 'right') {
    if (yaw < 0.1) return yaw < -0.26 ? 'left' : 'front';
    return 'right';
  }
  return pickWigViewFromYaw(yaw);
}

export function wigPlacementFromLandmarks(
  landmarks: NormPoint[],
  canvasW: number,
  canvasH: number
): { cx: number; cy: number; width: number; rotationRad: number } | null {
  const forehead = landmarks[FACE_LM.forehead];
  const chin = landmarks[FACE_LM.chin];
  const left = landmarks[FACE_LM.leftTemple];
  const right = landmarks[FACE_LM.rightTemple];
  if (!forehead || !chin || !left || !right) return null;

  const faceH = Math.abs(chin.y - forehead.y) * canvasH;
  const faceW = Math.abs(right.x - left.x) * canvasW;
  const cx = ((left.x + right.x) / 2) * canvasW;
  /** Lace front sits on the tracked forehead / upper brow. */
  const cy = forehead.y * canvasH + faceH * 0.08;
  const width = Math.max(faceW * 2.35, faceH * 2.05, canvasW * 0.52);
  const rotationRad = Math.atan2((right.y - left.y) * canvasH, (right.x - left.x) * canvasW);

  return { cx, cy, width, rotationRad };
}

/**
 * Tracked face contour in canvas pixels. Set mirror=true when the preview is horizontally flipped.
 */
export function faceContourPolygonFromLandmarks(
  landmarks: NormPoint[],
  canvasW: number,
  canvasH: number,
  opts?: { mirror?: boolean; expand?: number }
): CanvasPoint[] | null {
  const expand = opts?.expand ?? 1.07;
  const mirror = opts?.mirror ?? false;
  const raw: CanvasPoint[] = [];

  for (const idx of FACE_MESH_OVAL_INDICES) {
    const lm = landmarks[idx];
    if (!lm) continue;
    raw.push({
      x: mirrorX(lm.x * canvasW, canvasW, mirror),
      y: lm.y * canvasH,
    });
  }
  if (raw.length < 12) return null;

  const cx = raw.reduce((s, p) => s + p.x, 0) / raw.length;
  const cy = raw.reduce((s, p) => s + p.y, 0) / raw.length;
  return raw.map((p) => ({
    x: cx + (p.x - cx) * expand,
    y: cy + (p.y - cy) * expand,
  }));
}

/**
 * Punch only the center strip below the chin — removes chest-length portrait hair
 * without cutting the side panels that should wrap the jaw/cheeks.
 */
export function centerBeardPunchPolygon(
  landmarks: NormPoint[],
  canvasW: number,
  canvasH: number,
  mirror: boolean
): CanvasPoint[] | null {
  const chin = landmarks[FACE_LM.chin];
  const jawL = landmarks[FACE_LM.jawLeft];
  const jawR = landmarks[FACE_LM.jawRight];
  const left = landmarks[FACE_LM.leftTemple];
  const right = landmarks[FACE_LM.rightTemple];
  if (!chin || !jawL || !jawR || !left || !right) return null;

  const faceW = Math.abs(right.x - left.x) * canvasW;
  const faceH = Math.abs(chin.y - landmarks[FACE_LM.forehead]!.y) * canvasH;
  const chinLineY = chin.y * canvasH + Math.max(8, faceH * 0.07);
  const lx = mirrorX(jawL.x * canvasW, canvasW, mirror);
  const rx = mirrorX(jawR.x * canvasW, canvasW, mirror);
  const centerX = (lx + rx) / 2;
  const halfW = faceW * 0.42;

  return [
    { x: centerX - halfW, y: chinLineY },
    { x: centerX + halfW, y: chinLineY },
    { x: centerX + halfW, y: canvasH + 40 },
    { x: centerX - halfW, y: canvasH + 40 },
  ];
}

/** @deprecated Use centerBeardPunchPolygon — full-width punch breaks side hair wrap. */
export function belowChinPunchPolygon(
  landmarks: NormPoint[],
  canvasW: number,
  canvasH: number,
  mirror: boolean
): CanvasPoint[] | null {
  return centerBeardPunchPolygon(landmarks, canvasW, canvasH, mirror);
}

export function lerpPlacement(
  prev: { cx: number; cy: number; width: number; rotationRad: number },
  next: { cx: number; cy: number; width: number; rotationRad: number },
  t: number
): { cx: number; cy: number; width: number; rotationRad: number } {
  const a = Math.max(0, Math.min(1, t));
  return {
    cx: prev.cx + (next.cx - prev.cx) * a,
    cy: prev.cy + (next.cy - prev.cy) * a,
    width: prev.width + (next.width - prev.width) * a,
    rotationRad: prev.rotationRad + (next.rotationRad - prev.rotationRad) * a,
  };
}
