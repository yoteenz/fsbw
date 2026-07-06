/**
 * Cloud persistence for Studio OS workspace edits (adminStudio* keys).
 * Supabase app_config-style table: studio_os_workspace_state.
 * Cloud is source of truth; browser holds lightweight prefs only.
 */

import { getAccessToken } from './api';
import { isAdminStudioEditableKey, writeStudioOsMemoryValue } from './studioOsBrowserStorage';
import { scopeStorageKey, getRuntimeActiveWorkspaceId } from '../studio-os-core/workspace/storage';

const cloudHydratedKeys = new Set<string>();
const pendingCloudWrites = new Map<string, ReturnType<typeof setTimeout>>();

function resolveApiBase(): string {
  const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';
  return base;
}

function scopedEditableKey(baseKey: string, workspaceId?: string): string {
  return scopeStorageKey(baseKey, workspaceId ?? getRuntimeActiveWorkspaceId());
}

function cloudStateKey(baseKey: string, workspaceId: string): string {
  return `${workspaceId}::${baseKey}`;
}

/** Hydrate one workspace module state from cloud into memory cache (non-blocking). */
export function hydrateStudioWorkspaceStateFromCloud(
  baseKey: string,
  workspaceId?: string
): void {
  const ws = workspaceId ?? getRuntimeActiveWorkspaceId();
  const scoped = scopedEditableKey(baseKey, ws);
  const hydrationId = cloudStateKey(baseKey, ws);
  if (cloudHydratedKeys.has(hydrationId)) return;
  cloudHydratedKeys.add(hydrationId);

  void (async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const apiBase = resolveApiBase();
      const params = new URLSearchParams({ workspace_id: ws, key: baseKey });
      const res = await fetch(`${apiBase}/api/admin/studio-workspace-state?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const body = (await res.json()) as { value?: unknown };
      if (body.value === undefined || body.value === null) return;
      writeStudioOsMemoryValue(scoped, JSON.stringify(body.value));
      window.dispatchEvent(new CustomEvent('studio-os-cloud-state-hydrated', { detail: { key: baseKey, workspaceId: ws } }));
    } catch {
      /* cloud optional — memory/demo fallback */
    }
  })();
}

/** Debounced cloud write for user edits (never blocks UI). */
export function scheduleStudioWorkspaceStateCloudSave(
  baseKey: string,
  value: unknown,
  workspaceId?: string
): void {
  if (!isAdminStudioEditableKey(baseKey) && !baseKey.includes('adminStudio')) return;
  const ws = workspaceId ?? getRuntimeActiveWorkspaceId();
  const hydrationId = cloudStateKey(baseKey, ws);

  const prev = pendingCloudWrites.get(hydrationId);
  if (prev) clearTimeout(prev);

  pendingCloudWrites.set(
    hydrationId,
    setTimeout(() => {
      pendingCloudWrites.delete(hydrationId);
      void pushStudioWorkspaceStateToCloud(baseKey, value, ws);
    }, 800)
  );
}

async function pushStudioWorkspaceStateToCloud(
  baseKey: string,
  value: unknown,
  workspaceId: string
): Promise<void> {
  try {
    const token = await getAccessToken();
    if (!token) return;
    const apiBase = resolveApiBase();
    const res = await fetch(`${apiBase}/api/admin/studio-workspace-state`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workspace_id: workspaceId, key: baseKey, value }),
    });
    if (!res.ok) {
      console.warn('[studioWorkspaceCloudSync] cloud save failed:', baseKey, res.status);
    }
  } catch (error) {
    console.warn('[studioWorkspaceCloudSync] cloud save error:', baseKey, error);
  }
}

/** Flush pending cloud writes (e.g. before navigation). */
export function flushStudioWorkspaceCloudSync(): void {
  for (const timer of pendingCloudWrites.values()) {
    clearTimeout(timer);
  }
  pendingCloudWrites.clear();
}
