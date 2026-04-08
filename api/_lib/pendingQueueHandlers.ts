/**
 * Side effects when admin approves/declines pending_queue rows (service role).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

function normEmail(e: string): string {
  return String(e || '')
    .trim()
    .toLowerCase();
}

export async function mergeProfileJson(
  supabase: SupabaseClient,
  userId: string,
  column: 'user_submitted_reviews' | 'affiliate_submitted_content',
  merger: (prev: unknown) => unknown
): Promise<void> {
  const { data: row, error: rErr } = await supabase.from('profiles').select(column).eq('id', userId).maybeSingle();
  if (rErr) throw new Error(rErr.message);
  const prev = row ? (row as Record<string, unknown>)[column] : undefined;
  const next = merger(prev ?? (column === 'affiliate_submitted_content' ? {} : []));
  const { error } = await supabase
    .from('profiles')
    .update({ [column]: next, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

/** Approve supplemental: merge photos/videos into the matching review object in user_submitted_reviews by id === client_review_key. */
export async function applySupplementalApproval(
  supabase: SupabaseClient,
  userId: string,
  clientReviewKey: string,
  photos: unknown[],
  videos: unknown[]
): Promise<void> {
  await mergeProfileJson(supabase, userId, 'user_submitted_reviews', (prev) => {
    const list = Array.isArray(prev) ? [...prev] : [];
    return list.map((item) => {
      const r = item as Record<string, unknown>;
      if (String(r.id || '') !== clientReviewKey) return item;
      return {
        ...r,
        supplementalPhotos: photos,
        supplementalVideos: videos,
        supplementalContentStatus: 'approved',
        supplementalPendingQueueId: undefined,
      };
    });
  });
}

export async function clearSupplementalPendingOnProfile(
  supabase: SupabaseClient,
  userId: string,
  pendingQueueId: string
): Promise<void> {
  await mergeProfileJson(supabase, userId, 'user_submitted_reviews', (prev) => {
    const list = Array.isArray(prev) ? [...prev] : [];
    return list.map((item) => {
      const r = item as Record<string, unknown>;
      if (String(r.supplementalPendingQueueId || '') !== pendingQueueId) return item;
      return {
        ...r,
        supplementalContentStatus: 'none',
        supplementalPendingQueueId: undefined,
      };
    });
  });
}

type AffiliatePayload = {
  orderId?: string;
  affiliateContentId?: string;
  kind?: string;
  [k: string]: unknown;
};

/** After affiliate submission approved: set item approved in profile affiliate_submitted_content. */
export async function applyAffiliateApprovalFromPayload(
  supabase: SupabaseClient,
  userId: string,
  payload: AffiliatePayload
): Promise<void> {
  const orderId = String(payload.orderId || '').trim();
  const contentId = String(payload.affiliateContentId || '').trim();
  const kind = String(payload.kind || '').toLowerCase();
  if (!orderId || !contentId || !['photo', 'video', 'social'].includes(kind)) return;

  const bucket = kind === 'photo' ? 'photos' : kind === 'video' ? 'videos' : 'socials';

  await mergeProfileJson(supabase, userId, 'affiliate_submitted_content', (prev) => {
    const map =
      prev && typeof prev === 'object' && !Array.isArray(prev)
        ? { ...(prev as Record<string, unknown>) }
        : {};
    const order = map[orderId];
    const o =
      order && typeof order === 'object' && !Array.isArray(order)
        ? { ...(order as Record<string, unknown>) }
        : {};
    const arr = Array.isArray(o[bucket]) ? ([...(o[bucket] as unknown[])] as Record<string, unknown>[]) : [];
    const nextArr = arr.map((row) => {
      if (String(row.id || '') !== contentId) return row;
      return { ...row, status: 'approved', rejectionReason: undefined, points: row.points ?? 100 };
    });
    o[bucket] = nextArr;
    map[orderId] = o;
    return map;
  });
}

export async function applyAffiliateDeclineFromPayload(
  supabase: SupabaseClient,
  userId: string,
  payload: AffiliatePayload,
  reason: string
): Promise<void> {
  const orderId = String(payload.orderId || '').trim();
  const contentId = String(payload.affiliateContentId || '').trim();
  const kind = String(payload.kind || '').toLowerCase();
  if (!orderId || !contentId || !['photo', 'video', 'social'].includes(kind)) return;
  const bucket = kind === 'photo' ? 'photos' : kind === 'video' ? 'videos' : 'socials';

  await mergeProfileJson(supabase, userId, 'affiliate_submitted_content', (prev) => {
    const map =
      prev && typeof prev === 'object' && !Array.isArray(prev)
        ? { ...(prev as Record<string, unknown>) }
        : {};
    const order = map[orderId];
    const o =
      order && typeof order === 'object' && !Array.isArray(order)
        ? { ...(order as Record<string, unknown>) }
        : {};
    const arr = Array.isArray(o[bucket]) ? ([...(o[bucket] as unknown[])] as Record<string, unknown>[]) : [];
    const nextArr = arr.map((row) => {
      if (String(row.id || '') !== contentId) return row;
      return { ...row, status: 'rejected', rejectionReason: reason || undefined };
    });
    o[bucket] = nextArr;
    map[orderId] = o;
    return map;
  });
}

