import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export const CAMERA_SYSTEM_PREVIEW_VERSION = 'camera-system-preview.v1';

export type CameraPreviewNode = {
  anchorId: string;
  label: string;
  purpose: string;
  position: string;
  orientation: string;
  framing: { fov: number; aspectRatio: string; previewBounds: { left: string; top: string; width: string; height: string } };
};

export function buildCameraSystemPreview(plan: ConstructionPlan): CameraPreviewNode[] {
  const purposeFraming: Record<string, { fov: number; bounds: { left: string; top: string; width: string; height: string } }> = {
    arrival: { fov: 60, bounds: { left: '10%', top: '20%', width: '80%', height: '60%' } },
    overview: { fov: 45, bounds: { left: '5%', top: '10%', width: '90%', height: '70%' } },
    hero: { fov: 35, bounds: { left: '25%', top: '30%', width: '50%', height: '50%' } },
    inspection: { fov: 25, bounds: { left: '30%', top: '35%', width: '40%', height: '45%' } },
    walkthrough: { fov: 55, bounds: { left: '15%', top: '25%', width: '70%', height: '55%' } },
    photo: { fov: 40, bounds: { left: '20%', top: '20%', width: '60%', height: '60%' } },
  };

  return plan.cameraAnchors.map((anchor) => {
    const framing = purposeFraming[anchor.purpose] ?? purposeFraming.overview;
    return {
      anchorId: anchor.anchorId,
      label: anchor.label,
      purpose: anchor.purpose,
      position: anchor.position,
      orientation: anchor.orientation,
      framing: {
        fov: framing.fov,
        aspectRatio: '16:9',
        previewBounds: framing.bounds,
      },
    };
  });
}

export function selectCameraFraming(cameras: CameraPreviewNode[], anchorId: string): CameraPreviewNode | null {
  return cameras.find((c) => c.anchorId === anchorId) ?? null;
}
