/**
 * Per-email overlay for supplemental review media on catalog/mock rows whose ids are not in `userSubmittedReviews_*`.
 */
import type { StoredReviewSupplementalFields, SupplementalContentStatus } from './reviewSupplementalMedia';
import { MAX_REVIEW_SUPPLEMENTAL_PHOTOS, MAX_REVIEW_SUPPLEMENTAL_VIDEOS } from './reviewSupplementalMedia';

const KEY_PREFIX = 'accountReviewsSupplementalOverlay_v1_';

function normEmail(email: string): string {
  return String(email || '')
    .trim()
    .toLowerCase();
}

export function supplementalOverlayStorageKey(email: string): string {
  return `${KEY_PREFIX}${normEmail(email)}`;
}

export function loadSupplementalOverlay(email: string): Record<string, StoredReviewSupplementalFields> {
  if (!normEmail(email)) return {};
  try {
    const raw = localStorage.getItem(supplementalOverlayStorageKey(email));
    if (!raw) return {};
    const p = JSON.parse(raw) as unknown;
    return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, StoredReviewSupplementalFields>) : {};
  } catch {
    return {};
  }
}

export function patchSupplementalOverlay(
  email: string,
  reviewId: string,
  patch: Partial<StoredReviewSupplementalFields>
): void {
  const e = normEmail(email);
  const id = String(reviewId || '').trim();
  if (!e || !id) return;
  const all = { ...loadSupplementalOverlay(e) };
  all[id] = { ...(all[id] || {}), ...patch };
  try {
    localStorage.setItem(supplementalOverlayStorageKey(e), JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('reviewsUpdated'));
  } catch {
    /* ignore */
  }
}

export function mergeReviewWithSupplementalOverlay<T extends Record<string, unknown>>(
  review: T,
  email: string,
  serverOverlay?: Record<string, StoredReviewSupplementalFields> | null
): T & StoredReviewSupplementalFields {
  const id = String(review.id || '');
  const localOv = loadSupplementalOverlay(email)[id];
  const srvOv = serverOverlay && typeof serverOverlay === 'object' ? serverOverlay[id] : undefined;
  const ov = { ...localOv, ...srvOv };
  const st = (v: unknown): SupplementalContentStatus | undefined => {
    const s = String(v || '').toLowerCase();
    if (s === 'pending' || s === 'approved' || s === 'rejected' || s === 'none') return s as SupplementalContentStatus;
    return undefined;
  };
  if (!localOv && !srvOv) {
    return {
      ...review,
      supplementalPhotos: review.supplementalPhotos as string[] | undefined,
      supplementalVideos: review.supplementalVideos as string[] | undefined,
      supplementalContentStatus: st(review.supplementalContentStatus),
      supplementalPendingQueueId: review.supplementalPendingQueueId as string | undefined,
    } as T & StoredReviewSupplementalFields;
  }
  return {
    ...review,
    supplementalPhotos: ov.supplementalPhotos ?? (review.supplementalPhotos as string[] | undefined),
    supplementalVideos: ov.supplementalVideos ?? (review.supplementalVideos as string[] | undefined),
    supplementalContentStatus: st(ov.supplementalContentStatus ?? review.supplementalContentStatus),
    supplementalPendingQueueId: ov.supplementalPendingQueueId ?? (review.supplementalPendingQueueId as string | undefined),
  } as T & StoredReviewSupplementalFields;
}

/** When admin resolves supplemental pending: update overlay row matched by queue id (mock/catalog reviews). */
export function applySupplementalOverlayAdminDecision(
  email: string,
  pendingQueueId: string,
  decision: 'APPROVED' | 'DECLINED',
  photoUrls?: string[],
  videoUrls?: string[]
): boolean {
  const e = normEmail(email);
  const qid = String(pendingQueueId || '').trim();
  if (!e || !qid) return false;
  const all = loadSupplementalOverlay(e);
  let changed = false;
  const next = { ...all };
  for (const rid of Object.keys(next)) {
    const row = next[rid];
    if (String(row?.supplementalPendingQueueId || '') !== qid) continue;
    changed = true;
    if (decision === 'APPROVED') {
      const ph = (Array.isArray(photoUrls) ? photoUrls : [])
        .filter((u) => typeof u === 'string' && u.length > 0)
        .slice(0, MAX_REVIEW_SUPPLEMENTAL_PHOTOS);
      const vd = (Array.isArray(videoUrls) ? videoUrls : [])
        .filter((u) => typeof u === 'string' && u.length > 0)
        .slice(0, MAX_REVIEW_SUPPLEMENTAL_VIDEOS);
      next[rid] = {
        ...row,
        supplementalPhotos: ph,
        supplementalVideos: vd,
        supplementalContentStatus: 'approved',
        supplementalPendingQueueId: undefined,
      };
    } else {
      next[rid] = {
        ...row,
        supplementalContentStatus: 'none',
        supplementalPendingQueueId: undefined,
      };
    }
  }
  if (!changed) return false;
  try {
    localStorage.setItem(supplementalOverlayStorageKey(e), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('reviewsUpdated'));
  } catch {
    /* ignore */
  }
  return true;
}
