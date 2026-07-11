/** Private Expert Invite System — canonical types (Phase 1) */

export type ExpertInviteStatus = 'not_started' | 'in_progress' | 'completed' | 'archived';

export type ExpertInvite = {
  id: string;
  token: string;
  inviteeName: string;
  businessName: string;
  role: string;
  workerBeingCreated: string;
  profileId: string;
  companyId: string;
  createdAt: string;
  expiresAt: string | null;
  status: ExpertInviteStatus;
  sessionId: string | null;
  progressPercent: number;
  currentQuestionLabel: string | null;
  currentQuestionIndex: number | null;
  timeSpentMinutes: number;
  lastActiveAt: string | null;
  latestLesson: string | null;
  knowledgeExtractedCount: number;
  archivedAt: string | null;
};

export type CreateExpertInviteInput = {
  inviteeName: string;
  businessName: string;
  role: string;
  workerBeingCreated: string;
  profileId: string;
  companyId: string;
  expiresAt?: string | null;
};

/** Auth abstraction — invite token today; Studio Accounts / OAuth later */
export type InviteAccessGrant = {
  method: 'invite_token';
  token: string;
  inviteId: string;
};

export type OwnerAccessGrant = {
  method: 'owner_key' | 'studio_account';
  verifiedAt: string;
};

export const INVITE_TOKEN_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const ACTIVE_INVITE_STORAGE_KEY = 'studioInstituteActiveInvite_v1';
