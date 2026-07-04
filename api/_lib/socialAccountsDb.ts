import { getSupabaseAdmin } from './supabase.js';
import { encryptSocialTokens, decryptSocialTokens } from './socialTokenCrypto.js';
import {
  type SocialPlatformId,
  type SocialAccountStatus,
  SOCIAL_PLATFORMS,
  isPlatformConfigured,
  deriveAccountStatus,
} from './socialPlatforms.js';

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

export async function listPublicSocialAccounts(): Promise<PublicSocialAccount[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('studio_social_accounts').select('*');
  const byPlatform = new Map((data ?? []).map((r) => [r.platform, r]));

  return SOCIAL_PLATFORMS.map((p) => {
    const row = byPlatform.get(p.id);
    if (!row) {
      const unavailable = p.id === 'x' && !isPlatformConfigured(p.id);
      return {
        platform: p.id,
        label: p.label,
        status: unavailable ? ('unavailable' as SocialAccountStatus) : 'disconnected',
        accountLabel: null,
        postingDisabled: false,
        tokenExpiresAt: null,
        lastError: null,
        connectedAt: null,
        oauthConfigured: isPlatformConfigured(p.id),
      };
    }
    return {
      platform: p.id,
      label: p.label,
      status: deriveAccountStatus(row),
      accountLabel: row.account_label,
      postingDisabled: row.posting_disabled,
      tokenExpiresAt: row.token_expires_at,
      lastError: row.last_error,
      connectedAt: row.connected_at,
      oauthConfigured: isPlatformConfigured(p.id),
    };
  });
}

export async function upsertSocialAccount(params: {
  platform: SocialPlatformId;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  accountLabel?: string;
  accountExternalId?: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  connectedByEmail: string;
}): Promise<{ ok: true } | { error: string }> {
  const encrypted = encryptSocialTokens({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });
  if (!encrypted) return { error: 'Failed to encrypt tokens — configure SOCIAL_TOKEN_ENCRYPTION_SECRET' };

  const expiresAt =
    params.expiresIn && params.expiresIn > 0
      ? new Date(Date.now() + params.expiresIn * 1000).toISOString()
      : null;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('studio_social_accounts').upsert(
    {
      platform: params.platform,
      status: 'connected',
      account_label: params.accountLabel ?? null,
      account_external_id: params.accountExternalId ?? null,
      encrypted_tokens: encrypted,
      token_expires_at: expiresAt,
      scopes: params.scopes ?? [],
      metadata: params.metadata ?? {},
      posting_disabled: false,
      last_error: null,
      connected_by_email: params.connectedByEmail,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'platform' }
  );
  if (error) return { error: error.message };
  return { ok: true };
}

export async function disconnectSocialAccount(platform: SocialPlatformId): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from('studio_social_accounts').upsert(
    {
      platform,
      status: 'disconnected',
      encrypted_tokens: null,
      account_label: null,
      account_external_id: null,
      token_expires_at: null,
      last_error: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'platform' }
  );
}

export async function getDecryptedAccessToken(platform: SocialPlatformId): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('studio_social_accounts').select('encrypted_tokens, posting_disabled, status').eq('platform', platform).maybeSingle();
  if (!data?.encrypted_tokens || data.posting_disabled) return null;
  const tokens = decryptSocialTokens(data.encrypted_tokens);
  return tokens?.access_token ?? null;
}

export async function appendSocialPublishLog(params: {
  postId?: string | null;
  action: string;
  actorEmail: string | null;
  platform?: string;
  caption?: string;
  assetUsed?: string;
  scheduledTime?: string | null;
  publishResult?: Record<string, unknown>;
  errorDetails?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('studio_social_publish_log').insert({
      post_id: params.postId ?? null,
      action: params.action,
      actor_email: params.actorEmail,
      platform: params.platform ?? null,
      caption: params.caption ?? null,
      asset_used: params.assetUsed ?? null,
      scheduled_time: params.scheduledTime ?? null,
      publish_result: params.publishResult ?? null,
      error_details: params.errorDetails ?? null,
      details: params.details ?? {},
    });
  } catch {
    /* ignore */
  }
}
