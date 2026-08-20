/**
 * Invitation token helpers — hash-only storage; never persist raw tokens.
 */

import { createHash, randomBytes } from 'node:crypto';

export function generateInvitationToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}

export function isInvitationExpired(expiresAtIso: string, nowMs = Date.now()): boolean {
  return Date.parse(expiresAtIso) < nowMs;
}

export function assertRoleNotEscalated(
  proposedRole: string,
  requestedRole: string | undefined
): { ok: true } | { ok: false; error: string } {
  if (!requestedRole || requestedRole === proposedRole) return { ok: true };
  return { ok: false, error: 'Role escalation via client payload is not permitted' };
}
