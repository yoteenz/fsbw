import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { writeAuditLog } from '../_lib/auditLog.js';
import {
  exchangeOAuthCode,
  socialAccountsReturnUrl,
  type SocialPlatformId,
} from '../_lib/socialPlatforms.js';
import { verifyOAuthState } from '../_lib/socialTokenCrypto.js';
import { upsertSocialAccount, appendSocialPublishLog } from '../_lib/socialAccountsDb.js';

/** GET /api/admin/social-accounts-oauth-callback — Meta/TikTok/Pinterest/X OAuth redirect (no Bearer; state HMAC) */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const oauthError = typeof req.query.error === 'string' ? req.query.error : '';

  if (oauthError) {
    return res.redirect(302, socialAccountsReturnUrl(`error=${encodeURIComponent(oauthError)}`));
  }

  if (!code || !state) {
    return res.redirect(302, socialAccountsReturnUrl('error=missing_code_or_state'));
  }

  const parsed = verifyOAuthState(state);
  if (!parsed) {
    return res.redirect(302, socialAccountsReturnUrl('error=invalid_state'));
  }

  const platform = parsed.platform as SocialPlatformId;
  const exchanged = await exchangeOAuthCode(platform, code);
  if ('error' in exchanged) {
    return res.redirect(302, socialAccountsReturnUrl(`error=${encodeURIComponent(exchanged.error)}`));
  }

  const saved = await upsertSocialAccount({
    platform,
    accessToken: exchanged.accessToken,
    refreshToken: exchanged.refreshToken,
    expiresIn: exchanged.expiresIn,
    accountLabel: exchanged.accountLabel,
    accountExternalId: exchanged.accountExternalId,
    scopes: exchanged.scopes,
    metadata: exchanged.metadata,
    connectedByEmail: parsed.adminId,
  });

  if ('error' in saved) {
    return res.redirect(302, socialAccountsReturnUrl(`error=${encodeURIComponent(saved.error)}`));
  }

  await appendSocialPublishLog({
    action: 'connect',
    actorEmail: null,
    platform,
    details: { accountLabel: exchanged.accountLabel },
  });

  try {
    await writeAuditLog({
      actorId: parsed.adminId,
      actorEmail: null,
      action: 'social.connect',
      resourceType: 'studio_social_account',
      resourceId: platform,
      details: { accountLabel: exchanged.accountLabel },
    });
  } catch {
    /* ignore */
  }

  return res.redirect(302, socialAccountsReturnUrl(`connected=${platform}`));
}
