import type { ExperienceLabIconName } from './experience-lab-icon-registry';

/** Per-icon optical scale for consistent perceived size in UI (does not mutate PNGs). */
export const EXPERIENCE_LAB_ICON_OPTICAL_SCALE: Partial<Record<ExperienceLabIconName, number>> = {
  blueprint: 1.06,
  construction: 1.05,
  materials: 1.04,
  experienceLab: 1.04,
  splitView: 1.03,
  founderRender: 1.03,
  analytics: 1.04,
  performance: 1.03,
  zoomIn: 1.05,
  zoomOut: 1.05,
  pan: 1.04,
  orbit: 1.06,
  settings: 1.04,
  diagnostics: 1.05,
  dashboard: 1.04,
  users: 1.03,
};

export function resolveExperienceLabIconOpticalScale(name: ExperienceLabIconName): number {
  return EXPERIENCE_LAB_ICON_OPTICAL_SCALE[name] ?? 1;
}
