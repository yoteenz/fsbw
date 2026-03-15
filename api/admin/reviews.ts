import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';
import { writeAuditLog } from '../_lib/auditLog';

function toReviewItem(r: Record<string, unknown>) {
  return {
    id: r.id,
    client: (r.client_name || r.email || '').toString().toUpperCase(),
    clientName: r.client_name,
    email: r.email,
    rating: r.rating,
    product: r.product,
    review: r.review,
    status: r.status,
    photos: Array.isArray(r.photos) ? r.photos : [],
    date: r.created_at,
    createdAt: r.created_at,
  };
}

/** GET /api/admin/reviews – list from DB. PATCH – update status (e.g. publish). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) return res.status(500).json({ error: error.message });
      const rows = Array.isArray(data) ? data : [];
      const reviews = rows.map((r) => toReviewItem(r as Record<string, unknown>));
      const total = reviews.length;
      const published = reviews.filter((r) => r.status === 'published');
      const avg = published.length > 0
        ? published.reduce((s, r) => s + Number(r.rating || 0), 0) / published.length
        : 0;
      return res.status(200).json({
        reviews,
        averageRating: Math.round(avg * 10) / 10,
        totalReviews: total,
      });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const id = body.id as string;
    const status = body.status as string;
    if (!id || !status || !['pending', 'published', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'id and status (pending|published|rejected) required' });
    }
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'review.update',
        resourceType: 'reviews',
        resourceId: id,
        details: { status },
      });
      return res.status(200).json(toReviewItem((data ?? {}) as Record<string, unknown>));
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const email = (body.email as string) || '';
    const clientName = (body.clientName as string) || (body.client_name as string) || '';
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const product = (body.product as string) || '';
    const review = (body.review as string) || '';
    const status = (body.status as string) || 'pending';
    if (!email) return res.status(400).json({ error: 'email required' });
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          email,
          client_name: clientName,
          rating,
          product,
          review,
          status: ['pending', 'published', 'rejected'].includes(status) ? status : 'pending',
        })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(toReviewItem((data ?? {}) as Record<string, unknown>));
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
