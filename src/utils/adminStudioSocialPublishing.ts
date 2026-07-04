/** Social publishing connectors — official OAuth only; tokens server-side. */

export type SocialPlatformId = 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'x';

export type SocialAccountStatus =
  | 'connected'
  | 'needs_reauthorization'
  | 'token_expiring'
  | 'posting_disabled'
  | 'error'
  | 'disconnected'
  | 'unavailable';

export const SOCIAL_ACCOUNT_STATUS_LABELS: Record<SocialAccountStatus, string> = {
  connected: 'CONNECTED',
  needs_reauthorization: 'NEEDS REAUTHORIZATION',
  token_expiring: 'TOKEN EXPIRING',
  posting_disabled: 'POSTING DISABLED',
  error: 'ERROR',
  disconnected: 'DISCONNECTED',
  unavailable: 'API UNAVAILABLE',
};

export const SOCIAL_ACCOUNT_STATUS_COLORS: Record<SocialAccountStatus, string> = {
  connected: '#16A34A',
  needs_reauthorization: '#CA8A04',
  token_expiring: '#D97706',
  posting_disabled: '#6B7280',
  error: '#EB1C24',
  disconnected: '#9CA3AF',
  unavailable: '#6B7280',
};

export const SOCIAL_PUBLISH_PLATFORMS: Array<{
  id: SocialPlatformId;
  label: string;
  provider: string;
}> = [
  { id: 'instagram', label: 'INSTAGRAM', provider: 'META GRAPH API' },
  { id: 'facebook', label: 'FACEBOOK', provider: 'META GRAPH API' },
  { id: 'tiktok', label: 'TIKTOK', provider: 'TIKTOK CONTENT POSTING API' },
  { id: 'pinterest', label: 'PINTEREST', provider: 'PINTEREST API' },
  { id: 'x', label: 'X / TWITTER', provider: 'X API V2' },
];

export const SOCIAL_PUBLISH_CHANNEL_IDS: SocialPlatformId[] = ['instagram', 'facebook', 'tiktok', 'pinterest', 'x'];

export type PublicSocialAccount = {
  platform: SocialPlatformId;
  label: string;
  status: SocialAccountStatus;
  accountLabel: string | null;
  postingDisabled: boolean;
  tokenExpiresAt: string | null;
  lastError: string | null;
  connectedAt: string | null;
  oauthConfigured: boolean;
};

export type SocialPostRecord = {
  id: string;
  distribution_pack_id: string;
  content_pack_ref: string | null;
  platform: SocialPlatformId;
  caption: string;
  hashtags: string;
  thumbnail_url: string | null;
  cover_url: string | null;
  scheduled_at: string | null;
  approval_status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  publish_status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  approved_by_email: string | null;
  approved_at: string | null;
  error_details: string | null;
  platform_post_id: string | null;
};

export type SocialPublishLogEntry = {
  id: string;
  action: string;
  actor_email: string | null;
  platform: string | null;
  caption: string | null;
  asset_used: string | null;
  scheduled_time: string | null;
  error_details: string | null;
  created_at: string;
};
