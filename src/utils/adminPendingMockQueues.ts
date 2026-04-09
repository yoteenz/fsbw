/**
 * Admin → Pending: mock queues for REVIEWS and AFFILIATE tabs (localStorage + approve/decline).
 */

import {
  applyAffiliateAdminDecisionToClientStorage,
  applyClientReviewAdminDecisionToUserStorage,
} from './adminPendingClientSync';

export const PENDING_MOCK_REVIEWS_UPDATED_EVENT = 'adminPendingMockReviewsUpdated';
export const PENDING_MOCK_AFFILIATE_UPDATED_EVENT = 'adminPendingMockAffiliateUpdated';

const REVIEWS_KEY = 'adminPendingMockReviews_v1';
const AFFILIATE_KEY = 'adminPendingMockAffiliate_v1';

/** Shown under pending affiliate rows so admins can see “REJECTED CONTENT” styling (demo). */
const DEMONSTRATION_DECLINED_AFFILIATE: PendingMockAffiliateItem[] = [
  {
    id: 'demo-declined-noir-ph',
    kind: 'photo',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    clientRegionParen: 'CALIFORNIA',
    productName: 'NOIR',
    caption: 'AFFILIATE PHOTO SUBMISSION',
    imageSrc: '/assets/gallery-mock.png',
    date: '3/20/2026',
    status: 'DECLINED',
    adminDeclineReason: 'IMAGE TOO DARK — PLEASE RESUBMIT WITH BRIGHTER LIGHTING.',
  },
  {
    id: 'demo-declined-noir-soc',
    kind: 'social',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    clientRegionParen: 'CALIFORNIA',
    productName: 'NOIR',
    caption: 'AFFILIATE SOCIAL LINK',
    platform: 'INSTAGRAM',
    handle: '@OLDHANDLE — REEL REMOVED',
    date: '3/18/2026',
    status: 'DECLINED',
    adminDeclineReason: 'LINK EXPIRED OR PRIVATE — NEED PUBLIC REEL URL.',
  },
];

export type PendingMockReview = {
  id: string;
  client: string;
  email: string;
  clientRegionParen?: string;
  clientRegionCode?: string;
  product: string;
  rating: number;
  excerpt: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  adminDeclineReason?: string;
  /** Client leave-review flow — sync approve/decline to `userSubmittedReviews_*`. */
  source?: 'mock' | 'client';
  photoUrls?: string[];
  videoUrls?: string[];
  photoCount?: number;
  videoCount?: number;
  /** Account → Reviews “add/edit content” only — approve merges media onto `targetReviewId`. */
  reviewSupplementalSubmission?: boolean;
  targetReviewId?: string;
  clientProfilePhotoUrl?: string;
  /** ISO timestamp for modal date+time line (from server `created_at` or mock). */
  submittedAtIso?: string;
  /** Server `pending_*` row — use PATCH /api/admin/pending-queue instead of local mock approve. */
  serverType?: 'db_review' | 'review_supplemental';
  serverId?: string;
};

export type PendingMockAffiliateKind = 'photo' | 'video' | 'social';

export type PendingMockAffiliateItem = {
  id: string;
  kind: PendingMockAffiliateKind;
  client: string;
  email: string;
  clientProfilePhotoUrl?: string;
  clientRegionParen?: string;
  clientRegionCode?: string;
  /** Unit / product name for gray line (NOIR, SOFT WAVE, BUNDLES, …) */
  productName?: string;
  /** Gray subtitle under client (e.g. AFFILIATE PHOTO SUBMISSION) */
  caption?: string;
  /** Thumbnail for photo/video */
  imageSrc?: string;
  /** When kind is video and preview is a data URL, use for playback in admin pending. */
  videoDataUrl?: string;
  platform?: string;
  handle?: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  adminDeclineReason?: string;
  /** Account → Affiliate submissions — sync approve/decline to per-user affiliate storage. */
  source?: 'mock' | 'client';
  orderId?: string;
  affiliateContentId?: string;
  serverType?: 'affiliate';
  serverId?: string;
};

