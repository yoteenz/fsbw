/**
 * GET /api/admin/studio-os-membership
 * Returns organization scope for the authenticated admin (Supabase table).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';

const FOUNDER_EMAIL = 'kateenaarmstrong@gmail.com';
const DEFAULT_WORKSPACE_ID = 'frontal-slayer';

function readEnvPortfolioOwners(): string[] {
  const raw = process.env.ADMIN_PORTFOLIO_OWNER_EMAILS || process.env.PORTFOLIO_OWNER_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    return res.status(auth.failure.status).json({ error: auth.failure.error, code: auth.failure.code });
  }

  const email = auth.user.email.trim().toLowerCase();
  const envOwners = readEnvPortfolioOwners();
  const isEnvPortfolioOwner = email === FOUNDER_EMAIL || envOwners.includes(email);

  try {
    const supabase = getSupabaseAdminServiceRole();
    const { data, error } = await supabase
      .from('studio_os_org_memberships')
      .select('workspace_id, is_portfolio_owner')
      .eq('admin_email', email)
      .maybeSingle();

    if (error) {
      console.error('[studio-os-membership]', error.message);
      return res.status(200).json({
        workspaceId: DEFAULT_WORKSPACE_ID,
        isPortfolioOwner: isEnvPortfolioOwner,
        source: 'env-fallback',
      });
    }

    if (data) {
      return res.status(200).json({
        workspaceId: data.workspace_id,
        isPortfolioOwner: Boolean(data.is_portfolio_owner) || isEnvPortfolioOwner,
        source: 'supabase',
      });
    }

    return res.status(200).json({
      workspaceId: DEFAULT_WORKSPACE_ID,
      isPortfolioOwner: isEnvPortfolioOwner,
      source: 'default',
    });
  } catch (err) {
    console.error('[studio-os-membership]', err);
    return res.status(200).json({
      workspaceId: DEFAULT_WORKSPACE_ID,
      isPortfolioOwner: isEnvPortfolioOwner,
      source: 'env-fallback',
    });
  }
}
