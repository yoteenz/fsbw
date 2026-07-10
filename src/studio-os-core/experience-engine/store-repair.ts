import {
  EXPERIENCE_ENGINE_STORAGE_KEY,
  EXPERIENCE_ENGINE_VERSION,
} from './constants';
import type { ExperienceEngineStore } from './types';

export function repairExperienceEngineGlobalStoreIfNeeded(): { repaired: boolean; reason?: string } {
  if (typeof window === 'undefined') return { repaired: false };

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(EXPERIENCE_ENGINE_STORAGE_KEY);
  } catch {
    return { repaired: false };
  }

  if (!raw) return { repaired: false };

  try {
    const parsed = JSON.parse(raw) as ExperienceEngineStore;
    if (!parsed || typeof parsed !== 'object') {
      localStorage.removeItem(EXPERIENCE_ENGINE_STORAGE_KEY);
      return { repaired: true, reason: 'studioOsExperienceEngine_v1:parse-invalid→removed' };
    }
    if (parsed.version && parsed.version !== EXPERIENCE_ENGINE_VERSION) {
      localStorage.removeItem(EXPERIENCE_ENGINE_STORAGE_KEY);
      return {
        repaired: true,
        reason: `studioOsExperienceEngine_v1.version:${parsed.version}→${EXPERIENCE_ENGINE_VERSION}`,
      };
    }
    if (!Array.isArray(parsed.profiles)) {
      localStorage.removeItem(EXPERIENCE_ENGINE_STORAGE_KEY);
      return { repaired: true, reason: 'studioOsExperienceEngine_v1.profiles:invalid→removed' };
    }
  } catch {
    localStorage.removeItem(EXPERIENCE_ENGINE_STORAGE_KEY);
    return { repaired: true, reason: 'studioOsExperienceEngine_v1:json-error→removed' };
  }

  return { repaired: false };
}
