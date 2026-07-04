/** Active workspace persistence — localStorage key for StudioOS. */

export const STUDIO_OS_ACTIVE_WORKSPACE_KEY = 'studioOs_activeWorkspace_v1';

export const STUDIO_OS_DEFAULT_WORKSPACE_ID = 'frontal-slayer';

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
  return STUDIO_OS_DEFAULT_WORKSPACE_ID;
}

export function writeActiveWorkspaceIdToStorage(workspaceId: string): void {
  localStorage.setItem(STUDIO_OS_ACTIVE_WORKSPACE_KEY, workspaceId);
  setRuntimeActiveWorkspaceId(workspaceId);
}

export function scopeStorageKey(baseKey: string, workspaceId?: string): string {
  const ws = workspaceId ?? getRuntimeActiveWorkspaceId();
  return `studioOs_ws_${ws}_${baseKey}`;
}
