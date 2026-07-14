import type { ExperienceLabIconName } from './experience-lab-icon-registry';

/** Per-icon optical scale for consistent perceived size in UI (does not mutate PNGs). */
export const EXPERIENCE_LAB_ICON_OPTICAL_SCALE: Partial<Record<ExperienceLabIconName, number>> = {
  blueprint: 1.06,
  construction: 1.05,
  materials: 1.12,
  experienceLab: 1.04,
  splitView: 1.03,
  founderRender: 1.03,
  analytics: 1.1,
  performance: 1.06,
  zoomIn: 1.08,
  zoomOut: 1.05,
  pan: 1.04,
  orbit: 1.06,
  settings: 1.04,
  diagnostics: 1.05,
  dashboard: 1.08,
  users: 1.03,
  camera: 1.12,
  playback: 1.08,
  perspective: 1.14,
  terminal: 1.1,
  permissions: 1.08,
  attachments: 1.05,
  team: 1.04,
  share: 1.04,
  lighting: 1.05,
};

export function resolveExperienceLabIconOpticalScale(name: ExperienceLabIconName): number {
  return EXPERIENCE_LAB_ICON_OPTICAL_SCALE[name] ?? 1;
}
