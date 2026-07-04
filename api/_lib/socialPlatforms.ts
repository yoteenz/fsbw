/**
 * Official OAuth configs for brand social platforms — no scraping or password auth.
 */
import { signOAuthState } from './socialTokenCrypto.js';

export type SocialPlatformId = 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'x';

export type SocialAccountStatus =
  | 'connected'
  | 'needs_reauthorization'
  | 'token_expiring'
  | 'posting_disabled'
  | 'error'
  | 'disconnected'
  | 'unavailable';

export const SOCIAL_PLATFORMS: Array<{
  id: SocialPlatformId;
  label: string;
  oauthProvider: string;
  description: string;
}> = [
  { id: 'instagram', label: 'INSTAGRAM', oauthProvider: 'Meta Graph API', description: 'Business/Creator via Meta OAuth' },
  { id: 'facebook', label: 'FACEBOOK', oauthProvider: 'Meta Graph API', description: 'Facebook Page via Meta OAuth' },
  { id: 'tiktok', label: 'TIKTOK', oauthProvider: 'TikTok Content Posting API', description: 'Official TikTok OAuth' },
  { id: 'pinterest', label: 'PINTEREST', oauthProvider: 'Pinterest API', description: 'Official Pinterest OAuth' },
  { id: 'x', label: 'X / TWITTER', oauthProvider: 'X API v2', description: 'OAuth 2.0 when API access available' },
];

function siteOrigin(): string {
  const raw = process.env.SITE_URL || process.env.VERCEL_URL || 'http://localhost:5173';
  if (raw.startsWith('http')) return raw.replace(/\/$/, '');
  return `https://${raw.replace(/\/$/, '')}`;
}

export function oauthCallbackUrl(): string {
  return `${siteOrigin()}/api/admin/social-accounts-oauth-callback`;
}

export function socialAccountsReturnUrl(query = ''): string {
  const base = `${siteOrigin()}/admin/studio/social-accounts`;
  return query ? `${base}?${query}` : base;
}

export function isPlatformConfigured(platform: SocialPlatformId): boolean {
  switch (platform) {
    case 'instagram':
    case 'facebook':
      return !!(process.env.META_APP_ID && process.env.META_APP_SECRET);
    case 'tiktok':
      return !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
    case 'pinterest':
      return !!(process.env.PINTEREST_APP_ID && process.env.PINTEREST_APP_SECRET);
    case 'x':
      return process.env.X_API_AVAILABLE === 'true' && !!(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET);
    default:
      return false;
  }
}

