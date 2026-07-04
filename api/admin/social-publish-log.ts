import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';

/** GET /api/admin/social-publish-log?limit=50&postId=... */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const postId = typeof req.query.postId === 'string' ? req.query.postId : '';

  const supabase = getSupabaseAdmin();
  let q = supabase.from('studio_social_publish_log').select('*').order('created_at', { ascending: false });
  if (postId) q = q.eq('post_id', postId);
  const { data, error } = await q.limit(limit);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ log: data ?? [] });
}
