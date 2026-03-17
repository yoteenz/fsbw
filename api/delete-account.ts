import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth';
import { getSupabaseAdmin, getSupabaseAdminServiceRole, hasSupabaseServiceRole } from './_lib/supabase';

/**
 * DELETE /api/delete-account
 * Records the user in deleted_accounts (so admin can see from any browser), then deletes from Supabase Auth.
 * Requires Bearer token and SUPABASE_SERVICE_ROLE_KEY.
 * Body (optional): { deletedFrom?: string } e.g. "chrome-desktop".
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let user: { id: string; email: string; accessToken: string } | null = null;
    try {
      user = await getAuthUser(req);
    } catch (e) {
      console.error('Delete account getAuthUser error:', e);
      return res.status(500).json({ error: 'Authentication check failed' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const protectedEmail = (process.env.PROTECTED_ACCOUNT_EMAIL || 'ayoteenz@yahoo.com').trim().toLowerCase();
    if ((user.email || '').trim().toLowerCase() === protectedEmail) {
      return res.status(403).json({ error: 'This admin account cannot be deleted.' });
    }

    if (!hasSupabaseServiceRole()) {
      console.error('Delete account: SUPABASE_SERVICE_ROLE_KEY is not set; deleteUser requires service role.');
      return res.status(503).json({ error: 'Account deletion not configured' });
    }

    let admin;
    try {
      admin = getSupabaseAdmin();
    } catch (e) {
      console.error('Delete account getSupabaseAdmin error:', e);
      return res.status(503).json({ error: 'Account deletion not configured' });
    }

    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const deletedFrom = (body as { deletedFrom?: string }).deletedFrom ?? undefined;

    try {
      const serviceRole = getSupabaseAdminServiceRole();
      const { data: profileRow } = await serviceRole.from('profiles').select('first_name, last_name').eq('id', user.id).maybeSingle();
      const row = profileRow as { first_name?: string; last_name?: string } | null;
      await serviceRole.from('deleted_accounts').insert({
        user_id: user.id,
        email: (user.email || '').trim().toLowerCase(),
        first_name: row?.first_name ?? null,
        last_name: row?.last_name ?? null,
        deleted_at: new Date().toISOString(),
        deleted_from: deletedFrom ?? null,
        payload: null,
      });
    } catch (e) {
      console.error('Delete account: failed to insert deleted_accounts', e);
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('Supabase deleteUser error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Delete account unhandled error:', e);
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Failed to delete account',
    });
  }
}
