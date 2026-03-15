import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth';
import { getSupabaseAdmin, hasSupabaseServiceRole } from './_lib/supabase';

/**
 * DELETE /api/delete-account
 * Deletes the authenticated user from Supabase Auth so they cannot sign back in.
 * Requires Bearer token and SUPABASE_SERVICE_ROLE_KEY (admin.auth.admin.deleteUser).
 * Call from the frontend before signing out when the user confirms "Delete account".
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!hasSupabaseServiceRole()) {
    console.error('Delete account: SUPABASE_SERVICE_ROLE_KEY is not set; deleteUser requires service role.');
    return res.status(503).json({ error: 'Account deletion not configured' });
  }

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error('Supabase deleteUser error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Delete account error:', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Failed to delete account' });
  }
}
