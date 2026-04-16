import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';
import { writeAuditLog } from '../_lib/auditLog';

/** GET /api/admin/notifications – list all or ?user_id= (admin only). POST: send notification to user. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    const userId = typeof req.query.user_id === 'string' ? req.query.user_id.trim() : null;
    try {
      let q = supabase.from('notifications').select('*');
      if (userId) q = q.eq('user_id', userId);
      const { data, error } = await q.order('updated_at', { ascending: false }).limit(100);
      if (error) return res.status(500).json({ error: error.message });
      const rows = Array.isArray(data) ? data : [];
      const list = rows.map((r: { user_id: string; items?: unknown; updated_at?: string }) => ({
        userId: r.user_id,
        items: Array.isArray(r.items) ? r.items : [],
        updatedAt: r.updated_at,
      }));
      return res.status(200).json(list);
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const userId = body.userId as string || (body.user_id as string);
    const message = body.message as string || (body.text as string);
    if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('notifications')
        .select('items')
        .eq('user_id', userId)
        .maybeSingle();
      if (fetchErr) return res.status(500).json({ error: fetchErr.message });

      const newItem = { id: crypto.randomUUID(), text: String(message).trim(), read: false, createdAt: new Date().toISOString() };
      const items = Array.isArray((existing as { items?: unknown[] } | null)?.items) ? (existing as { items: unknown[] }).items : [];
      const next = [...items, newItem];

      if (existing) {
        const { error: updErr } = await supabase.from('notifications').update({ items: next, updated_at: new Date().toISOString() }).eq('user_id', userId);
        if (updErr) return res.status(500).json({ error: updErr.message });
      } else {
        const { error: insErr } = await supabase.from('notifications').insert({ user_id: userId, items: next });
        if (insErr) return res.status(500).json({ error: insErr.message });
      }

      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'notification.create',
        resourceType: 'notifications',
        resourceId: userId,
        details: { message: String(message).slice(0, 200) },
      });
      return res.status(200).json({ success: true, message: 'Notification sent' });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
