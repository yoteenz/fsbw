/** Private Expert Invite System — canonical types */

export type ExpertInviteProgressStatus = 'not_started' | 'started' | 'in_progress' | 'completed' | 'archived';

export type InviteAccessStatus =
  | 'active'
  | 'paused'
  | 'expired'
  | 'completed'
  | 'archived'
  | 'revoked'
  | 'deleted';

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
  /** Interview progress lifecycle */
  status: ExpertInviteProgressStatus;
  /** Owner-controlled access gate */
  accessStatus: InviteAccessStatus;
  welcomeNote: string | null;
  /** SHA-256 hex — never expose plain PIN in API responses */
  pinHash: string | null;
  hasPin?: boolean;
  sessionId: string | null;
  progressPercent: number;
  currentQuestionLabel: string | null;
  currentQuestionIndex: number | null;
  timeSpentMinutes: number;
  lastActiveAt: string | null;
  /** First time expert opened the invite landing page */
  linkOpenedAt: string | null;
  /** First time expert continued into the interview */
  interviewStartedAt: string | null;
  latestLesson: string | null;
  knowledgeExtractedCount: number;
  archivedAt: string | null;
  revokedTokens: string[];
};

export type CreateExpertInviteInput = {
  inviteeName: string;
  businessName: string;
  role: string;
  workerBeingCreated: string;
  profileId: string;
  companyId: string;
  expiresAt?: string | null;
  welcomeNote?: string | null;
  /** Plain PIN — hashed before persistence */
  accessPin?: string | null;
  accessStatus?: InviteAccessStatus;
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

export type InviteAuditEventType =
  | 'invite_created'
  | 'link_copied'
  | 'message_copied'
  | 'share_initiated'
  | 'invite_previewed'
  | 'invite_link_opened'
  | 'interview_started'
  | 'link_regenerated'
  | 'access_paused'
  | 'access_resumed'
  | 'invite_revoked'
  | 'invite_archived'
  | 'invite_deleted';
