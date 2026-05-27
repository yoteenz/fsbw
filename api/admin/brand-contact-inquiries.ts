import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      const o = JSON.parse(req.body) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/** GET list / PATCH mark read — admin brand contact inquiries. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (!hasSupabaseServiceRole()) {
    if (req.method === 'GET') return res.status(200).json({ inquiries: [], newCount: 0, storageAvailable: false });
    return res.status(503).json({ error: 'Database not configured' });
  }

  const supabase = getSupabaseAdminServiceRole();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('brand_contact_inquiries')
        .select('id, name, email, is_order_related, order_number, message, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) {
        if (error.message?.includes('brand_contact_inquiries')) {
          return res.status(200).json({ inquiries: [], newCount: 0, storageAvailable: false });
        }
        return res.status(500).json({ error: error.message });
      }
      const rows = Array.isArray(data) ? data : [];
      const inquiries = rows.map((r) => ({
        id: String(r.id),
        name: String(r.name ?? ''),
        email: String(r.email ?? ''),
        isOrderRelated: r.is_order_related ? 'yes' : 'no',
        orderNumber: String(r.order_number ?? ''),
        message: String(r.message ?? ''),
        status: String(r.status ?? 'new'),
        timestamp: String(r.created_at ?? ''),
      }));
      const newCount = inquiries.filter((i) => i.status === 'new').length;
      return res.status(200).json({ inquiries, newCount, storageAvailable: true });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    if (!body) return res.status(400).json({ error: 'JSON body required' });
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : 'read';
    if (!id) return res.status(400).json({ error: 'id required' });
    if (status !== 'read' && status !== 'new') return res.status(400).json({ error: 'invalid status' });

    const { error } = await supabase.from('brand_contact_inquiries').update({ status }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