const DEFAULT_REVIEWS: PendingMockReview[] = [
  {
    id: 'mock-rev-1',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    clientRegionParen: 'CALIFORNIA',
    product: 'NOIR 24" RAW RUSSIAN',
    rating: 5,
    excerpt: 'ABSOLUTELY IN LOVE WITH THE QUALITY AND THE INSTALL TEAM WAS SO PROFESSIONAL.',
    date: '3/28/2026',
    submittedAtIso: '2026-03-28T15:27:00.000Z',
    status: 'PENDING',
  },
  {
    id: 'mock-rev-2',
    client: 'MARIA RODRIGUEZ',
    email: 'maria.r@email.com',
    clientRegionParen: 'TEXAS',
    product: 'SOFT WAVE 26"',
    rating: 4,
    excerpt: 'GREAT TEXTURE, SHIPPING WAS FAST. WOULD LOVE SLIGHTLY MORE DENSITY NEXT TIME.',
    date: '3/26/2026',
    submittedAtIso: '2026-03-26T14:00:00.000Z',
    status: 'PENDING',
  },
  {
    id: 'mock-rev-3',
    client: 'JORDAN LEE',
    email: 'jordan.lee@email.com',
    clientRegionParen: 'NEW YORK',
    product: 'SLAY STYLING TOOL',
    rating: 5,
    excerpt: 'GAME CHANGER FOR MY MORNING ROUTINE. FIVE STARS.',
    date: '3/22/2026',
    submittedAtIso: '2026-03-22T11:30:00.000Z',
    status: 'PENDING',
  },
];

const DEFAULT_AFFILIATE: PendingMockAffiliateItem[] = [
  {
    id: 'mock-aff-ph-0',
    kind: 'photo',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    clientRegionParen: 'CALIFORNIA',
    productName: 'NOIR',
    caption: 'AFFILIATE PHOTO SUBMISSION',
    imageSrc: '/assets/gallery-mock.png',
    date: '3/27/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-ph-1',
    kind: 'photo',
    client: 'MARIA RODRIGUEZ',
    email: 'maria.r@email.com',
    clientRegionParen: 'TEXAS',
    productName: 'SOFT WAVE',
    caption: 'AFFILIATE PHOTO SUBMISSION',
    imageSrc: '/assets/gallery-mock.png',
    date: '3/27/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-ph-2',
    kind: 'photo',
    client: 'JORDAN LEE',
    email: 'jordan.lee@email.com',
    clientRegionParen: 'NEW YORK',
    productName: 'BUNDLES',
    caption: 'AFFILIATE PHOTO SUBMISSION',
    imageSrc: '/assets/gallery-mock.png',
    date: '3/26/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-vd-0',
    kind: 'video',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    clientRegionParen: 'CALIFORNIA',
    productName: 'NOIR',
    caption: 'AFFILIATE VIDEO SUBMISSION',
    imageSrc: '/assets/gallery-mock.png',
    date: '3/25/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-vd-1',
    kind: 'video',
    client: 'DIANA FOSTER',
    email: 'mock4@test.com',
    clientRegionParen: 'ILLINOIS',
    productName: 'SOFT WAVE',
    caption: 'AFFILIATE VIDEO SUBMISSION',
    imageSrc: '/assets/gallery-mock.png',
    date: '3/24/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-soc-0',
    kind: 'social',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    clientRegionParen: 'CALIFORNIA',
    productName: 'NOIR',
    caption: 'AFFILIATE SOCIAL LINK',
    platform: 'INSTAGRAM',
    handle: '@CLIENTSTYLE · REEL SUBMITTED',
    date: '3/27/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-soc-1',
    kind: 'social',
    client: 'MARIA RODRIGUEZ',
    email: 'maria.r@email.com',
    clientRegionParen: 'TEXAS',
    productName: 'SOFT WAVE',
    caption: 'AFFILIATE SOCIAL LINK',
    platform: 'TIKTOK',
    handle: '@WIGGLOW · TAGGED @FRONTALSLAYER',
    date: '3/24/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-soc-2',
    kind: 'social',
    client: 'JORDAN LEE',
    email: 'jordan.lee@email.com',
    clientRegionParen: 'NEW YORK',
    productName: 'OCEAN CURL',
    caption: 'AFFILIATE SOCIAL LINK',
    platform: 'YOUTUBE',
    handle: 'SHORTS · INSTALL ROUTINE',
    date: '3/20/2026',
    status: 'PENDING',
  },
];

