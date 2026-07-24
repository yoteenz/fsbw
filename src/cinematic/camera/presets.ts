import type { FscsCameraId, FscsCameraPreset } from '../utilities/types';

function camera(
  id: FscsCameraId,
  label: string,
  opts: Omit<FscsCameraPreset, 'id' | 'label'>,
): FscsCameraPreset {
  return { id, label, ...opts };
}

/** Official FSCS camera presets — quiet, architectural, premium */
export const FSCS_CAMERA_PRESETS: Record<FscsCameraId, FscsCameraPreset> = {
  'drone-push': camera('drone-push', 'Drone Push', {
    movementSpeed: 0.35,
    acceleration: 0.12,
    framing: 'wide',
    focalLengthSim: 24,
    parallax: 0.65,
    durationMs: 4200,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  'slow-push': camera('slow-push', 'Slow Push', {
    movementSpeed: 0.22,
    acceleration: 0.08,
    framing: 'medium',
    focalLengthSim: 35,
    parallax: 0.35,
    durationMs: 3600,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  'side-tracking': camera('side-tracking', 'Side Tracking', {
    movementSpeed: 0.4,
    acceleration: 0.15,
    framing: 'medium',
    focalLengthSim: 40,
    parallax: 0.55,
    durationMs: 3200,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  }),
  'rear-follow': camera('rear-follow', 'Rear Follow', {
    movementSpeed: 0.38,
    acceleration: 0.14,
    framing: 'medium',
    focalLengthSim: 35,
    parallax: 0.48,
    durationMs: 3800,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  'front-tracking': camera('front-tracking', 'Front Tracking', {
    movementSpeed: 0.36,
    acceleration: 0.13,
    framing: 'medium',
    focalLengthSim: 50,
    parallax: 0.42,
    durationMs: 3400,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  orbit: camera('orbit', 'Orbit', {
    movementSpeed: 0.28,
    acceleration: 0.1,
    framing: 'hero',
    focalLengthSim: 45,
    parallax: 0.72,
    durationMs: 4800,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  pedestal: camera('pedestal', 'Pedestal', {
    movementSpeed: 0.18,
    acceleration: 0.06,
    framing: 'wide',
    focalLengthSim: 28,
    parallax: 0.25,
    durationMs: 3000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  }),
  reveal: camera('reveal', 'Reveal', {
    movementSpeed: 0.2,
    acceleration: 0.09,
    framing: 'wide',
    focalLengthSim: 32,
    parallax: 0.38,
    durationMs: 4000,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  'static-luxury': camera('static-luxury', 'Static Luxury', {
    movementSpeed: 0,
    acceleration: 0,
    framing: 'medium',
    focalLengthSim: 50,
    parallax: 0.08,
    durationMs: 2800,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  'macro-detail': camera('macro-detail', 'Macro Detail', {
    movementSpeed: 0.12,
    acceleration: 0.05,
    framing: 'macro',
    focalLengthSim: 85,
    parallax: 0.15,
    durationMs: 2400,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  'hero-product': camera('hero-product', 'Hero Product', {
    movementSpeed: 0.16,
    acceleration: 0.07,
    framing: 'hero',
    focalLengthSim: 65,
    parallax: 0.32,
    durationMs: 3200,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
  'architectural-reveal': camera('architectural-reveal', 'Architectural Reveal', {
    movementSpeed: 0.24,
    acceleration: 0.1,
    framing: 'wide',
    focalLengthSim: 24,
    parallax: 0.58,
    durationMs: 5200,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  }),
};

export function resolveCameraPreset(id: FscsCameraId): FscsCameraPreset {
  return FSCS_CAMERA_PRESETS[id];
}
