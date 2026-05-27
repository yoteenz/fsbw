import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { getSupabaseUser } from './_lib/supabase.js';

/** GET /api/notifications — signed-in user's admin-sent notification items (RLS via user JWT). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseUser(user.accessToken);
  const { data, error } = await supabase
    .from('notifications')
    .select('items')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });

  const items = (data as { items?: unknown } | null)?.items ?? [];
  return res.status(200).json({ items: Array.isArray(items) ? items : [] });
}