function mergeAffiliateWithDefaults(stored: PendingMockAffiliateItem[]): PendingMockAffiliateItem[] {
  const byId = new Map(DEFAULT_AFFILIATE.map((d) => [d.id, d]));
  return stored.map((row) => {
    const base = byId.get(row.id);
    if (!base) {
      return {
        ...row,
        client: row.client || 'CLIENT',
        email: row.email || '',
      };
    }
    return { ...base, ...row, kind: row.kind || base.kind };
  });
}

function parseReviews(raw: string | null): PendingMockReview[] {
  if (!raw) return [];
  try {
    const a = JSON.parse(raw) as unknown;
    return Array.isArray(a) ? (a as PendingMockReview[]) : [];
  } catch {
    return [];
  }
}

/** Backfill `submittedAtIso` from defaults when localStorage predates that field. */
function mergeReviewsWithDefaults(stored: PendingMockReview[]): PendingMockReview[] {
  const byId = new Map(DEFAULT_REVIEWS.map((d) => [d.id, d]));
  let changed = false;
  const out = stored.map((row) => {
    const base = byId.get(row.id);
    if (!base) return row;
    const nextIso = row.submittedAtIso || base.submittedAtIso;
    if (nextIso && nextIso !== row.submittedAtIso) {
      changed = true;
      return { ...row, submittedAtIso: nextIso };
    }
    return row;
  });
  if (changed) saveReviews(out);
  return out;
}

function parseAffiliate(raw: string | null): PendingMockAffiliateItem[] {
  if (!raw) return [];
  try {
    const a = JSON.parse(raw) as unknown;
    return Array.isArray(a) ? (a as PendingMockAffiliateItem[]) : [];
  } catch {
    return [];
  }
}

