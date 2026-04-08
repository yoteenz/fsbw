/**
 * Sync Admin → Pending approve/decline back to client-side storage (account affiliate, user reviews).
 */

import { getPerUserKey, PER_USER_KEYS } from './perUserStorage';
import { getUserSubmittedReviewsKey } from '../constants/reviews';
import { MAX_REVIEW_SUPPLEMENTAL_PHOTOS, MAX_REVIEW_SUPPLEMENTAL_VIDEOS } from './reviewSupplementalMedia';
import { applySupplementalOverlayAdminDecision } from './accountReviewsSupplementalOverlay';

function normEmail(email: string): string {
  return String(email || '')
    .trim()
    .toLowerCase();
}

type AffiliateBucket = {
  photos: Array<{
    id: string;
    status: string;
    rejectionReason?: string;
    submittedDate?: string;
    points?: number;
  }>;
  videos: Array<{
    id: string;
    status: string;
    rejectionReason?: string;
    submittedDate?: string;
    points?: number;
  }>;
  socials: Array<{
    id: string;
    status: string;
    rejectionReason?: string;
    submittedDate?: string;
    points?: number;
  }>;
};

function loadAffiliateContentMap(email: string): Record<string, AffiliateBucket> {
  const key = getPerUserKey(PER_USER_KEYS.affiliateSubmittedContent, email);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, AffiliateBucket>) : {};
  } catch {
    return {};
  }
}

function saveAffiliateContentMap(email: string, map: Record<string, AffiliateBucket>): void {
  const key = getPerUserKey(PER_USER_KEYS.affiliateSubmittedContent, email);
  try {
    localStorage.setItem(key, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('affiliateSubmittedContentUpdated'));
  } catch {
    /* ignore */
  }
}

function patchAffiliateItemStatus(
  map: Record<string, AffiliateBucket>,
  orderId: string,
  bucket: 'photos' | 'videos' | 'socials',
  contentId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): boolean {
  const order = map[orderId];
  if (!order) return false;
  const list = order[bucket];
  if (!Array.isArray(list)) return false;
  let changed = false;
  const nextList = list.map((row) => {
    if (String(row.id) !== contentId) return row;
    changed = true;
    return {
      ...row,
      status,
      ...(status === 'rejected' ? { rejectionReason: rejectionReason || undefined } : { rejectionReason: undefined }),
      ...(status === 'approved' ? { points: row.points ?? 100 } : {}),
    };
  });
  if (!changed) return false;
  map[orderId] = { ...order, [bucket]: nextList };
  return true;
}

type AffiliateQueueItemLike = {
  source?: 'mock' | 'client';
  email: string;
  orderId?: string;
  affiliateContentId?: string;
  kind: 'photo' | 'video' | 'social';
};

type ReviewQueueItemLike = {
  source?: 'mock' | 'client';
  id: string;
  email: string;
  reviewSupplementalSubmission?: boolean;
  targetReviewId?: string;
  photoUrls?: string[];
  videoUrls?: string[];
};

/** After admin approves/declines an affiliate row that came from Account → Affiliate. */
export function applyAffiliateAdminDecisionToClientStorage(
  item: AffiliateQueueItemLike,
  decision: 'APPROVED' | 'DECLINED',
  declineReason?: string
): void {
  if (item.source !== 'client') return;
  const email = normEmail(item.email);
  const orderId = (item.orderId || '').trim();
  const contentId = (item.affiliateContentId || '').trim();
  if (!email || !orderId || !contentId) return;
  const bucket =
    item.kind === 'photo' ? 'photos' : item.kind === 'video' ? 'videos' : item.kind === 'social' ? 'socials' : null;
  if (!bucket) return;
  const map = loadAffiliateContentMap(email);
  const st = decision === 'APPROVED' ? 'approved' : 'rejected';
  if (patchAffiliateItemStatus(map, orderId, bucket, contentId, st, declineReason)) {
    saveAffiliateContentMap(email, map);
  }
}

/** After admin approves/declines a review from the client leave-review flow. */
export function applyClientReviewAdminDecisionToUserStorage(
  item: ReviewQueueItemLike,
  decision: 'APPROVED' | 'DECLINED',
  _declineReason?: string
): void {
  if (item.source !== 'client') return;
  const email = normEmail(item.email);
  if (!email) return;
  try {
    const key = getUserSubmittedReviewsKey(email);
    const raw = localStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    if (!Array.isArray(list)) return;
    const queueId = String(item.id || '');

    if (item.reviewSupplementalSubmission === true) {
      const next = list.map((row) => {
        const r = row as Record<string, unknown>;
        if (String(r.supplementalPendingQueueId || '') !== queueId) return row;
        if (decision === 'APPROVED') {
          const ph = (Array.isArray(item.photoUrls) ? item.photoUrls : [])
            .filter((u) => typeof u === 'string' && u.length > 0)
            .slice(0, MAX_REVIEW_SUPPLEMENTAL_PHOTOS);
          const vd = (Array.isArray(item.videoUrls) ? item.videoUrls : [])
            .filter((u) => typeof u === 'string' && u.length > 0)
            .slice(0, MAX_REVIEW_SUPPLEMENTAL_VIDEOS);
          return {
            ...r,
            supplementalPhotos: ph,
            supplementalVideos: vd,
            supplementalContentStatus: 'approved',
            supplementalPendingQueueId: undefined,
          };
        }
        return {
          ...r,
          supplementalContentStatus: 'none',
          supplementalPendingQueueId: undefined,
        };
      });
      localStorage.setItem(key, JSON.stringify(next));
      applySupplementalOverlayAdminDecision(
        email,
        queueId,
        decision === 'APPROVED' ? 'APPROVED' : 'DECLINED',
        Array.isArray(item.photoUrls) ? item.photoUrls : undefined,
        Array.isArray(item.videoUrls) ? item.videoUrls : undefined
      );
      window.dispatchEvent(new CustomEvent('reviewsUpdated'));
      return;
    }

    const id = queueId;
    if (decision === 'APPROVED') {
      const next = list.map((row) => {
        const r = row as Record<string, unknown>;
        if (String(r.id || '') !== id) return row;
        const { moderationStatus: _m, ...rest } = r;
        return rest;
      });
      localStorage.setItem(key, JSON.stringify(next));
    } else {
      const next = list.filter((row) => String((row as Record<string, unknown>).id || '') !== id);
      localStorage.setItem(key, JSON.stringify(next));
    }
    window.dispatchEvent(new CustomEvent('reviewsUpdated'));
  } catch {
    /* ignore */
  }
}

