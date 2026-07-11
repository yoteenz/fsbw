import type { CreateExpertInviteInput, ExpertInvite } from './types';

const STORAGE_KEY = 'studioInstituteInvites_v1';

function readAll(): ExpertInvite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExpertInvite[];
  } catch {
    return [];
  }
}

function writeAll(invites: ExpertInvite[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
}

export function loadLocalInvites(): ExpertInvite[] {
  return readAll();
}

export function saveLocalInvite(invite: ExpertInvite): ExpertInvite {
  const all = readAll();
  const idx = all.findIndex((i) => i.id === invite.id || i.token === invite.token);
  if (idx >= 0) all[idx] = invite;
  else all.push(invite);
  writeAll(all);
  return invite;
}

export function deleteLocalInvite(id: string): void {
  writeAll(readAll().filter((i) => i.id !== id));
}

export function findLocalInviteByToken(token: string): ExpertInvite | null {
  return readAll().find((i) => i.token === token) ?? null;
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
  } catch {
    /* offline fallback */
  }
  return findLocalInviteByToken(token);
}

export async function fetchAllInvites(ownerKey: string): Promise<ExpertInvite[]> {
  try {
    const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
      headers: { 'X-Studio-Institute-Owner-Key': ownerKey },
    });
    if (res.ok) {
      const data = (await res.json()) as { invites?: ExpertInvite[] };
      const invites = data.invites ?? [];
      writeAll(invites);
      return invites;
    }
  } catch {
    /* fallback */
  }
  return loadLocalInvites();
}

export async function createInviteOnServer(
  ownerKey: string,
  input: CreateExpertInviteInput
): Promise<ExpertInvite> {
  const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Studio-Institute-Owner-Key': ownerKey,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'Failed to create invite');
  }
  const data = (await res.json()) as { invite: ExpertInvite };
  saveLocalInvite(data.invite);
  return data.invite;
}

export async function patchInviteOnServer(
  ownerKey: string,
  id: string,
  patch: Partial<ExpertInvite>
): Promise<ExpertInvite> {
  const res = await fetch(`${apiBase()}/api/studio-institute/invites`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Studio-Institute-Owner-Key': ownerKey,
    },
    body: JSON.stringify({ id, patch }),
  });
  if (!res.ok) throw new Error('Failed to update invite');
  const data = (await res.json()) as { invite: ExpertInvite };
  saveLocalInvite(data.invite);
  return data.invite;
}

export async function deleteInviteOnServer(ownerKey: string, id: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/studio-institute/invites?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'X-Studio-Institute-Owner-Key': ownerKey },
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
