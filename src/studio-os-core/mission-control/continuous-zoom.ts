import type { ContinuousScaleLevel } from './types';

export type ContinuousZoomCamera = {
  scale: number;
  rotateX: number;
  translateY: number;
  tableClass: string;
  transitionMs: number;
};

const ZOOM_CAMERA: Partial<Record<ContinuousScaleLevel, ContinuousZoomCamera>> = {
  civilization: { scale: 1, rotateX: 58, translateY: 0, tableClass: 'is-zoom-civilization', transitionMs: 900 },
  industry: { scale: 1.04, rotateX: 56, translateY: -1, tableClass: 'is-zoom-industry', transitionMs: 850 },
  constellation: { scale: 1.08, rotateX: 54, translateY: -2, tableClass: 'is-zoom-constellation', transitionMs: 850 },
  district: { scale: 1.14, rotateX: 50, translateY: -3, tableClass: 'is-zoom-district', transitionMs: 800 },
  campus: { scale: 1.2, rotateX: 48, translateY: -4, tableClass: 'is-zoom-campus', transitionMs: 780 },
  building: { scale: 1.32, rotateX: 44, translateY: -6, tableClass: 'is-zoom-building', transitionMs: 750 },
  floor: { scale: 1.42, rotateX: 40, translateY: -8, tableClass: 'is-zoom-floor', transitionMs: 720 },
  room: { scale: 1.52, rotateX: 36, translateY: -10, tableClass: 'is-zoom-room', transitionMs: 700 },
  workspace: { scale: 1.62, rotateX: 32, translateY: -12, tableClass: 'is-zoom-workspace', transitionMs: 680 },
  scene: { scale: 1.7, rotateX: 28, translateY: -14, tableClass: 'is-zoom-scene', transitionMs: 660 },
  'scene-assembly': { scale: 1.78, rotateX: 24, translateY: -16, tableClass: 'is-zoom-scene-assembly', transitionMs: 640 },
  layer: { scale: 1.85, rotateX: 20, translateY: -18, tableClass: 'is-zoom-layer', transitionMs: 620 },
};

const DEFAULT_CAMERA = ZOOM_CAMERA.civilization!;

export function resolveContinuousZoomCamera(scale: ContinuousScaleLevel): ContinuousZoomCamera {
  return ZOOM_CAMERA[scale] ?? DEFAULT_CAMERA;
}

export function continuousZoomStyle(camera: ContinuousZoomCamera): Record<string, string | number> {
  return {
    transform: `rotateX(${camera.rotateX}deg) scale(${camera.scale}) translateY(${camera.translateY}%)`,
    transitionDuration: `${camera.transitionMs}ms`,
  };
}
