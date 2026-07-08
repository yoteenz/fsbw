/** Active workspace persistence — localStorage key for studio os. */

import { STUDIO_PLATFORM_WORKSPACE_ID } from '../platform/schema';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../utils/safeLocalStorage';

export const STUDIO_OS_ACTIVE_WORKSPACE_KEY = 'studioOs_activeWorkspace_v1';

/** First production organization — legacy HQ routes only, never a platform default. */
export const STUDIO_OS_DEFAULT_WORKSPACE_ID = 'frontal-slayer';

/** Neutral platform tenant when no organization is selected. */
export { STUDIO_PLATFORM_WORKSPACE_ID };

let runtimeActiveWorkspaceId: string | null = null;

export function getRuntimeActiveWorkspaceId(): string {
  return runtimeActiveWorkspaceId ?? readActiveWorkspaceIdFromStorage();
}

export function setRuntimeActiveWorkspaceId(workspaceId: string): void {
  runtimeActiveWorkspaceId = workspaceId;
}

/** True when this workspace was already activated in the current page session. */
export function isRuntimeWorkspaceActive(workspaceId: string): boolean {
  return runtimeActiveWorkspaceId === workspaceId;
}

export function readActiveWorkspaceIdFromStorage(): string {
  const raw = safeLocalStorageGetItem(STUDIO_OS_ACTIVE_WORKSPACE_KEY);
  if (raw && raw.trim()) return raw.trim();
  return STUDIO_PLATFORM_WORKSPACE_ID;
}

export function clearActiveOrganizationFromStorage(): void {
  writeActiveWorkspaceIdToStorage(STUDIO_PLATFORM_WORKSPACE_ID);
}

export function writeActiveWorkspaceIdToStorage(workspaceId: string): void {
  safeLocalStorageSetItem(STUDIO_OS_ACTIVE_WORKSPACE_KEY, workspaceId);
  setRuntimeActiveWorkspaceId(workspaceId);
}

export function scopeStorageKey(baseKey: string, workspaceId?: string): string {
  const ws = workspaceId ?? getRuntimeActiveWorkspaceId();
  if (ws === STUDIO_PLATFORM_WORKSPACE_ID) {
    return `studioOs_platform_${baseKey}`;
  }
  return `studioOs_ws_${ws}_${baseKey}`;
}
