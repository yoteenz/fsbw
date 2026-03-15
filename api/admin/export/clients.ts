import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../../_lib/adminAuth';
import { getSupabaseAdmin } from '../../_lib/supabase';
import { fromProfileRow } from '../../_lib/profileMapping';

/** GET /api/admin/export/clients – CSV of all profiles (admin only). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const rows = Array.isArray(data) ? data : [];
    const clients = rows.map((r) => fromProfileRow(r as Record<string, unknown>) as Record<string, unknown>);

    const headers = ['email', 'firstName', 'lastName', 'phoneNumber', 'birthday', 'membershipType', 'referralCode', 'createdAt'];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(','),
      ...clients.map((c) => headers.map((h) => escape(c[h])).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="clients-export.csv"');
    return res.status(200).send(csv);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
