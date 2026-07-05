import type { PublicSocialAccount, SocialPlatformId } from './adminStudioSocialPublishing';

export type SocialOAuthPlatformSetup = {
  platform: SocialPlatformId;
  label: string;
  configured: boolean;
  envVars: string[];
  developerPortal: string;
  notes?: string;
};

export const SOCIAL_OAUTH_GLOBAL_ENV = [
  { key: 'SOCIAL_TOKEN_ENCRYPTION_SECRET', description: '16+ characters — encrypts OAuth tokens at rest' },
  { key: 'SITE_URL', description: 'Production origin, e.g. https://fsbw.vercel.app (OAuth redirect base)' },
] as const;

export const SOCIAL_OAUTH_PLATFORM_SETUP: Omit<SocialOAuthPlatformSetup, 'configured'>[] = [
  {
    platform: 'instagram',
    label: 'INSTAGRAM',
    envVars: ['META_APP_ID', 'META_APP_SECRET'],
    developerPortal: 'https://developers.facebook.com/apps/',
    notes: 'Instagram Business/Creator via Meta Graph. Link IG to a Facebook Page.',
  },
  {
    platform: 'facebook',
    label: 'FACEBOOK',
    envVars: ['META_APP_ID', 'META_APP_SECRET'],
    developerPortal: 'https://developers.facebook.com/apps/',
    notes: 'Same Meta app as Instagram.',
  },
  {
    platform: 'tiktok',
    label: 'TIKTOK',
    envVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    developerPortal: 'https://developers.tiktok.com/',
    notes: 'TikTok Content Posting API — enable Login Kit + Content Posting.',
  },
  {
    platform: 'pinterest',
    label: 'PINTEREST',
    envVars: ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET', 'PINTEREST_DEFAULT_BOARD_ID'],
    developerPortal: 'https://developers.pinterest.com/',
  },
  {
    platform: 'x',
    label: 'X / TWITTER',
    envVars: ['X_API_AVAILABLE=true', 'X_CLIENT_ID', 'X_CLIENT_SECRET'],
    developerPortal: 'https://developer.x.com/',
    notes: 'Requires paid X API access. Set X_API_AVAILABLE=true only when approved.',
  },
];

export function oauthCallbackUrlForDisplay(): string {
  if (typeof window === 'undefined') return '/api/admin/social-accounts-oauth-callback';
  return `${window.location.origin}/api/admin/social-accounts-oauth-callback`;
}

export function buildPlatformSetupStatus(accounts: PublicSocialAccount[]): SocialOAuthPlatformSetup[] {
  const byPlatform = new Map(accounts.map((a) => [a.platform, a.oauthConfigured]));
  return SOCIAL_OAUTH_PLATFORM_SETUP.map((p) => ({
    ...p,
    configured: byPlatform.get(p.platform) ?? false,
  }));
}

export function anyOAuthPlatformConfigured(accounts: PublicSocialAccount[]): boolean {
  return accounts.some((a) => a.oauthConfigured);
}

export function allOAuthPlatformsUnconfigured(accounts: PublicSocialAccount[]): boolean {
  return accounts.length > 0 && accounts.every((a) => !a.oauthConfigured);
}
