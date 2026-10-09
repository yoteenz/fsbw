import { createHash, randomBytes } from 'node:crypto';
import type { JournalInvite } from './types';

export function hashInviteToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createInviteToken(): string {
  return randomBytes(24).toString('base64url');
}

export function authorizeInvite(input: {
  invite: JournalInvite | null;
  token: string;
  nowIso: string;
}): { ok: true; invite: JournalInvite } | { ok: false; reason: 'missing' | 'mismatch' | 'expired' | 'revoked' } {
  const invite = input.invite;
  if (!invite) return { ok: false, reason: 'missing' };
  if (invite.revokedAt) return { ok: false, reason: 'revoked' };
  if (invite.expiresAt <= input.nowIso) return { ok: false, reason: 'expired' };
  const hash = hashInviteToken(input.token);
  if (hash !== invite.tokenHash) return { ok: false, reason: 'mismatch' };
  return { ok: true, invite };
}
