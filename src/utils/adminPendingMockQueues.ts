/**
 * Admin → Pending: mock queues for REVIEWS and AFFILIATE tabs (localStorage + approve/decline).
 */

export const PENDING_MOCK_REVIEWS_UPDATED_EVENT = 'adminPendingMockReviewsUpdated';
export const PENDING_MOCK_AFFILIATE_UPDATED_EVENT = 'adminPendingMockAffiliateUpdated';

const REVIEWS_KEY = 'adminPendingMockReviews_v1';
const AFFILIATE_KEY = 'adminPendingMockAffiliate_v1';

export type PendingMockReview = {
  id: string;
  client: string;
  email: string;
  product: string;
  rating: number;
  excerpt: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  adminDeclineReason?: string;
};

export type PendingMockAffiliateKind = 'photo' | 'video' | 'social';

export type PendingMockAffiliateItem = {
  id: string;
  kind: PendingMockAffiliateKind;
  /** Thumbnail for photo/video */
  imageSrc?: string;
  platform?: string;
  handle?: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  adminDeclineReason?: string;
};

const DEFAULT_REVIEWS: PendingMockReview[] = [
  {
    id: 'mock-rev-1',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    product: 'NOIR 24" RAW RUSSIAN',
    rating: 5,
    excerpt: 'ABSOLUTELY IN LOVE WITH THE QUALITY AND THE INSTALL TEAM WAS SO PROFESSIONAL.',
    date: '3/28/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-rev-2',
    client: 'MARIA RODRIGUEZ',
    email: 'maria.r@email.com',
    product: 'SOFT WAVE 26"',
    rating: 4,
    excerpt: 'GREAT TEXTURE, SHIPPING WAS FAST. WOULD LOVE SLIGHTLY MORE DENSITY NEXT TIME.',
    date: '3/26/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-rev-3',
    client: 'JORDAN LEE',
    email: 'jordan.lee@email.com',
    product: 'SLAY STYLING TOOL',
    rating: 5,
    excerpt: 'GAME CHANGER FOR MY MORNING ROUTINE. FIVE STARS.',
    date: '3/22/2026',
    status: 'PENDING',
  },
];

const DEFAULT_AFFILIATE: PendingMockAffiliateItem[] = [
  { id: 'mock-aff-ph-0', kind: 'photo', imageSrc: '/assets/gallery-mock.png', date: '3/27/2026', status: 'PENDING' },
  { id: 'mock-aff-ph-1', kind: 'photo', imageSrc: '/assets/gallery-mock.png', date: '3/27/2026', status: 'PENDING' },
  { id: 'mock-aff-ph-2', kind: 'photo', imageSrc: '/assets/gallery-mock.png', date: '3/26/2026', status: 'PENDING' },
  { id: 'mock-aff-vd-0', kind: 'video', imageSrc: '/assets/gallery-mock.png', date: '3/25/2026', status: 'PENDING' },
  { id: 'mock-aff-vd-1', kind: 'video', imageSrc: '/assets/gallery-mock.png', date: '3/24/2026', status: 'PENDING' },
  {
    id: 'mock-aff-soc-0',
    kind: 'social',
    platform: 'INSTAGRAM',
    handle: '@CLIENTSTYLE · REEL SUBMITTED',
    date: '3/27/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-soc-1',
    kind: 'social',
    platform: 'TIKTOK',
    handle: '@WIGGLOW · TAGGED @FRONTALSLAYER',
    date: '3/24/2026',
    status: 'PENDING',
  },
  {
    id: 'mock-aff-soc-2',
    kind: 'social',
    platform: 'YOUTUBE',
    handle: 'SHORTS · INSTALL ROUTINE',
    date: '3/20/2026',
    status: 'PENDING',
  },
];

function parseReviews(raw: string | null): PendingMockReview[] {
  if (!raw) return [];
  try {
    const a = JSON.parse(raw) as unknown;
    return Array.isArray(a) ? (a as PendingMockReview[]) : [];
  } catch {
    return [];
  }
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
  return existing;
}

export function listPendingMockAffiliateForAdmin(): PendingMockAffiliateItem[] {
  if (typeof window === 'undefined') return [];
  const existing = parseAffiliate(localStorage.getItem(AFFILIATE_KEY));
  if (existing.length === 0) {
    saveAffiliate(DEFAULT_AFFILIATE);
    return [...DEFAULT_AFFILIATE];
  }
  return existing;
}

export function countPendingMockReviews(): number {
  return listPendingMockReviewsForAdmin().filter((r) => r.status === 'PENDING').length;
}

export function countPendingMockAffiliate(): number {
  return listPendingMockAffiliateForAdmin().filter((r) => r.status === 'PENDING').length;
}

export function approvePendingMockReview(id: string): void {
  const list = listPendingMockReviewsForAdmin();
  const next = list.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const, adminDeclineReason: undefined } : r));
  saveReviews(next);
}

export function declinePendingMockReview(id: string, reason: string): void {
  const r = (reason || '').trim();
  const list = listPendingMockReviewsForAdmin();
  const next = list.map((row) =>
    row.id === id ? { ...row, status: 'DECLINED' as const, adminDeclineReason: r || undefined } : row
  );
  saveReviews(next);
}

export function approvePendingMockAffiliate(id: string): void {
  const list = listPendingMockAffiliateForAdmin();
  const next = list.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const, adminDeclineReason: undefined } : r));
  saveAffiliate(next);
}

export function declinePendingMockAffiliate(id: string, reason: string): void {
  const r = (reason || '').trim();
  const list = listPendingMockAffiliateForAdmin();
  const next = list.map((row) =>
    row.id === id ? { ...row, status: 'DECLINED' as const, adminDeclineReason: r || undefined } : row
  );
  saveAffiliate(next);
}

/** Visible rows for tabs: pending first, then declined (audit), hide approved from main list or show? User said test UI — show pending + optional line for declined. Show only PENDING in list; approved/declined removed from actionable list. */
export function listPendingMockReviewsVisible(): PendingMockReview[] {
  return listPendingMockReviewsForAdmin().filter((r) => r.status === 'PENDING');
}

export function listPendingMockAffiliateVisible(): PendingMockAffiliateItem[] {
  return listPendingMockAffiliateForAdmin().filter((r) => r.status === 'PENDING');
}
