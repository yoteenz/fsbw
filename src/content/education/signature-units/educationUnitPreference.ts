import type { WigUnitSlug } from '../care/productCatalog';
import { isKnownSignatureUnitId } from './registry';

const FOLLOW_UNIT_KEY = 'psaEducationFollowUnit';
const CONTINUITY_UNIT_KEY = 'psaEducationContinuityUnit';

export function readFollowThisUnitPreference(): WigUnitSlug | null {
  try {
    const raw = localStorage.getItem(FOLLOW_UNIT_KEY);
    if (!raw) return null;
    return isKnownSignatureUnitId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeFollowThisUnitPreference(unitId: WigUnitSlug | null): void {
  try {
    if (!unitId) {
      localStorage.removeItem(FOLLOW_UNIT_KEY);
      return;
    }
    localStorage.setItem(FOLLOW_UNIT_KEY, unitId);
  } catch {
    /* ignore */
  }
}

export function readContinuityUnitPreference(): WigUnitSlug | null {
  try {
    const raw = localStorage.getItem(CONTINUITY_UNIT_KEY);
    if (!raw) return null;
    return isKnownSignatureUnitId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeContinuityUnitPreference(unitId: WigUnitSlug | null): void {
  try {
    if (!unitId) {
      localStorage.removeItem(CONTINUITY_UNIT_KEY);
      return;
    }
    localStorage.setItem(CONTINUITY_UNIT_KEY, unitId);
  } catch {
    /* ignore */
  }
}
