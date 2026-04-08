/** Client-added photos/videos on Account → Reviews (post–text approval); max 2 + 2. */

export const MAX_REVIEW_SUPPLEMENTAL_PHOTOS = 2;
export const MAX_REVIEW_SUPPLEMENTAL_VIDEOS = 2;

export type SupplementalContentStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type StoredReviewSupplementalFields = {
  supplementalPhotos?: string[];
  supplementalVideos?: string[];
  supplementalContentStatus?: SupplementalContentStatus;
  /** Matches pending row id in admin queue until approved/declined. */
  supplementalPendingQueueId?: string;
};

export function normalizeSupplementalArrays(row: StoredReviewSupplementalFields): { photos: string[]; videos: string[] } {
  const photos = Array.isArray(row.supplementalPhotos)
    ? row.supplementalPhotos.filter((u) => typeof u === 'string' && u.length > 0).slice(0, MAX_REVIEW_SUPPLEMENTAL_PHOTOS)
    : [];
  const videos = Array.isArray(row.supplementalVideos)
    ? row.supplementalVideos.filter((u) => typeof u === 'string' && u.length > 0).slice(0, MAX_REVIEW_SUPPLEMENTAL_VIDEOS)
    : [];
  return { photos, videos };
}

/** Show ADD when no approved slots filled; EDIT when at least one slot can still be filled or user is replacing. */
export function reviewSupplementalCanAddOrEdit(row: StoredReviewSupplementalFields): boolean {
  const st = String(row.supplementalContentStatus || 'none').toLowerCase();
  if (st === 'pending') return false;
  const { photos, videos } = normalizeSupplementalArrays(row);
  return photos.length < MAX_REVIEW_SUPPLEMENTAL_PHOTOS || videos.length < MAX_REVIEW_SUPPLEMENTAL_VIDEOS;
}

export function reviewSupplementalLinkLabel(row: StoredReviewSupplementalFields): 'ADD CONTENT' | 'EDIT CONTENT' | 'CONTENT PENDING REVIEW' {
  const st = String(row.supplementalContentStatus || 'none').toLowerCase();
  if (st === 'pending') return 'CONTENT PENDING REVIEW';
  const { photos, videos } = normalizeSupplementalArrays(row);
  if (photos.length === 0 && videos.length === 0) return 'ADD CONTENT';
  return 'EDIT CONTENT';
}
