import type { CameraAnchorSpec } from './construction-plan-schema';

export const CAMERA_ANCHOR_SYSTEM_VERSION = 'camera-anchor-system.v1';

export type CameraAnchorPurpose = CameraAnchorSpec['purpose'];

export const STANDARD_CAMERA_PURPOSES: CameraAnchorPurpose[] = [
  'arrival',
  'overview',
  'hero',
  'walkthrough',
  'inspection',
  'photo',
];

export function defineCameraAnchors(anchors: CameraAnchorSpec[]): CameraAnchorSpec[] {
  return anchors;
}

export function resolveCameraAnchor(
  anchors: CameraAnchorSpec[],
  anchorId: string
): CameraAnchorSpec | null {
  return anchors.find((a) => a.anchorId === anchorId) ?? null;
}

export function assertCameraAnchorExists(input: {
  anchors: CameraAnchorSpec[];
  anchorId: string;
}): { ok: true; anchor: CameraAnchorSpec } | { ok: false; code: string } {
  const anchor = resolveCameraAnchor(input.anchors, input.anchorId);
  if (!anchor) return { ok: false, code: 'CAMERA_ANCHOR_NOT_FOUND' };
  return { ok: true, anchor };
}

/** Models never invent perspective — all renders use blueprint anchors */
export function selectRenderCamera(input: {
  anchors: CameraAnchorSpec[];
  purpose: CameraAnchorPurpose;
}): CameraAnchorSpec | null {
  return input.anchors.find((a) => a.purpose === input.purpose) ?? null;
}
