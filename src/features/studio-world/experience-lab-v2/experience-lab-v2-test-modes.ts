import type { ExperienceLabV2TestMode } from './experience-lab-v2.types';

const STORAGE_KEY = 'experienceLabV2_testMode_v1';

export function readExperienceLabV2TestMode(): ExperienceLabV2TestMode {
  if (typeof window === 'undefined') return 'READ_ONLY';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'MOCK' || raw === 'READ_ONLY' || raw === 'CONTROLLED_LIVE') return raw;
  } catch {
    /* ignore */
  }
  return 'READ_ONLY';
}

export function writeExperienceLabV2TestMode(mode: ExperienceLabV2TestMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function canPerformProductionWrite(mode: ExperienceLabV2TestMode): boolean {
  return mode === 'CONTROLLED_LIVE';
}

export function requiresLiveConfirmation(mode: ExperienceLabV2TestMode): boolean {
  return mode === 'CONTROLLED_LIVE';
}

export function testModeLabel(mode: ExperienceLabV2TestMode): string {
  switch (mode) {
    case 'MOCK':
      return 'MOCK / DESIGN REVIEW';
    case 'READ_ONLY':
      return 'READ-ONLY PRODUCTION';
    case 'CONTROLLED_LIVE':
      return 'CONTROLLED LIVE';
    default:
      return mode;
  }
}