export type AffiliateContentSlice = {
  photos: Array<{ id: string; status: string; preview?: string; submittedDate?: string }>;
  videos: Array<{ id: string; status: string; preview?: string; submittedDate?: string }>;
  socials: Array<{ id: string; status: string; link?: string; platform?: string; submittedDate?: string }>;
};

export type ClientAffiliatePendingRow = {
  id: string;
  kind: 'photo' | 'video' | 'social';
  client: string;
  email: string;
  clientProfilePhotoUrl?: string;
  caption?: string;
  imageSrc?: string;
  videoDataUrl?: string;
  platform?: string;
  handle?: string;
  date: string;
  status: 'PENDING';
  source: 'client';
  orderId: string;
  affiliateContentId: string;
};

/** Build pending-queue rows for affiliate items that just moved to `pending` (new submit or re-submit after reject). */
export function buildAffiliatePendingItemsFromContentDiff(opts: {
  orderId: string;
  clientName: string;
  email: string;
  clientProfilePhotoUrl?: string;
  prev: AffiliateContentSlice;
  next: AffiliateContentSlice;
}): ClientAffiliatePendingRow[] {
  const { orderId, clientName, email, clientProfilePhotoUrl, prev, next } = opts;
  const em = normEmail(email);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const out: ClientAffiliatePendingRow[] = [];

  const shouldEnqueue = (
    oldRow: { id: string; status: string; submittedDate?: string } | undefined,
    newRow: { id: string; status: string; submittedDate?: string }
  ) => {
    if (newRow.status !== 'pending') return false;
    if (!oldRow) return true;
    if (oldRow.status === 'rejected' && newRow.status === 'pending') return true;
    return oldRow.submittedDate !== newRow.submittedDate;
  };

  for (const p of next.photos) {
    const old = prev.photos.find((x) => x.id === p.id);
    if (!shouldEnqueue(old, p)) continue;
    const preview = typeof p.preview === 'string' ? p.preview : '';
    if (!preview) continue;
    out.push({
      id: `aff-client-${orderId}-photo-${p.id}-${Date.now()}`,
      kind: 'photo',
      client: clientName.toUpperCase(),
      email: em,
      clientProfilePhotoUrl,
      caption: 'AFFILIATE PHOTO SUBMISSION',
      imageSrc: preview,
      date: dateStr,
      status: 'PENDING',
      source: 'client',
      orderId,
      affiliateContentId: p.id,
    });
  }

  for (const v of next.videos) {
    const old = prev.videos.find((x) => x.id === v.id);
    if (!shouldEnqueue(old, v)) continue;
    const preview = typeof v.preview === 'string' ? v.preview : '';
    if (!preview) continue;
    out.push({
      id: `aff-client-${orderId}-video-${v.id}-${Date.now()}`,
      kind: 'video',
      client: clientName.toUpperCase(),
      email: em,
      clientProfilePhotoUrl,
      caption: 'AFFILIATE VIDEO SUBMISSION',
      imageSrc: preview,
      videoDataUrl: preview.startsWith('data:video') ? preview : undefined,
      date: dateStr,
      status: 'PENDING',
      source: 'client',
      orderId,
      affiliateContentId: v.id,
    });
  }

  for (const s of next.socials) {
    const old = prev.socials.find((x) => x.id === s.id);
    if (!shouldEnqueue(old, s)) continue;
    const link = String(s.link || '').trim();
    if (!link) continue;
    const plat = String(s.platform || 'SOCIAL').toUpperCase();
    out.push({
      id: `aff-client-${orderId}-social-${s.id}-${Date.now()}`,
      kind: 'social',
      client: clientName.toUpperCase(),
      email: em,
      clientProfilePhotoUrl,
      caption: 'AFFILIATE SOCIAL LINK',
      platform: plat,
      handle: link.toUpperCase(),
      date: dateStr,
      status: 'PENDING',
      source: 'client',
      orderId,
      affiliateContentId: s.id,
    });
  }

  return out;
}
