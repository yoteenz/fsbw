/**
 * Ephemeral Validation Registry™ — session-scoped shell/layer mounts for Experience Lab.
 * Never writes to Asset Registry. Never issues Production Authorization.
 */

import type { ValidationEnvironmentShell } from '../creative-studio-preview/environment-shell';
import { recipeToLayerRecord } from '../creative-studio-preview/environment-shell';
import type { SceneStackLayerId, SceneStackLayerRecord } from './types';
import { logCompilerEvent } from '../../studio-os/diagnostics/world-compiler-investigation';

export const EPHEMERAL_VALIDATION_TTL_MS = 30 * 60 * 1000;

function dispatchHydrated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('studio-os-scene-stack-hydrated'));
}

type SessionEntry = {
  previewSessionId: string;
  shell: ValidationEnvironmentShell;
  layerOverlays: Map<string, SceneStackLayerRecord>;
  expiresAt: number;
};

const sessions = new Map<string, SessionEntry>();

function sessionKey(previewSessionId: string): string {
  return previewSessionId;
}

function layerOverlayKey(
  previewSessionId: string,
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): string {
  return `${previewSessionId}:${departmentId}:${projectId}:${stationId}:${layerId}`;
}

export function clearValidationPreviewSession(previewSessionId: string): void {
  logCompilerEvent('SHELL_DELETED', 'ephemeral-validation-registry.clearValidationPreviewSession', {
    detail: { previewSessionId },
  });
  sessions.delete(sessionKey(previewSessionId));
}

export function registerValidationEnvironmentShell(shell: ValidationEnvironmentShell): void {
  logCompilerEvent('SHELL_REGISTERED', 'ephemeral-validation-registry.registerValidationEnvironmentShell', {
    shellId: shell.shellId,
    detail: { previewSessionId: shell.previewSessionId, stationId: shell.stationId },
  });
  const key = sessionKey(shell.previewSessionId);
  const layerRec = recipeToLayerRecord(shell, shell);
  const overlays = new Map<string, SceneStackLayerRecord>();
  overlays.set(
    layerOverlayKey(shell.previewSessionId, shell.departmentId, shell.projectId, shell.stationId, 'environment-shell'),
    { id: shell.shellId, ...layerRec }
  );

  sessions.set(key, {
    previewSessionId: shell.previewSessionId,
    shell,
    layerOverlays: overlays,
    expiresAt: Date.parse(shell.expiresAt),
  });

  dispatchHydrated();
}

export function getValidationEnvironmentShell(
  previewSessionId: string
): ValidationEnvironmentShell | null {
  const entry = sessions.get(sessionKey(previewSessionId));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    sessions.delete(sessionKey(previewSessionId));
    return null;
  }
  return entry.shell;
}

export function getEphemeralLayerRecord(
  previewSessionId: string | null,
  departmentId: string,
  projectId: string,
  stationId: string,
  layerId: SceneStackLayerId
): SceneStackLayerRecord | null {
  if (!previewSessionId) return null;
  const entry = sessions.get(sessionKey(previewSessionId));
  if (!entry || Date.now() > entry.expiresAt) return null;
  return (
    entry.layerOverlays.get(
      layerOverlayKey(previewSessionId, departmentId, projectId, stationId, layerId)
    ) ?? null
  );
}

export function listActiveValidationSessions(): string[] {
  const now = Date.now();
  for (const [id, entry] of sessions) {
    if (now > entry.expiresAt) sessions.delete(id);
  }
  return Array.from(sessions.keys());
}
