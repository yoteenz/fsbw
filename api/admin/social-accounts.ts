import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { writeAuditLog } from '../_lib/auditLog.js';
import {
  buildOAuthAuthorizeUrl,
  type SocialPlatformId,
  isPlatformConfigured,
} from '../_lib/socialPlatforms.js';
import {
  listPublicSocialAccounts,
  disconnectSocialAccount,
  appendSocialPublishLog,
} from '../_lib/socialAccountsDb.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';

const PLATFORMS = new Set(['instagram', 'facebook', 'tiktok', 'pinterest', 'x']);

function parsePlatform(raw: unknown): SocialPlatformId | null {
  const p = String(raw || '').toLowerCase();
  return PLATFORMS.has(p) ? (p as SocialPlatformId) : null;
}

/**
 * GET  /api/admin/social-accounts — public connection status (no tokens)
 * POST /api/admin/social-accounts — body { action: 'oauth_start', platform }
 * PATCH /api/admin/social-accounts — body { platform, postingDisabled? }
 * DELETE /api/admin/social-accounts?platform=instagram — disconnect
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const accounts = await listPublicSocialAccounts();
    return res.status(200).json({ accounts });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const action = String((body as { action?: string }).action || '');
    if (action !== 'oauth_start') return res.status(400).json({ error: 'Unknown action' });
    const platform = parsePlatform((body as { platform?: string }).platform);
    if (!platform) return res.status(400).json({ error: 'Invalid platform' });
    if (!isPlatformConfigured(platform)) {
      return res.status(503).json({ error: 'OAuth credentials not configured for this platform' });
    }
    const result = buildOAuthAuthorizeUrl(platform, admin.id);
    if ('error' in result) return res.status(503).json({ error: result.error });
    return res.status(200).json({ authorizeUrl: result.url });
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const platform = parsePlatform((body as { platform?: string }).platform);
    if (!platform) return res.status(400).json({ error: 'Invalid platform' });
    const postingDisabled = (body as { postingDisabled?: boolean }).postingDisabled;
    if (typeof postingDisabled !== 'boolean') return res.status(400).json({ error: 'postingDisabled boolean required' });

    const supabase = getSupabaseAdmin();
    const status = postingDisabled ? 'posting_disabled' : 'connected';
    const { error } = await supabase
      .from('studio_social_accounts')
      .update({ posting_disabled: postingDisabled, status, updated_at: new Date().toISOString() })
      .eq('platform', platform);
    if (error) return res.status(500).json({ error: error.message });

    await appendSocialPublishLog({
      action: postingDisabled ? 'error' : 'connect',
      actorEmail: admin.email,
      platform,
      details: { postingDisabled },
    });
    await writeAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action: postingDisabled ? 'social.disconnect' : 'social.connect',
      resourceType: 'studio_social_account',
      resourceId: platform,
      details: { postingDisabled },
    });
    const accounts = await listPublicSocialAccounts();
    return res.status(200).json({ accounts });
  }

  if (req.method === 'DELETE') {
    const platform = parsePlatform(req.query.platform);
    if (!platform) return res.status(400).json({ error: 'Invalid platform query' });
    await disconnectSocialAccount(platform);
    await appendSocialPublishLog({ action: 'disconnect', actorEmail: admin.email, platform });
    await writeAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'social.disconnect',
      resourceType: 'studio_social_account',
      resourceId: platform,
    });
    const accounts = await listPublicSocialAccounts();
    return res.status(200).json({ accounts });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
