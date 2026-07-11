import type { ExpertInvite, InviteAuditEventType } from './types';

export type InviteAuditEntry = {
  id: string;
  inviteId: string;
  event: InviteAuditEventType;
  at: string;
};

const AUDIT_KEY = 'studioInstituteInviteAudit_v1';

function readAudit(): InviteAuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InviteAuditEntry[];
  } catch {
    return [];
  }
}

function writeAudit(entries: InviteAuditEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AUDIT_KEY, JSON.stringify(entries.slice(-500)));
}

export function recordInviteAudit(inviteId: string, event: InviteAuditEventType): InviteAuditEntry {
  const entry: InviteAuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    inviteId,
    event,
    at: new Date().toISOString(),
  };
  writeAudit([...readAudit(), entry]);
  void syncAuditToServer(inviteId, event);
  return entry;
}

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '') as string;
}

async function syncAuditToServer(inviteId: string, event: InviteAuditEventType): Promise<void> {
  try {
    await fetch(`${apiBase()}/api/studio-institute/invites`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...ownerAuthHeaders(),
      },
      body: JSON.stringify({
        id: inviteId,
        action: 'audit',
        auditEvent: event,
      }),
    });
  } catch {
    /* local audit is sufficient for MVP */
  }
}

export function listInviteAudit(inviteId: string): InviteAuditEntry[] {
  return readAudit().filter((e) => e.inviteId === inviteId);
}

export function auditLabel(event: InviteAuditEventType): string {
  return event.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Non-sensitive summary for owner dashboard */
export function summarizeInviteAudit(invite: ExpertInvite): string[] {
  return listInviteAudit(invite.id).slice(-5).map((e) => `${auditLabel(e.event)} · ${new Date(e.at).toLocaleString()}`);
}
