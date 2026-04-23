/**
 * GET /api/admin/pending-queue — all pending rows for Admin Pending page (service role).
 * PATCH /api/admin/pending-queue — approve/decline by type + id.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { writeAuditLog } from '../_lib/auditLog.js';
import {
  applyAffiliateApprovalFromPayload,
  applyAffiliateDeclineFromPayload,
  applySupplementalApproval,
  clearSupplementalPendingOnProfile,
  handleOrderFormApproved,
  handleOrderFormDeclined,
  normEmail,
} from '../_lib/pendingQueueHandlers.js';

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

function fmtDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    return res.status(503).json({ error: e instanceof Error ? e.message : 'Supabase not configured' });
  }

  if (req.method === 'GET') {
    try {
      const [forms, aff, supp, reviewsRes] = await Promise.all([
        supabase.from('pending_order_forms').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(200),
        supabase.from('pending_affiliate_submissions').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(200),
        supabase.from('pending_review_supplemental').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(200),
        supabase.from('reviews').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(200),
      ]);

      const orderForms = Array.isArray(forms.data) ? forms.data : [];
      const affiliate = Array.isArray(aff.data) ? aff.data : [];
      const reviewSupplemental = Array.isArray(supp.data) ? supp.data : [];
      const dbReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

      if (forms.error) console.error('pending-queue forms', forms.error.message);
      if (aff.error) console.error('pending-queue aff', aff.error.message);
      if (supp.error) console.error('pending-queue supp', supp.error.message);
      if (reviewsRes.error) console.error('pending-queue reviews', reviewsRes.error.message);

      return res.status(200).json({
        orderForms,
        affiliate,
        reviewSupplemental,
        dbReviews,
      });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    const type = String(body.type || '').toLowerCase();
    const id = String(body.id || '');
    const decision = String(body.decision || '').toLowerCase();
    const reason = String(body.reason || '').trim();
    if (!id || !['approve', 'decline'].includes(decision)) {
      return res.status(400).json({ error: 'id and decision (approve|decline) required' });
    }

    try {
      if (type === 'order_form') {
        const { data: row, error: fErr } = await supabase.from('pending_order_forms').select('*').eq('id', id).maybeSingle();
        if (fErr) return res.status(500).json({ error: fErr.message });
        if (!row) return res.status(404).json({ error: 'Not found' });
        const r = row as { user_id?: string; payload?: Record<string, unknown>; status?: string };
        const uid = String(r.user_id || '');
        const payload = (r.payload && typeof r.payload === 'object' ? r.payload : {}) as Record<string, unknown>;
        if (decision === 'approve') {
          await handleOrderFormApproved(supabase, payload, uid);
          await supabase
            .from('pending_order_forms')
            .update({ status: 'approved', updated_at: new Date().toISOString(), admin_decline_reason: null })
            .eq('id', id);
        } else {
          await handleOrderFormDeclined(supabase, payload, uid, reason);
          await supabase
            .from('pending_order_forms')
            .update({
              status: 'declined',
              updated_at: new Date().toISOString(),
              admin_decline_reason: reason || null,
            })
            .eq('id', id);
        }
        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: decision === 'approve' ? 'pending_order_form.approve' : 'pending_order_form.decline',
          resourceType: 'pending_order_forms',
          resourceId: id,
          details: { reason: reason || undefined },
        });
        return res.status(200).json({ ok: true });
      }

      if (type === 'affiliate') {
        const { data: row, error: fErr } = await supabase.from('pending_affiliate_submissions').select('*').eq('id', id).maybeSingle();
        if (fErr) return res.status(500).json({ error: fErr.message });
        if (!row) return res.status(404).json({ error: 'Not found' });
        const r = row as { user_id?: string; payload?: Record<string, unknown> };
        const uid = String(r.user_id || '');
        const payload = (r.payload && typeof r.payload === 'object' ? r.payload : {}) as Record<string, unknown>;
        if (decision === 'approve') {
          await applyAffiliateApprovalFromPayload(supabase, uid, payload);
          await supabase
            .from('pending_affiliate_submissions')
            .update({ status: 'approved', updated_at: new Date().toISOString(), admin_decline_reason: null })
            .eq('id', id);
        } else {
          await applyAffiliateDeclineFromPayload(supabase, uid, payload, reason);
          await supabase
            .from('pending_affiliate_submissions')
            .update({
              status: 'declined',
              updated_at: new Date().toISOString(),
              admin_decline_reason: reason || null,
            })
            .eq('id', id);
        }
        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: decision === 'approve' ? 'pending_affiliate.approve' : 'pending_affiliate.decline',
          resourceType: 'pending_affiliate_submissions',
          resourceId: id,
          details: { reason: reason || undefined },
        });
        return res.status(200).json({ ok: true });
      }

      if (type === 'review_supplemental') {
        const { data: row, error: fErr } = await supabase.from('pending_review_supplemental').select('*').eq('id', id).maybeSingle();
        if (fErr) return res.status(500).json({ error: fErr.message });
        if (!row) return res.status(404).json({ error: 'Not found' });
        const r = row as {
          user_id?: string;
          client_review_key?: string;
          photos?: unknown;
          videos?: unknown;
        };
        const uid = String(r.user_id || '');
        const key = String(r.client_review_key || '');
        const photos = Array.isArray(r.photos) ? r.photos : [];
        const videos = Array.isArray(r.videos) ? r.videos : [];
        if (decision === 'approve') {
          await applySupplementalApproval(supabase, uid, key, photos, videos);
          await supabase
            .from('pending_review_supplemental')
            .update({ status: 'approved', updated_at: new Date().toISOString(), admin_decline_reason: null })
            .eq('id', id);
        } else {
          await clearSupplementalPendingOnProfile(supabase, uid, id);
          await supabase
            .from('pending_review_supplemental')
            .update({
              status: 'declined',
              updated_at: new Date().toISOString(),
              admin_decline_reason: reason || null,
            })
            .eq('id', id);
        }
        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: decision === 'approve' ? 'pending_review_supplemental.approve' : 'pending_review_supplemental.decline',
          resourceType: 'pending_review_supplemental',
          resourceId: id,
          details: { reason: reason || undefined },
        });
        return res.status(200).json({ ok: true });
      }

      if (type === 'db_review') {
        const status = decision === 'approve' ? 'published' : 'rejected';
        const { error: uErr } = await supabase
          .from('reviews')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (uErr) return res.status(500).json({ error: uErr.message });

        if (decision === 'decline') {
          const { data: revRow } = await supabase.from('reviews').select('email').eq('id', id).maybeSingle();
          const em = normEmail(String((revRow as { email?: string } | null)?.email || ''));
          if (em) {
            const { data: prof } = await supabase.from('profiles').select('id, user_submitted_reviews').eq('email', em).maybeSingle();
            const p = prof as { id?: string; user_submitted_reviews?: unknown[] } | null;
            if (p?.id && Array.isArray(p.user_submitted_reviews)) {
              const filtered = p.user_submitted_reviews.filter((x) => String((x as { id?: string }).id || '') !== id);
              await supabase
                .from('profiles')
                .update({ user_submitted_reviews: filtered, updated_at: new Date().toISOString() })
                .eq('id', p.id);
            }
          }
        }

        if (decision === 'approve') {
          const { data: rev } = await supabase.from('reviews').select('*').eq('id', id).maybeSingle();
          const raw = (rev || {}) as Record<string, unknown>;
          const em = normEmail(String(raw.email || ''));
          if (em) {
            const { data: prof } = await supabase.from('profiles').select('id, user_submitted_reviews').eq('email', em).maybeSingle();
            const p = prof as { id?: string; user_submitted_reviews?: unknown } | null;
            if (p?.id) {
              const list = Array.isArray(p.user_submitted_reviews) ? [...p.user_submitted_reviews] : [];
              const photos = Array.isArray(raw.photos) ? raw.photos : [];
              const vids = Array.isArray(raw.video_urls) ? raw.video_urls : [];
              const productLine = String(raw.product || '').trim() || 'REVIEW';
              const bodyText = String(raw.review || '').trim();
              const subtitle =
                bodyText.length > 0 ? bodyText.slice(0, 60).toUpperCase() + (bodyText.length > 60 ? '…' : '') : 'CUSTOMER REVIEW';
              const entry = {
                id: String(raw.id || id),
                date: fmtDate(String(raw.created_at || '')).replace(/\//g, '-'),
                productName: productLine,
                subtitle,
                body: bodyText,
                rating: Number(raw.rating) || 5,
                reviewCount: 1,
                thumbnail: '/assets/natural front.png',
                moderationStatus: undefined,
                supplementalPhotos: photos.length ? photos : undefined,
                supplementalVideos: vids.length ? vids : undefined,
              };
              const filtered = list.filter((x) => String((x as { id?: string }).id || '') !== entry.id);
              filtered.push(entry);
              await supabase
                .from('profiles')
                .update({ user_submitted_reviews: filtered, updated_at: new Date().toISOString() })
                .eq('id', p.id);
            }
          }
        }

        await writeAuditLog({
          actorId: admin.id,
          actorEmail: admin.email,
          action: decision === 'approve' ? 'reviews.publish' : 'reviews.reject',
          resourceType: 'reviews',
          resourceId: id,
          details: { status, reason: reason || undefined },
        });
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'type must be order_form|affiliate|review_supplemental|db_review' });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
