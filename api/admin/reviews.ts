import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';
import { writeAuditLog } from '../_lib/auditLog';

function firstNonEmptyString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    const s = typeof v === 'string' ? v.trim() : '';
    if (s) return s;
  }
  return undefined;
}

/** Optional photo URL on the review row (DB column or camelCase aliases). */
function clientProfilePhotoFromReviewRow(r: Record<string, unknown>): string | undefined {
  return firstNonEmptyString(
    r.client_profile_photo_url,
    r.clientProfilePhotoUrl,
    r.profile_photo_url,
    r.profilePhotoUrl,
    r.profile_image_url,
    r.profileImageUrl,
    r.profile_image,
    r.profileImage,
    r.avatar_url,
    r.avatarUrl,
    r.avatar
  );
}

function toReviewItem(r: Record<string, unknown>) {
  const vp = r.verified_purchase ?? r.verifiedPurchase;
  const verifiedPurchase =
    vp === true || vp === 1 || String(vp).toLowerCase() === 'true' || String(vp).toLowerCase() === '1';
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
    videos: Number(r.videos) || 0,
    verifiedPurchase,
    date: r.created_at,
    createdAt: r.created_at,
    clientProfilePhotoUrl: clientProfilePhotoFromReviewRow(r),
  };
}

function reviewPhotoCountRaw(r: Record<string, unknown>): number {
  const p = r.photos;
  if (Array.isArray(p)) return p.length;
  const n = Number(p);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function reviewVideoCountRaw(r: Record<string, unknown>): number {
  const v = r.videos;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function adminReviewStatusVisibleRaw(status: unknown): boolean {
  const s = String(status ?? 'published').toLowerCase();
  return s === 'published' || s === 'pending';
}

async function profilePhotoByEmailMap(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  rows: Record<string, unknown>[]
): Promise<Map<string, string>> {
  const emails = [
    ...new Set(
      rows
        .map((r) => String(r.email ?? '').trim().toLowerCase())
        .filter((e) => e.length > 0)
    ),
  ];
  const map = new Map<string, string>();
  if (emails.length === 0) return map;
  const { data, error } = await supabase.from('profiles').select('email, profile_image').in('email', emails);
  if (error || !Array.isArray(data)) return map;
  for (const row of data as { email?: string; profile_image?: string }[]) {
    const e = String(row.email ?? '')
      .trim()
      .toLowerCase();
    const url = String(row.profile_image ?? '').trim();
    if (e && url) map.set(e, url);
  }
  return map;
}

async function profilePhotoForSingleEmail(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  email: string
): Promise<string | undefined> {
  const e = String(email || '')
    .trim()
    .toLowerCase();
  if (!e) return undefined;
  const { data, error } = await supabase.from('profiles').select('profile_image').eq('email', e).maybeSingle();
  if (error || !data) return undefined;
  const url = String((data as { profile_image?: string }).profile_image ?? '').trim();
  return url || undefined;
}

function mergeReviewPhotoFromProfiles(
  item: ReturnType<typeof toReviewItem>,
  rawRow: Record<string, unknown>,
  photoByEmail: Map<string, string>
): ReturnType<typeof toReviewItem> {
  const onRow = clientProfilePhotoFromReviewRow(rawRow);
  if (onRow) return { ...item, clientProfilePhotoUrl: onRow };
  const em = String(rawRow.email ?? '')
    .trim()
    .toLowerCase();
  const fromProfile = em ? photoByEmail.get(em) : undefined;
  if (fromProfile) return { ...item, clientProfilePhotoUrl: fromProfile };
  return item;
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
      const rawRows = rows.map((r) => r as Record<string, unknown>);
      const photoByEmail = await profilePhotoByEmailMap(supabase, rawRows);
      const reviews = rawRows.map((r) => mergeReviewPhotoFromProfiles(toReviewItem(r), r, photoByEmail));
      const visibleRaw = rawRows.filter((r) => adminReviewStatusVisibleRaw(r.status));
      const totalVisible = visibleRaw.length;
      const withMedia = visibleRaw.filter(
        (r) => reviewPhotoCountRaw(r) > 0 || reviewVideoCountRaw(r) > 0
      ).length;
      const contentReviewsPercent = totalVisible > 0 ? Math.round((withMedia / totalVisible) * 100) : 0;
      const positiveCount = visibleRaw.filter((r) => (Number(r.rating) || 0) >= 4).length;
      const positiveSentimentPercent = totalVisible > 0 ? Math.round((positiveCount / totalVisible) * 100) : 0;
      const published = reviews.filter((r) => String(r.status ?? '').toLowerCase() === 'published');
      const avg = published.length > 0
        ? published.reduce((s, r) => s + Number(r.rating || 0), 0) / published.length
        : 0;
      return res.status(200).json({
        reviews,
        averageRating: Math.round(avg * 10) / 10,
        /** Published + pending only (matches admin reviews page ALL tab). */
        totalReviews: totalVisible,
        reviewsWithMedia: withMedia,
        contentReviewsPercent,
        positiveSentimentPercent,
      });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const id = body.id as string;
    const status = body.status as string;
    const vpRaw = body.verifiedPurchase ?? body.verified_purchase;
    const hasVp = vpRaw !== undefined && vpRaw !== null && String(vpRaw).length > 0;
    const verifiedPurchase = hasVp
      ? vpRaw === true || vpRaw === 1 || String(vpRaw).toLowerCase() === 'true' || String(vpRaw).toLowerCase() === '1'
      : undefined;
    const statusOk = typeof status === 'string' && ['pending', 'published', 'rejected'].includes(status);
    if (!id || (!statusOk && verifiedPurchase === undefined)) {
      return res.status(400).json({
        error: 'id required, and either status (pending|published|rejected) or verifiedPurchase (boolean)',
      });
    }
    try {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (statusOk) patch.status = status;
      if (verifiedPurchase !== undefined) patch.verified_purchase = verifiedPurchase;
      const { data, error } = await supabase.from('reviews').update(patch).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      await writeAuditLog({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'review.update',
        resourceType: 'reviews',
        resourceId: id,
        details: { status: statusOk ? status : undefined, verified_purchase: verifiedPurchase },
      });
      const raw = (data ?? {}) as Record<string, unknown>;
      let item = toReviewItem(raw);
      if (!item.clientProfilePhotoUrl) {
        const fromProf = await profilePhotoForSingleEmail(supabase, String(item.email ?? raw.email ?? ''));
        if (fromProf) item = { ...item, clientProfilePhotoUrl: fromProf };
      }
      return res.status(200).json(item);
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
    const vpIn = body.verifiedPurchase ?? body.verified_purchase;
    const verifiedPurchaseInsert =
      vpIn === true ||
      vpIn === 1 ||
      String(vpIn).toLowerCase() === 'true' ||
      String(vpIn).toLowerCase() === '1';
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
          verified_purchase: verifiedPurchaseInsert,
        })
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      const raw = (data ?? {}) as Record<string, unknown>;
      let item = toReviewItem(raw);
      if (!item.clientProfilePhotoUrl) {
        const fromProf = await profilePhotoForSingleEmail(supabase, String(item.email ?? raw.email ?? ''));
        if (fromProf) item = { ...item, clientProfilePhotoUrl: fromProf };
      }
      return res.status(201).json(item);
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
