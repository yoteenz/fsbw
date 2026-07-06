import { scopeStorageKey } from '../../../../studio-os-core/workspace/storage';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../../utils/safeLocalStorage';

const BASE_KEY = 'studioOs_studioOrbAwakening_v1';

function awakeningKey(organizationId: string): string {
  return scopeStorageKey(BASE_KEY, organizationId);
}

export function hasSeenStudioOrbAwakening(organizationId: string): boolean {
  return safeLocalStorageGetItem(awakeningKey(organizationId)) === '1';
}

export function markStudioOrbAwakeningSeen(organizationId: string): void {
  safeLocalStorageSetItem(awakeningKey(organizationId), '1');
}

export function resetStudioOrbAwakening(organizationId: string): void {
  safeLocalStorageSetItem(awakeningKey(organizationId), '');
}
