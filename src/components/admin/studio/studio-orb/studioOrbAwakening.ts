import { scopeStorageKey } from '../../../../studio-os-core/workspace/storage';
import {
  readStudioOsStorageValue,
  removeStudioOsStorageValue,
  writeStudioOsStorageValue,
} from '../../../../utils/studioOsBrowserStorage';

const BASE_KEY = 'studioOs_studioOrbAwakening_v1';

/** In-memory seen flags — survives localStorage quota failures for this session. */
const awakeningSeenMemory = new Set<string>();

function awakeningKey(organizationId: string): string {
  return scopeStorageKey(BASE_KEY, organizationId);
}

export function hasSeenStudioOrbAwakening(organizationId: string): boolean {
  if (!organizationId) return false;
  if (awakeningSeenMemory.has(organizationId)) return true;
  return readStudioOsStorageValue(awakeningKey(organizationId)) === '1';
}

export function markStudioOrbAwakeningSeen(organizationId: string): void {
  if (!organizationId) return;
  awakeningSeenMemory.add(organizationId);
  writeStudioOsStorageValue(awakeningKey(organizationId), '1');
}

export function resetStudioOrbAwakening(organizationId: string): void {
  if (!organizationId) return;
  awakeningSeenMemory.delete(organizationId);
  removeStudioOsStorageValue(awakeningKey(organizationId));
}
