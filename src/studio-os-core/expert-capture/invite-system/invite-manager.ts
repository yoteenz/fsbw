import type { CreateExpertInviteInput, ExpertInvite } from './types';
import { INVITE_TOKEN_CHARSET } from './types';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateInviteToken(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => INVITE_TOKEN_CHARSET[b % INVITE_TOKEN_CHARSET.length]).join('');
}

export function createInviteRecord(input: CreateExpertInviteInput, token = generateInviteToken()): ExpertInvite {
  const now = new Date().toISOString();
  return {
    id: newId('inv'),
    token,
    inviteeName: input.inviteeName.trim(),
    businessName: input.businessName.trim(),
    role: input.role.trim(),
    workerBeingCreated: input.workerBeingCreated.trim(),
    profileId: input.profileId,
    companyId: input.companyId,
    createdAt: now,
    expiresAt: input.expiresAt ?? null,
    status: 'not_started',
    sessionId: null,
    progressPercent: 0,
    currentQuestionLabel: null,
    currentQuestionIndex: null,
    timeSpentMinutes: 0,
    lastActiveAt: null,
    latestLesson: null,
    knowledgeExtractedCount: 0,
    archivedAt: null,
  };
}

export function isInviteExpired(invite: ExpertInvite): boolean {
  if (!invite.expiresAt) return false;
  return new Date(invite.expiresAt).getTime() < Date.now();
}

export function inviteStatusLabel(status: ExpertInvite['status']): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function estimateInterviewMinutes(questionCount: number, minutesPerQuestion = 3): number {
  return Math.max(15, questionCount * minutesPerQuestion);
}

export function deriveInviteStatusFromProgress(
  current: ExpertInvite['status'],
  progressPercent: number,
  sessionCompleted: boolean
): ExpertInvite['status'] {
  if (current === 'archived') return 'archived';
  if (sessionCompleted) return 'completed';
  if (progressPercent > 0) return 'in_progress';
  return current === 'completed' ? 'completed' : 'not_started';
}
