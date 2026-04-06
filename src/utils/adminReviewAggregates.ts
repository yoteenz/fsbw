/**
 * Shared admin review rollups for dashboard + reviews page (same visibility rules).
 */

export function adminReviewStatusVisible(status: unknown): boolean {
  const s = String(status ?? 'published').toLowerCase();
  return s === 'published' || s === 'pending';
}

function reviewPhotoCountFromRow(r: Record<string, unknown>): number {
  const p = r.photos;
  if (Array.isArray(p)) return p.length;
  const n = Number(p);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function reviewVideoCountFromRow(r: Record<string, unknown>): number {
  const v = r.videos;
  if (typeof v === 'number' && Number.isFinite(v)) return v > 0 ? v : 0;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function adminReviewRowHasPhotoOrVideo(r: Record<string, unknown>): boolean {
  return reviewPhotoCountFromRow(r) > 0 || reviewVideoCountFromRow(r) > 0;
}

/** % of visible reviews (published + pending) that include at least one photo or video. */
export function percentVisibleReviewsWithMedia(reviews: unknown[]): number {
  const rows = reviews.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object');
  const vis = rows.filter((r) => adminReviewStatusVisible(r.status));
  if (vis.length === 0) return 0;
  const withMedia = vis.filter((r) => adminReviewRowHasPhotoOrVideo(r)).length;
  return Math.round((withMedia / vis.length) * 100);
}

/** % of visible reviews with rating >= minStar (default 4 = positive sentiment). */
export function percentVisibleReviewsPositive(
  reviews: unknown[],
  minStar: number = 4
): number {
  const rows = reviews.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object');
  const vis = rows.filter((r) => adminReviewStatusVisible(r.status));
  if (vis.length === 0) return 0;
  const pos = vis.filter((r) => (Number(r.rating) || 0) >= minStar).length;
  return Math.round((pos / vis.length) * 100);
}

export function countVisibleAdminReviews(reviews: unknown[]): number {
  const rows = reviews.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object');
  return rows.filter((r) => adminReviewStatusVisible(r.status)).length;
}

export function countVisibleReviewsWithMedia(reviews: unknown[]): number {
  const rows = reviews.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object');
  return rows
    .filter((r) => adminReviewStatusVisible(r.status))
    .filter((r) => adminReviewRowHasPhotoOrVideo(r)).length;
}

export function averageRatingForVisibleReviews(reviews: unknown[]): number {
  const rows = reviews.filter((x): x is Record<string, unknown> => x !== null && typeof x === 'object');
  const vis = rows.filter((r) => adminReviewStatusVisible(r.status));
  if (vis.length === 0) return 0;
  const sum = vis.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  return Math.round((sum / vis.length) * 10) / 10;
}
