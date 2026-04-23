/**
 * POST /api/client/submissions — authenticated client writes to server pending queues + profile JSON.
 * Body: { kind, ... } — see handlers below.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    return res.status(503).json({ error: e instanceof Error ? e.message : 'Server not configured' });
  }

  const body = parseBody(req);
  const kind = String(body.kind || '').toLowerCase();

  try {
    if (kind === 'order_form') {
      const payload = body.payload;
      if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'payload required' });
      const email = String((payload as { email?: string }).email || user.email).trim().toLowerCase();
      const { data, error } = await supabase
        .from('pending_order_forms')
        .insert({
          user_id: user.id,
          email,
          status: 'pending',
          payload,
        })
        .select('id')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ id: (data as { id?: string })?.id });
    }

    if (kind === 'affiliate') {
      const items = body.items;
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items array required' });
      const email = String(body.email || user.email).trim().toLowerCase();
      const content = body.affiliateContent;
      if (!content || typeof content !== 'object') return res.status(400).json({ error: 'affiliateContent object required' });

      const rows = items.map((it) => ({
        user_id: user.id,
        email,
        kind: String((it as { kind?: string }).kind || 'photo'),
        status: 'pending',
        payload: it,
      }));

      const { data, error } = await supabase.from('pending_affiliate_submissions').insert(rows).select('id');
      if (error) return res.status(500).json({ error: error.message });

      await supabase
        .from('profiles')
        .update({
          affiliate_submitted_content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return res.status(201).json({ ids: Array.isArray(data) ? data.map((r: { id: string }) => r.id) : [] });
    }

    if (kind === 'review_supplemental') {
      const clientReviewKey = String(body.clientReviewKey || '').trim();
      const photos = Array.isArray(body.photos) ? body.photos : [];
      const videos = Array.isArray(body.videos) ? body.videos : [];
      if (!clientReviewKey) return res.status(400).json({ error: 'clientReviewKey required' });
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
      const product = String(body.product || '');
      const subtitle = String(body.subtitle || '');
      const reviewExcerpt = String(body.reviewExcerpt || '');

      const { data, error } = await supabase
        .from('pending_review_supplemental')
        .insert({
          user_id: user.id,
          email: String(user.email || '').trim().toLowerCase(),
          client_review_key: clientReviewKey,
          rating,
          product,
          subtitle,
          review_excerpt: reviewExcerpt,
          photos,
          videos,
          status: 'pending',
        })
        .select('id')
        .single();
      if (error) return res.status(500).json({ error: error.message });

      const queueId = String((data as { id?: string })?.id || '');
      const { data: prof } = await supabase
        .from('profiles')
        .select('user_submitted_reviews, review_supplemental_overlay')
        .eq('id', user.id)
        .maybeSingle();
      const list = Array.isArray((prof as { user_submitted_reviews?: unknown })?.user_submitted_reviews)
        ? [...((prof as { user_submitted_reviews: unknown[] }).user_submitted_reviews)]
        : [];
      let hit = false;
      const next = list.map((row) => {
        const r = row as Record<string, unknown>;
        if (String(r.id || '') !== clientReviewKey) return row;
        hit = true;
        return {
          ...r,
          supplementalContentStatus: 'pending',
          supplementalPendingQueueId: queueId,
        };
      });
      const overlayRaw = (prof as { review_supplemental_overlay?: unknown })?.review_supplemental_overlay;
      const overlay =
        overlayRaw && typeof overlayRaw === 'object' && !Array.isArray(overlayRaw)
          ? { ...(overlayRaw as Record<string, unknown>) }
          : {};
      if (!hit) {
        overlay[clientReviewKey] = {
          supplementalContentStatus: 'pending',
          supplementalPendingQueueId: queueId,
        };
      }
      await supabase
        .from('profiles')
        .update({
          user_submitted_reviews: next,
          review_supplemental_overlay: overlay,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return res.status(201).json({ id: queueId });
    }

    if (kind === 'review') {
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
      const product = String(body.product || '');
      const reviewText = String(body.review || body.reviewText || '');
      const clientName = String(body.clientName || body.client_name || '');
      const photos = Array.isArray(body.photos) ? body.photos : [];
      const videos = Array.isArray(body.videos) ? body.videos : [];
      const email = String(user.email || '').trim().toLowerCase();
      if (!email) return res.status(400).json({ error: 'email missing' });

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          email,
          client_name: clientName,
          rating,
          product,
          review: reviewText,
          status: 'pending',
          photos,
          video_urls: videos,
          videos: videos.length,
          verified_purchase: true,
        })
        .select('id')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      const reviewId = String((data as { id?: string })?.id || '');

      const { data: prof } = await supabase.from('profiles').select('user_submitted_reviews').eq('id', user.id).maybeSingle();
      const list = Array.isArray((prof as { user_submitted_reviews?: unknown })?.user_submitted_reviews)
        ? [...((prof as { user_submitted_reviews: unknown[] }).user_submitted_reviews)]
        : [];
      const dateStr = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
      const entry = {
        id: reviewId,
        date: dateStr,
        productName: product || 'REVIEW',
        subtitle: reviewText.trim() ? reviewText.trim().slice(0, 60).toUpperCase() + (reviewText.length > 60 ? '…' : '') : 'CUSTOMER REVIEW',
        body: reviewText,
        rating,
        reviewCount: 1,
        thumbnail: '/assets/natural front.png',
        moderationStatus: 'pending',
      };
      list.push(entry);
      await supabase
        .from('profiles')
        .update({ user_submitted_reviews: list, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      return res.status(201).json({ id: reviewId });
    }

    if (kind === 'profile_reviews') {
      const reviews = body.userSubmittedReviews;
      if (!Array.isArray(reviews)) return res.status(400).json({ error: 'userSubmittedReviews array required' });
      const { error } = await supabase
        .from('profiles')
        .update({ user_submitted_reviews: reviews, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'kind must be order_form|affiliate|review_supplemental|review|profile_reviews' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
