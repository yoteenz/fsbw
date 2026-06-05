/** Normalized landmark point from MediaPipe (0–1, origin top-left). */
export type NormPoint = { x: number; y: number };

/** MediaPipe Face Mesh indices used for pose + placement. */
export const FACE_LM = {
  noseTip: 1,
  forehead: 10,
  chin: 152,
  leftTemple: 234,
  rightTemple: 454,
} as const;

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
  if (yaw < -0.22) return 'left';
  if (yaw > 0.22) return 'right';
  return 'front';
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
  /** Anchor lace hairline to tracked forehead (not above it). */
  const cy = forehead.y * canvasH;
  /** Must exceed face width so hair frames the face; small scale + face-hole = fragment patches. */
  const width = Math.max(faceW * 3.05, faceH * 2.45, canvasW * 0.78);
  const rotationRad = Math.atan2((right.y - left.y) * canvasH, (right.x - left.x) * canvasW);

  return { cx, cy, width, rotationRad };
}

/** Face oval on canvas (camera space; x must be mirrored when drawing on mirrored preview). */
export function faceOvalFromLandmarks(
  landmarks: NormPoint[],
  canvasW: number,
  canvasH: number
): { cx: number; cy: number; rx: number; ry: number } | null {
  const forehead = landmarks[FACE_LM.forehead];
  const chin = landmarks[FACE_LM.chin];
  const left = landmarks[FACE_LM.leftTemple];
  const right = landmarks[FACE_LM.rightTemple];
  if (!forehead || !chin || !left || !right) return null;

  const faceW = Math.abs(right.x - left.x) * canvasW;
  const faceH = Math.abs(chin.y - forehead.y) * canvasH;
  const cx = ((left.x + right.x) / 2) * canvasW;
  const cy = ((forehead.y + chin.y) / 2) * canvasH;
  return {
    cx,
    cy,
    rx: Math.max(12, faceW * 0.4),
    ry: Math.max(14, faceH * 0.44),
  };
}