function saveReviews(list: PendingMockReview[]): void {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(PENDING_MOCK_REVIEWS_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

function saveAffiliate(list: PendingMockAffiliateItem[]): void {
  try {
    localStorage.setItem(AFFILIATE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(PENDING_MOCK_AFFILIATE_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

/** Load queue; seed defaults once if storage empty. */
export function listPendingMockReviewsForAdmin(): PendingMockReview[] {
  if (typeof window === 'undefined') return [];
  const existing = parseReviews(localStorage.getItem(REVIEWS_KEY));
  if (existing.length === 0) {
    saveReviews(DEFAULT_REVIEWS);
    return [...DEFAULT_REVIEWS];
  }
  return mergeReviewsWithDefaults(existing);
}

export function listPendingMockAffiliateForAdmin(): PendingMockAffiliateItem[] {
  if (typeof window === 'undefined') return [];
  const existing = parseAffiliate(localStorage.getItem(AFFILIATE_KEY));
  if (existing.length === 0) {
    saveAffiliate([...DEFAULT_AFFILIATE, ...DEMONSTRATION_DECLINED_AFFILIATE]);
    return [...DEFAULT_AFFILIATE, ...DEMONSTRATION_DECLINED_AFFILIATE];
  }
  const merged = mergeAffiliateWithDefaults(existing);
  if (existing.some((row) => !(row.client || '').trim() || !(row.email || '').trim())) {
    saveAffiliate(merged);
  }
  const demoIds = new Set(DEMONSTRATION_DECLINED_AFFILIATE.map((d) => d.id));
  const hasAllDemo = DEMONSTRATION_DECLINED_AFFILIATE.every((d) => merged.some((r) => r.id === d.id));
  if (!hasAllDemo) {
    const withoutDup = merged.filter((r) => !demoIds.has(r.id));
    const next = [...withoutDup, ...DEMONSTRATION_DECLINED_AFFILIATE];
    saveAffiliate(next);
    return next;
  }
  return merged;
}

export function countPendingMockReviews(): number {
  return listPendingMockReviewsForAdmin().filter((r) => r.status === 'PENDING').length;
}

export function countPendingMockAffiliate(): number {
  return listPendingMockAffiliateForAdmin().filter((r) => r.status === 'PENDING').length;
}

export function approvePendingMockReview(id: string): void {
  const list = listPendingMockReviewsForAdmin();
  const target = list.find((r) => r.id === id);
  const next = list.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const, adminDeclineReason: undefined } : r));
  saveReviews(next);
  if (target?.source === 'client') applyClientReviewAdminDecisionToUserStorage(target, 'APPROVED');
}

export function declinePendingMockReview(id: string, reason: string): void {
  const r = (reason || '').trim();
  const list = listPendingMockReviewsForAdmin();
  const target = list.find((row) => row.id === id);
  const next = list.map((row) =>
    row.id === id ? { ...row, status: 'DECLINED' as const, adminDeclineReason: r || undefined } : row
  );
  saveReviews(next);
  if (target?.source === 'client') applyClientReviewAdminDecisionToUserStorage(target, 'DECLINED', r);
}

export function approvePendingMockAffiliate(id: string): void {
  const list = listPendingMockAffiliateForAdmin();
  const target = list.find((r) => r.id === id);
  const next = list.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const, adminDeclineReason: undefined } : r));
  saveAffiliate(next);
  if (target?.source === 'client') applyAffiliateAdminDecisionToClientStorage(target, 'APPROVED');
}

export function declinePendingMockAffiliate(id: string, reason: string): void {
  const r = (reason || '').trim();
  const list = listPendingMockAffiliateForAdmin();
  const target = list.find((row) => row.id === id);
  const next = list.map((row) =>
    row.id === id ? { ...row, status: 'DECLINED' as const, adminDeclineReason: r || undefined } : row
  );
  saveAffiliate(next);
  if (target?.source === 'client') applyAffiliateAdminDecisionToClientStorage(target, 'DECLINED', r);
}

/** Prepend client-submitted rows (Account → Affiliate) so they appear on Admin → Pending → AFFILIATE. */
export function enqueuePendingMockAffiliateItems(items: PendingMockAffiliateItem[]): void {
  if (!items.length || typeof window === 'undefined') return;
  const list = listPendingMockAffiliateForAdmin();
  saveAffiliate([...items, ...list]);
}

/** Prepend client-submitted rows (leave-review flow) so they appear on Admin → Pending → REVIEWS. */
export function enqueuePendingMockReviews(items: PendingMockReview[]): void {
  if (!items.length || typeof window === 'undefined') return;
  const list = listPendingMockReviewsForAdmin();
  saveReviews([...items, ...list]);
}

/** Visible rows for tabs: pending first, then declined (audit), hide approved from main list or show? User said test UI — show pending + optional line for declined. Show only PENDING in list; approved/declined removed from actionable list. */
export function listPendingMockReviewsVisible(): PendingMockReview[] {
  return listPendingMockReviewsForAdmin().filter((r) => r.status === 'PENDING');
}

export function listPendingMockAffiliateVisible(): PendingMockAffiliateItem[] {
  return listPendingMockAffiliateForAdmin().filter((r) => r.status === 'PENDING');
}

/** Declined affiliate rows (for showing rejected reasons under pending items). */
export function listPendingMockAffiliateDeclined(): PendingMockAffiliateItem[] {
  return listPendingMockAffiliateForAdmin().filter((r) => r.status === 'DECLINED');
}
