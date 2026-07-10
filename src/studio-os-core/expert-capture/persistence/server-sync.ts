import { getAccessToken } from '../../../utils/api';
import type { ExpertCapturePersistedDocument, ExpertCaptureSyncResult } from './types';
import { getOrCreateGuestSessionId, readResumeToken, storeResumeToken, readDeviceMetadata } from './guest-identity';

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '') as string;
}

function authHeaders(sessionId: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const guest = getOrCreateGuestSessionId();
  headers['X-Guest-Session-Id'] = guest;
  const token = readResumeToken(sessionId);
  if (token) headers['X-Expert-Capture-Resume-Token'] = token;
  return headers;
}

export async function syncExpertCaptureDocument(input: {
  document: ExpertCapturePersistedDocument;
  companyId: string;
  profileId: string;
  interviewTemplateVersion?: string;
  expectedVersion?: number;
  claimDevice?: boolean;
  action?: 'sync' | 'claim_device' | 'archive_and_restart';
}): Promise<ExpertCaptureSyncResult> {
  try {
    const accessToken = await getAccessToken();
    const headers = authHeaders(input.document.session.meta.id);
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(`${apiBase()}/api/expert-capture/session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: input.action ?? 'sync',
        document: input.document,
        companyId: input.companyId,
        profileId: input.profileId,
        interviewTemplateVersion: input.interviewTemplateVersion ?? '1',
        expectedVersion: input.expectedVersion ?? input.document.sessionVersion,
        deviceId: readDeviceMetadata().deviceId,
        deviceMetadata: readDeviceMetadata(),
        guestSessionId: getOrCreateGuestSessionId(),
        claimDevice: input.claimDevice ?? false,
      }),
    });

    if (res.status === 409) {
      const data = (await res.json()) as {
        conflict?: boolean;
        deviceConflict?: boolean;
        document?: ExpertCapturePersistedDocument;
        sessionVersion?: number;
      };
      if (data.deviceConflict) {
        return {
          ok: false,
          conflict: true,
          serverDocument: data.document as ExpertCapturePersistedDocument,
          sessionVersion: data.sessionVersion ?? 1,
        };
      }
      if (data.conflict && data.document) {
        return {
          ok: false,
          conflict: true,
          serverDocument: data.document,
          sessionVersion: data.sessionVersion ?? 1,
        };
      }
    }

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string; offline?: boolean };
      return { ok: false, conflict: false, error: err.error ?? `Sync failed (${res.status})`, offline: err.offline };
    }

    const data = (await res.json()) as {
      sessionVersion: number;
      lastSavedAt: string;
      resumeToken?: string;
      serverConfirmed?: boolean;
    };
    if (data.resumeToken) storeResumeToken(input.document.session.meta.id, data.resumeToken);
    return {
      ok: true,
      sessionVersion: data.sessionVersion,
      lastSavedAt: data.lastSavedAt,
      resumeToken: data.resumeToken,
      serverConfirmed: data.serverConfirmed ?? true,
    };
  } catch (e) {
    return {
      ok: false,
      conflict: false,
      error: e instanceof Error ? e.message : 'Network error',
      offline: true,
    };
  }
}

export async function loadExpertCaptureDocument(input: {
  sessionId?: string;
  resumeToken?: string;
}): Promise<{ document: ExpertCapturePersistedDocument; sessionVersion: number; lastSavedAt: string } | null> {
  try {
    const params = new URLSearchParams();
    if (input.sessionId) params.set('sessionId', input.sessionId);
    const headers = authHeaders(input.sessionId ?? '');
    if (input.resumeToken) headers['X-Expert-Capture-Resume-Token'] = input.resumeToken;

    const accessToken = await getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(`${apiBase()}/api/expert-capture/session?${params.toString()}`, { headers });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      document: ExpertCapturePersistedDocument;
      sessionVersion: number;
      lastSavedAt: string;
    };
    if (input.sessionId && input.resumeToken) storeResumeToken(input.sessionId, input.resumeToken);
    return data;
  } catch {
    return null;
  }
}

export async function deleteExpertCaptureSession(sessionId: string): Promise<boolean> {
  try {
    const headers = authHeaders(sessionId);
    const accessToken = await getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(`${apiBase()}/api/expert-capture/session`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ sessionId, guestSessionId: getOrCreateGuestSessionId(), resumeToken: readResumeToken(sessionId) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listGuestExpertCaptureSessions(): Promise<unknown[]> {
  try {
    const headers = authHeaders('');
    headers['X-Guest-Session-Id'] = getOrCreateGuestSessionId();
    const res = await fetch(`${apiBase()}/api/expert-capture/session?list=1`, { headers });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: unknown[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}
