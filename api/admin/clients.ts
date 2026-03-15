import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';
import { fromProfileRow } from '../_lib/profileMapping';

/** GET /api/admin/clients – list all profiles (admin only). Returns array of profiles in app camelCase shape. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const rows = Array.isArray(data) ? data : [];
    const clients = rows.map((row) => fromProfileRow(row as Record<string, unknown>));
    return res.status(200).json(clients);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
