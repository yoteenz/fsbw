import type { ExpertInvite, InviteAccessStatus } from './types';
import { isInviteExpired } from './invite-manager';

export type InviteAccessResolution =
  | { ok: true }
  | { ok: false; reason: InviteAccessStatus | 'not_found'; message: string };

export const INVITE_UNAVAILABLE_MESSAGE =
  'This interview invitation is currently unavailable.\n\nPlease contact the person who sent it for assistance.';

export function resolveInviteAccess(invite: ExpertInvite | null, token?: string): InviteAccessResolution {
  if (!invite) {
    return { ok: false, reason: 'not_found', message: INVITE_UNAVAILABLE_MESSAGE };
  }
  if (token && invite.revokedTokens?.includes(token)) {
    return { ok: false, reason: 'revoked', message: INVITE_UNAVAILABLE_MESSAGE };
  }
  if (invite.accessStatus === 'deleted') {
    return { ok: false, reason: 'deleted', message: INVITE_UNAVAILABLE_MESSAGE };
  }
  if (invite.accessStatus === 'revoked') {
    return { ok: false, reason: 'revoked', message: INVITE_UNAVAILABLE_MESSAGE };
  }
  if (invite.accessStatus === 'paused') {
    return { ok: false, reason: 'paused', message: INVITE_UNAVAILABLE_MESSAGE };
  }
  if (invite.accessStatus === 'archived' || invite.status === 'archived') {
    return { ok: false, reason: 'archived', message: INVITE_UNAVAILABLE_MESSAGE };
  }
  if (isInviteExpired(invite) || invite.accessStatus === 'expired') {
    return { ok: false, reason: 'expired', message: INVITE_UNAVAILABLE_MESSAGE };
  }
  if (invite.status === 'completed' || invite.accessStatus === 'completed') {
    return { ok: true };
  }
  return { ok: true };
}

export function accessStatusLabel(status: InviteAccessStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function displayInviteStatus(invite: ExpertInvite): string {
  const access = resolveInviteAccess(invite);
  if (!access.ok) return accessStatusLabel(access.reason === 'not_found' ? 'revoked' : access.reason);
  return displayInviteEngagement(invite);
}

export type InviteEngagementStage = 'not_opened' | 'link_opened' | 'started' | 'in_progress' | 'completed';

export function resolveInviteEngagementStage(invite: ExpertInvite): InviteEngagementStage {
  if (invite.status === 'completed') return 'completed';
  if (invite.progressPercent > 0 || invite.status === 'in_progress') return 'in_progress';
  if (invite.interviewStartedAt || invite.status === 'started') return 'started';
  if (invite.linkOpenedAt) return 'link_opened';
  return 'not_opened';
}

export function displayInviteEngagement(invite: ExpertInvite): string {
  const stage = resolveInviteEngagementStage(invite);
  switch (stage) {
    case 'not_opened':
      return 'Not opened';
    case 'link_opened':
      return 'Link opened';
    case 'started':
      return 'Interview started';
    case 'in_progress':
      return `In progress · ${invite.progressPercent}%`;
    case 'completed':
      return 'Completed';
  }
}

export function formatInviteEngagementTimestamps(invite: ExpertInvite): string | null {
  const parts: string[] = [];
  if (invite.linkOpenedAt) {
    parts.push(`Opened ${new Date(invite.linkOpenedAt).toLocaleString()}`);
  }
  if (invite.interviewStartedAt) {
    parts.push(`Started ${new Date(invite.interviewStartedAt).toLocaleString()}`);
  }
  return parts.length ? parts.join(' · ') : null;
}
