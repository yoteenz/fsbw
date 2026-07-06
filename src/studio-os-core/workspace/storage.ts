/** Active workspace persistence — localStorage key for studio os. */

import { STUDIO_PLATFORM_WORKSPACE_ID } from '../platform/schema';

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

export function readActiveWorkspaceIdFromStorage(): string {
  try {
    const raw = localStorage.getItem(STUDIO_OS_ACTIVE_WORKSPACE_KEY);
    if (raw && raw.trim()) return raw.trim();
  } catch {
    /* ignore */
  }
  return STUDIO_PLATFORM_WORKSPACE_ID;
}

export function clearActiveOrganizationFromStorage(): void {
  writeActiveWorkspaceIdToStorage(STUDIO_PLATFORM_WORKSPACE_ID);
}

export function writeActiveWorkspaceIdToStorage(workspaceId: string): void {
  localStorage.setItem(STUDIO_OS_ACTIVE_WORKSPACE_KEY, workspaceId);
  setRuntimeActiveWorkspaceId(workspaceId);
}

export function scopeStorageKey(baseKey: string, workspaceId?: string): string {
  const ws = workspaceId ?? getRuntimeActiveWorkspaceId();
  if (ws === STUDIO_PLATFORM_WORKSPACE_ID) {
    return `studioOs_platform_${baseKey}`;
  }
  return `studioOs_ws_${ws}_${baseKey}`;
}
