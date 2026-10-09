import { authorizeInvite, hashInviteToken } from './invites';
import { visiblePrivateNotes } from './permissions';
import type { JournalDocument, JournalInvite, JournalReader, PrivateNote } from './types';

export type JournalMemory = {
  invites: JournalInvite[];
  documents: JournalDocument[];
};

export function createMemory(): JournalMemory {
  return { invites: [], documents: [] };
}

export function putInvite(memory: JournalMemory, invite: Omit<JournalInvite, 'tokenHash'> & { token: string }): JournalInvite {
  const stored: JournalInvite = {
    id: invite.id,
    organizationId: invite.organizationId,
    expertLabel: invite.expertLabel,
    workflowId: invite.workflowId,
    tokenHash: hashInviteToken(invite.token),
    expiresAt: invite.expiresAt,
    revokedAt: invite.revokedAt,
  };
  memory.invites = memory.invites.filter((item) => item.id !== stored.id).concat(stored);
  return stored;
}

export function revokeInvite(memory: JournalMemory, inviteId: string, reader: JournalReader): { ok: boolean; reason?: string } {
  if (reader.role !== 'owner' && reader.role !== 'founder') return { ok: false, reason: 'Only an owner can revoke an invite.' };
  const invite = memory.invites.find((item) => item.id === inviteId && item.organizationId === reader.organizationId);
  if (!invite) return { ok: false, reason: 'Invite not found.' };
  invite.revokedAt = new Date().toISOString();
  return { ok: true };
}

export function openJournal(input: {
  memory: JournalMemory;
  token: string;
  nowIso: string;
}): { ok: true; document: JournalDocument; reader: JournalReader } | { ok: false; status: number; error: string } {
  const matches = input.memory.invites.filter((invite) => invite.tokenHash === hashInviteToken(input.token));
  const invite = matches[0] ?? null;
  const auth = authorizeInvite({ invite, token: input.token, nowIso: input.nowIso });
  if (!auth.ok) {
    const status = auth.reason === 'revoked' || auth.reason === 'expired' || auth.reason === 'mismatch' ? 403 : 404;
    return { ok: false, status, error: 'This invite cannot open the journal.' };
  }
  const document = input.memory.documents.find(
    (item) => item.organizationId === auth.invite.organizationId && item.workflowId === auth.invite.workflowId,
  );
  if (!document) return { ok: false, status: 404, error: 'No draft exists for this invite.' };
  const reader: JournalReader = {
    organizationId: auth.invite.organizationId,
    role: 'expert',
    inviteId: auth.invite.id,
  };
  return {
    ok: true,
    reader,
    document: {
      ...document,
      privateNotes: visiblePrivateNotes(document.privateNotes, reader, document.organizationId),
      persistence: document.persistence === 'durable_server' ? 'durable_server' : 'process_memory',
    },
  };
}

export function saveJournal(input: {
  memory: JournalMemory;
  token: string;
  nowIso: string;
  document: JournalDocument;
}): { ok: true; document: JournalDocument } | { ok: false; status: number; error: string } {
  const matches = input.memory.invites.filter((invite) => invite.tokenHash === hashInviteToken(input.token));
  const auth = authorizeInvite({ invite: matches[0] ?? null, token: input.token, nowIso: input.nowIso });
  if (!auth.ok) return { ok: false, status: 403, error: 'This invite cannot open the journal.' };
  if (input.document.organizationId !== auth.invite.organizationId) {
    return { ok: false, status: 403, error: 'Organization mismatch.' };
  }
  if (input.document.workflowId !== auth.invite.workflowId) {
    return { ok: false, status: 403, error: 'Workflow mismatch.' };
  }
  const stored: JournalDocument = {
    ...input.document,
    organizationId: auth.invite.organizationId,
    workerUseGranted: false,
    persistence: 'process_memory',
    updatedAt: input.nowIso,
  };
  input.memory.documents = input.memory.documents
    .filter((item) => item.id !== stored.id)
    .concat(stored);
  return { ok: true, document: stored };
}

export function readNotesForOrganization(memory: JournalMemory, reader: JournalReader): PrivateNote[] {
  return memory.documents
    .filter((doc) => doc.organizationId === reader.organizationId)
    .flatMap((doc) => visiblePrivateNotes(doc.privateNotes, reader, doc.organizationId));
}
