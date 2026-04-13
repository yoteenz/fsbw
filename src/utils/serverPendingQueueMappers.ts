import type { StoredSignedOrderForm } from './signedOrderFormsStorage';
import type { PendingMockAffiliateItem, PendingMockReview } from './adminPendingMockQueues';

function fmtShortDate(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

export function serverOrderFormRowToStored(row: Record<string, unknown>): StoredSignedOrderForm | null {
  const id = String(row.id || '');
  const payload = row.payload;
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as StoredSignedOrderForm;
  return {
    ...p,
    serverQueueId: id,
  };
}

export function serverDbReviewToPendingMock(r: Record<string, unknown>): PendingMockReview {
  const photos = Array.isArray(r.photos) ? (r.photos as string[]) : [];
  const videos = Array.isArray(r.video_urls) ? (r.video_urls as string[]) : [];
  const vidN = Number(r.videos) || 0;
  return {
    id: String(r.id),
    client: String(r.client_name || r.email || 'CLIENT')
      .trim()
      .toUpperCase(),
    email: String(r.email || '')
      .trim()
      .toLowerCase(),
    clientRegionParen:
      typeof r.client_region_paren === 'string'
        ? r.client_region_paren
        : typeof r.clientRegionParen === 'string'
          ? r.clientRegionParen
          : undefined,
    clientRegionCode:
      typeof r.client_region_code === 'string'
        ? r.client_region_code
        : typeof r.clientRegionCode === 'string'
          ? r.clientRegionCode
          : undefined,
    product: String(r.product || 'REVIEW')
      .trim()
      .toUpperCase(),
    rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
    excerpt: String(r.review || '').trim(),
    date: fmtShortDate(String(r.created_at || '')),
    submittedAtIso: String(r.created_at || '').trim() || undefined,
    status: 'PENDING',
    source: 'client',
    photoUrls: photos,
    videoUrls: videos,
    photoCount: photos.length,
    videoCount: Math.max(vidN, videos.length),
    clientProfilePhotoUrl: String(r.client_profile_photo_url || r.clientProfilePhotoUrl || '').trim() || undefined,
    serverType: 'db_review',
    serverId: String(r.id),
  };
}

export function serverReviewSupplementalToPendingMock(r: Record<string, unknown>): PendingMockReview {
  const photos = Array.isArray(r.photos) ? (r.photos as string[]) : [];
  const videos = Array.isArray(r.videos) ? (r.videos as string[]) : [];
  const em = String(r.email || '').trim().toLowerCase();
  return {
    id: String(r.id),
    client: em ? em.toUpperCase() : 'CLIENT',
    email: em,
    clientRegionParen:
      typeof r.client_region_paren === 'string'
        ? r.client_region_paren
        : typeof r.clientRegionParen === 'string'
          ? r.clientRegionParen
          : undefined,
    clientRegionCode:
      typeof r.client_region_code === 'string'
        ? r.client_region_code
        : typeof r.clientRegionCode === 'string'
          ? r.clientRegionCode
          : undefined,
    product: String(r.subtitle || r.product || 'SUPPLEMENTAL MEDIA')
      .trim()
      .toUpperCase(),
    rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
    excerpt: String(r.review_excerpt || r.reviewExcerpt || '').trim() || 'SUPPLEMENTAL PHOTOS/VIDEOS.',
    date: fmtShortDate(String(r.created_at || '')),
    submittedAtIso: String(r.created_at || '').trim() || undefined,
    status: 'PENDING',
    source: 'client',
    photoUrls: photos,
    videoUrls: videos,
    photoCount: photos.length,
    videoCount: videos.length,
    reviewSupplementalSubmission: true,
    targetReviewId: String(r.client_review_key || r.clientReviewKey || ''),
    serverType: 'review_supplemental',
    serverId: String(r.id),
  };
}

export function serverAffiliateRowToPendingMock(r: Record<string, unknown>): PendingMockAffiliateItem | null {
  const payload = r.payload;
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  const kind = String(p.kind || r.kind || 'photo').toLowerCase() as 'photo' | 'video' | 'social';
  if (!['photo', 'video', 'social'].includes(kind)) return null;
  const email = String(r.email || p.email || '')
    .trim()
    .toLowerCase();
  const client = String(p.client || email || 'CLIENT')
    .trim()
    .toUpperCase();
  const imageSrc = typeof p.imageSrc === 'string' ? p.imageSrc : undefined;
  const videoDataUrl = typeof p.videoDataUrl === 'string' ? p.videoDataUrl : undefined;
  const cap =
    kind === 'social'
      ? 'AFFILIATE SOCIAL LINK'
      : kind === 'video'
        ? 'AFFILIATE VIDEO SUBMISSION'
        : 'AFFILIATE PHOTO SUBMISSION';
  const productName =
    typeof p.productName === 'string'
      ? p.productName.trim().toUpperCase()
      : typeof p.product === 'string'
        ? p.product.trim().toUpperCase()
        : '';
  return {
    id: String(p.id || r.id),
    kind,
    client,
    email,
    clientProfilePhotoUrl: typeof p.clientProfilePhotoUrl === 'string' ? p.clientProfilePhotoUrl : undefined,
    clientRegionParen: typeof p.clientRegionParen === 'string' ? p.clientRegionParen : undefined,
    clientRegionCode: typeof p.clientRegionCode === 'string' ? p.clientRegionCode : undefined,
    productName: productName || undefined,
    caption: cap,
    imageSrc,
    videoDataUrl,
    platform: typeof p.platform === 'string' ? p.platform : undefined,
    handle: typeof p.handle === 'string' ? p.handle : undefined,
    date: fmtShortDate(String(r.created_at || '')),
    status: 'PENDING',
    source: 'client',
    orderId: typeof p.orderId === 'string' ? p.orderId : undefined,
    affiliateContentId: typeof p.affiliateContentId === 'string' ? p.affiliateContentId : undefined,
    serverType: 'affiliate',
    serverId: String(r.id),
  };
}
