import type { CreateExpertInviteInput, ExpertInvite } from './types';
import { createInviteRecord, regenerateInviteToken } from './invite-manager';
import { hashInvitePin } from './invite-crypto';
import { getOwnerAuthToken } from './owner-password';

const STORAGE_KEY = 'studioInstituteInvites_v1';

function readAll(): ExpertInvite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExpertInvite[];
    return parsed.map(normalizeInvite);
  } catch {
    return [];
  }
}

function normalizeInvite(inv: ExpertInvite): ExpertInvite {
  return {
    ...inv,
    accessStatus: inv.accessStatus ?? 'active',
    welcomeNote: inv.welcomeNote ?? null,
    pinHash: inv.pinHash ?? null,
    hasPin: inv.hasPin ?? Boolean(inv.pinHash),
    revokedTokens: inv.revokedTokens ?? [],
  };
}

function writeAll(invites: ExpertInvite[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
}

export function loadLocalInvites(): ExpertInvite[] {
  return readAll();
}

export function saveLocalInvite(invite: ExpertInvite): ExpertInvite {
  const normalized = normalizeInvite(invite);
  const all = readAll();
  const idx = all.findIndex((i) => i.id === normalized.id || i.token === normalized.token);
  if (idx >= 0) all[idx] = normalized;
  else all.push(normalized);
  writeAll(all);
  return normalized;
}

export function deleteLocalInvite(id: string): void {
  writeAll(readAll().filter((i) => i.id !== id));
}

export function findLocalInviteByToken(token: string): ExpertInvite | null {
  const direct = readAll().find((i) => i.token === token);
  if (direct) return direct;
  return readAll().find((i) => i.revokedTokens?.includes(token)) ?? null;
}

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '') as string;
}

export async function fetchInviteByToken(token: string): Promise<ExpertInvite | null> {
  try {
    const res = await fetch(`${apiBase()}/api/studio-institute/invites?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = (await res.json()) as { invite?: ExpertInvite };
      if (data.invite) {
        saveLocalInvite(data.invite);
        return data.invite;
      }
    }
    if (res.status === 410 || res.status === 404) {
      const stale = findLocalInviteByToken(token);
      if (stale?.revokedTokens?.includes(token)) return null;
    }
  } catch {
    /* offline fallback */
  }
  const local = findLocalInviteByToken(token);
  if (local && local.token === token) return local;
  return null;
}

export async function fetchAllInvites(ownerAuthToken?: string): Promise<ExpertInvite[]> {
  const auth = ownerAuthToken ?? getOwnerAuthToken();
  if (!auth) return loadLocalInvites();
  try {
    const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
      headers: { 'X-Studio-Institute-Owner-Key': auth },
    });
    if (res.ok) {
      const data = (await res.json()) as { invites?: ExpertInvite[] };
      const invites = (data.invites ?? []).map(normalizeInvite);
      writeAll(invites);
      return invites;
    }
  } catch {
    /* fallback */
  }
  return loadLocalInvites();
}

export async function createInviteOnServer(
  ownerAuthToken: string,
  input: CreateExpertInviteInput
): Promise<ExpertInvite> {
  const pinHash = input.accessPin?.trim() ? await hashInvitePin(input.accessPin.trim()) : null;
  const payload = { ...input, pinHash, accessPin: undefined };
  const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Studio-Institute-Owner-Key': ownerAuthToken,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'Failed to create invite');
  }
  const data = (await res.json()) as { invite: ExpertInvite };
  saveLocalInvite(data.invite);
  return data.invite;
}

export async function createInviteLocal(input: CreateExpertInviteInput): Promise<ExpertInvite> {
  const pinHash = input.accessPin?.trim() ? await hashInvitePin(input.accessPin.trim()) : null;
  return saveLocalInvite(createInviteRecord(input, undefined, pinHash));
}

export async function patchInviteOnServer(
  ownerAuthToken: string,
  id: string,
  patch: Partial<ExpertInvite>
): Promise<ExpertInvite> {
  const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Studio-Institute-Owner-Key': ownerAuthToken,
    },
    body: JSON.stringify({ id, patch }),
  });
  if (!res.ok) throw new Error('Failed to update invite');
  const data = (await res.json()) as { invite: ExpertInvite };
  saveLocalInvite(data.invite);
  return data.invite;
}

export async function regenerateInviteOnServer(ownerAuthToken: string, id: string): Promise<ExpertInvite> {
  const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Studio-Institute-Owner-Key': ownerAuthToken,
    },
    body: JSON.stringify({ id, action: 'regenerate_token' }),
  });
  if (!res.ok) {
    const local = readAll().find((i) => i.id === id);
    if (local) {
      const next = saveLocalInvite(regenerateInviteToken(local));
      return next;
    }
    throw new Error('Failed to regenerate link');
  }
  const data = (await res.json()) as { invite: ExpertInvite };
  saveLocalInvite(data.invite);
  return data.invite;
}

export async function deleteInviteOnServer(ownerAuthToken: string, id: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/studio-institute/invites?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'X-Studio-Institute-Owner-Key': ownerAuthToken },
  });
  if (!res.ok) throw new Error('Failed to delete invite');
  deleteLocalInvite(id);
}

export async function syncInviteProgress(invite: ExpertInvite): Promise<ExpertInvite> {
  try {
    const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: invite.token,
        patch: {
          sessionId: invite.sessionId,
          progressPercent: invite.progressPercent,
          currentQuestionLabel: invite.currentQuestionLabel,
          currentQuestionIndex: invite.currentQuestionIndex,
          timeSpentMinutes: invite.timeSpentMinutes,
          lastActiveAt: invite.lastActiveAt,
          latestLesson: invite.latestLesson,
          knowledgeExtractedCount: invite.knowledgeExtractedCount,
          status: invite.status,
        },
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { invite: ExpertInvite };
      saveLocalInvite(data.invite);
      return data.invite;
    }
  } catch {
    saveLocalInvite(invite);
  }
  return invite;
}

export function storeActiveInviteToken(token: string): void {
  sessionStorage.setItem('studioInstituteActiveInvite_v1', token);
}

export function readActiveInviteToken(): string | null {
  return sessionStorage.getItem('studioInstituteActiveInvite_v1');
}

export function clearActiveInviteToken(): void {
  sessionStorage.removeItem('studioInstituteActiveInvite_v1');
}