type OrderFormPayload = {
  email?: string;
  orderId?: string;
  orderNumber?: string;
  [k: string]: unknown;
};

function patchOrderInLists(
  active: unknown[],
  past: unknown[],
  orderId: string,
  patch: (o: Record<string, unknown>) => Record<string, unknown>
): { active: unknown[]; past: unknown[]; changed: boolean } {
  let changed = false;
  const mapArr = (arr: unknown[]) =>
    arr.map((row) => {
      const o = row as Record<string, unknown>;
      if (String(o.id || '') !== orderId) return row;
      changed = true;
      return patch(o);
    });
  return { active: mapArr(active), past: mapArr(past), changed };
}

export async function finalizeOrderAfterFormApproval(
  supabase: SupabaseClient,
  userId: string,
  orderId: string
): Promise<void> {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return;
  const row = data as { active_orders?: unknown; past_orders?: unknown };
  const active = Array.isArray(row.active_orders) ? row.active_orders : [];
  const past = Array.isArray(row.past_orders) ? row.past_orders : [];
  const now = Date.now();
  const { active: a2, past: p2, changed } = patchOrderInLists(active, past, orderId, (o) => {
    const st = String(o.status || '').toUpperCase();
    return {
      ...o,
      orderFormAdminApproved: true,
      orderFormClientSubmitted: true,
      status: st === 'PLACED' ? 'CONFIRMED' : o.status,
      orderFormAdminApprovedAt: now,
    };
  });
  if (!changed) return;
  const { error: uErr } = await supabase
    .from('orders')
    .update({ active_orders: a2, past_orders: p2, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (uErr) throw new Error(uErr.message);
}

export async function cancelOrderAfterFormDecline(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
  reason: string
): Promise<void> {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return;
  const row = data as { active_orders?: unknown; past_orders?: unknown };
  let active = Array.isArray(row.active_orders) ? [...row.active_orders] : [];
  let past = Array.isArray(row.past_orders) ? [...row.past_orders] : [];
  const idx = active.findIndex((o) => String((o as { id?: string }).id || '') === orderId);
  if (idx < 0) return;
  const o = { ...(active[idx] as Record<string, unknown>) };
  active.splice(idx, 1);
  o.status = 'CANCELED';
  o.orderFormAdminDeclined = true;
  o.orderFormAdminDeclineReason = reason || undefined;
  past = [o, ...past];
  const { error: uErr } = await supabase
    .from('orders')
    .update({ active_orders: active, past_orders: past, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (uErr) throw new Error(uErr.message);
}

async function mergeSignedOrderFormOnProfile(
  supabase: SupabaseClient,
  userId: string,
  entry: Record<string, unknown>,
  mode: 'approve' | 'decline',
  declineReason?: string
): Promise<void> {
  const { data: prof, error: pErr } = await supabase.from('profiles').select('signed_order_forms').eq('id', userId).maybeSingle();
  if (pErr) throw new Error(pErr.message);
  const list = Array.isArray((prof as { signed_order_forms?: unknown })?.signed_order_forms)
    ? ([...(prof as { signed_order_forms: unknown[] }).signed_order_forms] as Record<string, unknown>[])
    : [];
  const oid = String(entry.orderId || '').trim();
  const eid = String(entry.id || '').trim();
  const idx = list.findIndex(
    (r) => (oid && String(r.orderId || '') === oid) || (eid && String(r.id || '') === eid)
  );
  const now = Date.now();
  const base = idx >= 0 ? { ...list[idx], ...entry } : { ...entry };
  if (mode === 'approve') {
    const next = {
      ...base,
      adminApproved: true,
      adminApprovedAt: now,
      adminDeclined: false,
      adminDeclineReason: undefined,
    };
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
  } else {
    const next = {
      ...base,
      adminApproved: false,
      adminDeclined: true,
      adminDeclinedAt: now,
      adminDeclineReason: declineReason || undefined,
    };
    if (idx >= 0) list[idx] = next;
    else list.unshift(next);
  }
  const { error } = await supabase
    .from('profiles')
    .update({ signed_order_forms: list, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function handleOrderFormApproved(
  supabase: SupabaseClient,
  payload: OrderFormPayload & Record<string, unknown>,
  targetUserId: string
): Promise<void> {
  const orderId = String(payload.orderId || '').trim();
  if (orderId) await finalizeOrderAfterFormApproval(supabase, targetUserId, orderId);
  await mergeSignedOrderFormOnProfile(supabase, targetUserId, payload as Record<string, unknown>, 'approve');
}

export async function handleOrderFormDeclined(
  supabase: SupabaseClient,
  payload: OrderFormPayload & Record<string, unknown>,
  targetUserId: string,
  reason: string
): Promise<void> {
  const orderId = String(payload.orderId || '').trim();
  if (orderId) await cancelOrderAfterFormDecline(supabase, targetUserId, orderId, reason);
  await mergeSignedOrderFormOnProfile(supabase, targetUserId, payload as Record<string, unknown>, 'decline', reason);
}

export { normEmail };