export function buildOAuthAuthorizeUrl(platform: SocialPlatformId, adminId: string): { url: string } | { error: string } {
  if (!isPlatformConfigured(platform)) {
    if (platform === 'x' && process.env.X_API_AVAILABLE !== 'true') {
      return { error: 'X API access not available for this workspace' };
    }
    return { error: `${platform.toUpperCase()} OAuth credentials not configured on server` };
  }

  const exp = Date.now() + 10 * 60 * 1000;
  const state = signOAuthState({ adminId, platform, exp });
  if (!state) return { error: 'Token encryption secret not configured (SOCIAL_TOKEN_ENCRYPTION_SECRET)' };

  const redirectUri = encodeURIComponent(oauthCallbackUrl());
  const stateEnc = encodeURIComponent(state);

  switch (platform) {
    case 'instagram':
    case 'facebook': {
      const appId = process.env.META_APP_ID!;
      const scopes = [
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'instagram_basic',
        'instagram_content_publish',
        'business_management',
      ].join(',');
      const url = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${stateEnc}&scope=${encodeURIComponent(scopes)}&response_type=code`;
      return { url };
    }
    case 'tiktok': {
      const clientKey = process.env.TIKTOK_CLIENT_KEY!;
      const scopes = 'video.publish,video.upload,user.info.basic';
      const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodeURIComponent(scopes)}&response_type=code&redirect_uri=${redirectUri}&state=${stateEnc}`;
      return { url };
    }
    case 'pinterest': {
      const appId = process.env.PINTEREST_APP_ID!;
      const scopes = 'boards:read,pins:read,pins:write,user_accounts:read';
      const url = `https://www.pinterest.com/oauth/?client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${stateEnc}`;
      return { url };
    }
    case 'x': {
      const clientId = process.env.X_CLIENT_ID!;
      const scopes = 'tweet.read tweet.write users.read offline.access';
      const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&state=${stateEnc}&code_challenge=challenge&code_challenge_method=plain`;
      return { url };
    }
    default:
      return { error: 'Unknown platform' };
  }
}

export async function exchangeOAuthCode(
  platform: SocialPlatformId,
  code: string
): Promise<
  | {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: number;
      accountLabel?: string;
      accountExternalId?: string;
      scopes?: string[];
      metadata?: Record<string, unknown>;
    }
  | { error: string }
> {
  const redirectUri = oauthCallbackUrl();

  try {
    switch (platform) {
      case 'instagram':
      case 'facebook': {
        const appId = process.env.META_APP_ID!;
        const appSecret = process.env.META_APP_SECRET!;
        const tokenRes = await fetch(
          `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`
        );
        const tokenJson = (await tokenRes.json()) as { access_token?: string; expires_in?: number; error?: { message: string } };
        if (!tokenJson.access_token) {
          return { error: tokenJson.error?.message || 'Meta token exchange failed' };
        }
        const longRes = await fetch(
          `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenJson.access_token}`
        );
        const longJson = (await longRes.json()) as { access_token?: string; expires_in?: number };
        const accessToken = longJson.access_token || tokenJson.access_token;
        const pagesRes = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`
        );
        const pagesJson = (await pagesRes.json()) as {
          data?: Array<{ id: string; name: string; instagram_business_account?: { id: string } }>;
        };
        const page = pagesJson.data?.[0];
        const igId = page?.instagram_business_account?.id;
        if (platform === 'instagram' && !igId) {
          return { error: 'No Instagram Business account linked to Meta Page' };
        }
        return {
          accessToken,
          expiresIn: longJson.expires_in || tokenJson.expires_in,
          accountLabel: platform === 'instagram' ? `IG ${igId}` : page?.name || 'Facebook Page',
          accountExternalId: platform === 'instagram' ? igId : page?.id,
          scopes: ['pages_manage_posts', 'instagram_content_publish'],
          metadata: {
            pageId: page?.id,
            pageName: page?.name,
            instagramBusinessAccountId: igId,
          },
        };
      }
      case 'tiktok': {
        const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });
        const json = (await res.json()) as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
          open_id?: string;
          error_description?: string;
        };
        if (!json.access_token) return { error: json.error_description || 'TikTok token exchange failed' };
        return {
          accessToken: json.access_token,
          refreshToken: json.refresh_token,
          expiresIn: json.expires_in,
          accountExternalId: json.open_id,
          accountLabel: 'TikTok Creator',
          scopes: ['video.publish', 'video.upload'],
        };
      }
      case 'pinterest': {
        const creds = Buffer.from(`${process.env.PINTEREST_APP_ID}:${process.env.PINTEREST_APP_SECRET}`).toString('base64');
        const res = await fetch('https://api.pinterest.com/v5/oauth/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
          }),
        });
        const json = (await res.json()) as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
          message?: string;
        };
        if (!json.access_token) return { error: json.message || 'Pinterest token exchange failed' };
        return {
          accessToken: json.access_token,
          refreshToken: json.refresh_token,
          expiresIn: json.expires_in,
          accountLabel: 'Pinterest Business',
          scopes: ['pins:write'],
        };
      }
      case 'x': {
        const creds = Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64');
        const res = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: 'challenge',
          }),
        });
        const json = (await res.json()) as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
          error_description?: string;
        };
        if (!json.access_token) return { error: json.error_description || 'X token exchange failed' };
        return {
          accessToken: json.access_token,
          refreshToken: json.refresh_token,
          expiresIn: json.expires_in,
          accountLabel: 'X Account',
          scopes: ['tweet.write'],
        };
      }
      default:
        return { error: 'Unknown platform' };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'OAuth exchange failed' };
  }
}

export function deriveAccountStatus(row: {
  status: string;
  posting_disabled: boolean;
  token_expires_at: string | null;
  encrypted_tokens: string | null;
  last_error: string | null;
}): SocialAccountStatus {
  if (row.posting_disabled) return 'posting_disabled';
  if (row.last_error) return 'error';
  if (!row.encrypted_tokens) return 'disconnected';
  if (row.status === 'needs_reauthorization') return 'needs_reauthorization';
  if (row.token_expires_at) {
    const exp = new Date(row.token_expires_at).getTime();
    const days = (exp - Date.now()) / (1000 * 60 * 60 * 24);
    if (days < 0) return 'needs_reauthorization';
    if (days < 7) return 'token_expiring';
  }
  return row.status === 'connected' ? 'connected' : (row.status as SocialAccountStatus);
}
