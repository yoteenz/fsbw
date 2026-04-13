import { useState, useEffect, useMemo, useCallback, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminReviews } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import { getMockClientsForAyoteenz } from '../clients/page';
import {
  compactRegionCodeForReviewHeader,
  regionParenLabelFromAddressLine,
  usStateAbbrevFromAddressLine,
} from '../../../utils/usAddressStateDisplay';

const REVIEW_TABS = ['OVERVIEW', 'SHOP', 'TOOLS'] as const;
type ReviewTab = (typeof REVIEW_TABS)[number];

const REVIEW_SORT_OPTIONS = ['1 STAR', '2 STAR', '3 STAR', '4 STAR', '5 STAR', 'PHOTOS', 'VIDEOS'] as const;
type ReviewSortOption = (typeof REVIEW_SORT_OPTIONS)[number];

function reviewSortOptionToLabel(opt: ReviewSortOption): string {
  return opt.toUpperCase().replace(/\s+/g, ' ');
}

type ReviewScope = 'shop' | 'tools';

type AdminReviewRow = {
  id: number;
  client: string;
  /** 1–5 for display/sort; invalid values clamped when filtering */
  rating: number;
  product: string;
  review: string;
  date: string;
  status: 'published' | 'pending';
  photos: number;
  videos: number;
  scope: ReviewScope;
  /** Resolved attachment URLs (API jsonb arrays or separate columns). */
  photoUrls?: string[];
  videoUrls?: string[];
  /** From API: `profiles.profile_image` join or optional column on `reviews`. */
  clientProfilePhotoUrl?: string;
  /** Reviewer email when API provides it (profile photo join). */
  clientEmail?: string;
  /** Full region label (e.g. US state full name) — used to derive short code. */
  clientRegionParen?: string;
  /** Short region for header, e.g. TX (optional; else derived from `clientRegionParen`). */
  clientRegionCode?: string;
  /** Review tied to an authenticated purchase of the product (admin display). */
  verifiedPurchase?: boolean;
};

const REVIEW_STAR_PX = Math.round(14 * 0.65 * 10) / 10;
const REVIEW_MEDIA_THUMB_PX = 72;

const DEFAULT_CLIENT_PROFILE_THUMB = '/assets/profile-thumb.png';

function reviewStarCount(r: AdminReviewRow): number {
  const n = Math.round(Number(r.rating));
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, n));
}

function reviewScopeFromUnknown(raw: { scope?: unknown }): ReviewScope {
  const s = String(raw.scope ?? '').toLowerCase();
  return s === 'tools' ? 'tools' : 'shop';
}

const DEFAULT_REVIEWS: AdminReviewRow[] = [
  {
    id: 1,
    client: 'ZARA ADAMS',
    clientEmail: 'mock1@test.com',
    clientRegionParen: 'CALIFORNIA',
    verifiedPurchase: true,
    rating: 5,
    product: 'SOFT WAVE 30"',
    review:
      'Absolutely love this wig! The quality is amazing and it looks so natural. Installation was perfect and the aftercare instructions were very helpful.',
    date: '2/6/2025',
    status: 'published',
    photos: 2,
    videos: 0,
    scope: 'shop',
  },
  {
    id: 2,
    client: 'AMY BROOKS',
    clientEmail: 'mock2@test.com',
    clientRegionParen: 'NEW YORK',
    verifiedPurchase: true,
    rating: 5,
    product: 'NOIR 26"',
    review: 'Best wig experience ever! Professional service and the wig exceeded my expectations. Will definitely be coming back.',
    date: '2/5/2025',
    status: 'published',
    photos: 1,
    videos: 1,
    scope: 'shop',
  },
  {
    id: 3,
    client: 'QUINN CHEN',
    clientEmail: 'mock3@test.com',
    clientRegionParen: 'TEXAS',
    verifiedPurchase: true,
    rating: 4,
    product: 'CURLY 28"',
    review: 'Great quality wig and excellent customer service. The curl pattern is perfect and very natural looking.',
    date: '2/4/2025',
    status: 'published',
    photos: 3,
    videos: 0,
    scope: 'shop',
  },
  {
    id: 4,
    client: 'DIANA FOSTER',
    clientEmail: 'mock4@test.com',
    clientRegionParen: 'ILLINOIS',
    verifiedPurchase: true,
    rating: 5,
    product: 'SLAY STYLING TOOL',
    review: 'Game changer for at-home styling. Heat is even and the cord length is perfect. Worth every penny.',
    date: '2/3/2025',
    status: 'published',
    photos: 1,
    videos: 2,
    scope: 'tools',
  },
  {
    id: 5,
    client: 'ELENA GARCIA',
    clientEmail: 'mock5@test.com',
    clientRegionParen: 'FLORIDA',
    verifiedPurchase: false,
    rating: 4,
    product: 'WIG CARE KIT',
    review: 'Everything I needed in one kit. Instructions were clear and my units look fresher after every wash.',
    date: '2/2/2025',
    status: 'pending',
    photos: 0,
    videos: 0,
    scope: 'tools',
  },
];

function withDefaultReviewMedia(rows: AdminReviewRow[]): AdminReviewRow[] {
  return rows.map((r) => {
    const hasPhotoUrls = (r.photoUrls?.length ?? 0) > 0;
    const hasVideoUrls = (r.videoUrls?.length ?? 0) > 0;
    if (hasPhotoUrls || hasVideoUrls) return r;
    const { photoUrls, videoUrls } = mockReviewMediaPlaceholders(r.id, r.photos, r.videos);
    return { ...r, photoUrls, videoUrls };
  });
}

/** Fill `clientRegionParen` from admin mock client addresses when email matches (founder mock list). */
function enrichReviewsWithMockClientRegion(rows: AdminReviewRow[]): AdminReviewRow[] {
  let mockByEmail: Map<string, { address?: string }> | null = null;
  return rows.map((r) => {
    if ((r.clientRegionParen || '').trim()) return r;
    const em = (r.clientEmail || '').trim().toLowerCase();
    if (!em) return r;
    if (!mockByEmail) {
      mockByEmail = new Map(
        getMockClientsForAyoteenz().map((c: { email?: string; address?: string }) => [
          (c.email || '').trim().toLowerCase(),
          c,
        ])
      );
    }
    const c = mockByEmail.get(em);
    const region = regionParenLabelFromAddressLine(c?.address);
    const abbr = usStateAbbrevFromAddressLine(c?.address);
    const mergedParen = (r.clientRegionParen || '').trim() || region;
    let code = (r.clientRegionCode || '').trim().toUpperCase() || undefined;
    if (abbr) code = abbr;
    else if (!code && mergedParen) code = compactRegionCodeForReviewHeader(mergedParen);
    if (!region && !abbr && !mergedParen) return r;
    return {
      ...r,
      clientRegionParen: mergedParen || r.clientRegionParen,
      clientRegionCode: code ?? r.clientRegionCode,
    };
  });
}

function parseReviewDate(d: string): number {
  const t = Date.parse(d);
  if (!Number.isNaN(t)) return t;
  const m = d.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])).getTime();
  return 0;
}

const NOIR_REVIEW_STAR_FILLED_SRC = '/assets/NOIR/filled-star.png';
/** Outline / empty stars — same asset as Noir marble strip product rows */
const NOIR_REVIEW_STAR_OUTLINE_SRC = '/assets/NOIR/star-symbol.png';

function averageRatingForVisible(rows: AdminReviewRow[]): number {
  const vis = rows.filter((r) => r.status === 'published' || r.status === 'pending');
  if (vis.length === 0) return 0;
  const sum = vis.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  return Math.round((sum / vis.length) * 10) / 10;
}

function starDistribution(rows: AdminReviewRow[]): number[] {
  const counts = [0, 0, 0, 0, 0];
  for (const r of rows) {
    const n = reviewStarCount(r);
    if (n >= 1 && n <= 5) counts[n - 1] += 1;
  }
  return counts;
}

function pct(part: number, whole: number): string {
  if (whole <= 0) return '0';
  return String(Math.round((part / whole) * 100));
}

type ScopeOverviewMetrics = {
  label: string;
  total: number;
  avg: number;
  pending: number;
  published: number;
  withPhotos: number;
  withVideos: number;
  verified: number;
  stars: number[];
};

function buildScopeOverviewMetrics(label: string, rows: AdminReviewRow[]): ScopeOverviewMetrics {
  const total = rows.length;
  const pending = rows.filter((r) => r.status === 'pending').length;
  const published = rows.filter((r) => r.status === 'published').length;
  const withPhotos = rows.filter((r) => r.photos > 0).length;
  const withVideos = rows.filter((r) => r.videos > 0).length;
  const verified = rows.filter((r) => r.verifiedPurchase !== false).length;
  return {
    label,
    total,
    avg: averageRatingForVisible(rows),
    pending,
    published,
    withPhotos,
    withVideos,
    verified,
    stars: starDistribution(rows),
  };
}

function OverviewAnalyticsPanel({
  shop,
  tools,
}: {
  shop: ScopeOverviewMetrics;
  tools: ScopeOverviewMetrics;
}) {
  const cellStyle: CSSProperties = {
    fontFamily: '"Futura PT Book"',
    fontSize: '10px',
    color: '#000',
    textTransform: 'uppercase',
    lineHeight: 1.35,
  };
  const labelGray: CSSProperties = { ...cellStyle, color: '#808080' };
  const sectionTitle: CSSProperties = {
    fontFamily: '"Futura PT Medium"',
    fontSize: '11px',
    color: '#EB1C24',
    margin: '0 0 8px',
    textTransform: 'uppercase',
  };

  const renderScopeBlock = (m: ScopeOverviewMetrics) => (
    <div
      key={m.label}
      className="mb-5 pb-4"
      style={{ borderBottom: '1px solid #e5e7eb' }}
    >
      <p style={sectionTitle}>{m.label}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <div>
          <p style={labelGray}>TOTAL REVIEWS</p>
          <p style={{ ...cellStyle, fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}>{m.total}</p>
        </div>
        <div>
          <p style={labelGray}>AVERAGE RATING</p>
          <p style={{ ...cellStyle, fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}>
            {m.total === 0 ? '—' : m.avg % 1 === 0 ? m.avg : m.avg.toFixed(1)}
          </p>
        </div>
        <div>
          <p style={labelGray}>PUBLISHED</p>
          <p style={cellStyle}>{m.published}</p>
        </div>
        <div>
          <p style={labelGray}>PENDING</p>
          <p style={cellStyle}>{m.pending}</p>
        </div>
        <div>
          <p style={labelGray}>WITH PHOTOS</p>
          <p style={cellStyle}>
            {m.withPhotos} ({pct(m.withPhotos, m.total)}%)
          </p>
        </div>
        <div>
          <p style={labelGray}>WITH VIDEOS</p>
          <p style={cellStyle}>
            {m.withVideos} ({pct(m.withVideos, m.total)}%)
          </p>
        </div>
        <div className="col-span-2">
          <p style={labelGray}>VERIFIED PURCHASE</p>
          <p style={cellStyle}>
            {m.verified} ({pct(m.verified, m.total)}%)
          </p>
        </div>
      </div>
      <p style={{ ...labelGray, marginTop: '10px', marginBottom: '4px' }}>RATING DISTRIBUTION (STARS)</p>
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const c = m.stars[star - 1] ?? 0;
          const w = m.total > 0 ? Math.round((c / m.total) * 100) : 0;
          return (
            <div key={`${m.label}-${star}`} className="flex items-center gap-2">
              <span style={{ ...cellStyle, width: '52px', flexShrink: 0 }}>{star}★</span>
              <div
                className="flex-1 min-w-0"
                style={{ height: '6px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}
              >
                <div style={{ width: `${w}%`, height: '100%', background: '#EB1C24' }} />
              </div>
              <span style={{ ...cellStyle, width: '28px', textAlign: 'right', flexShrink: 0 }}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-0">
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '10px',
          color: '#000',
          margin: '0 0 12px',
          textTransform: 'uppercase',
          lineHeight: 1.4,
        }}
      >
        COMBINED ANALYTICS FOR SHOP (UNITS / PDP) AND TOOLS REVIEWS. USE SHOP / TOOLS TABS TO BROWSE INDIVIDUAL
        REVIEWS.
      </p>
      {renderScopeBlock(shop)}
      {renderScopeBlock(tools)}
    </div>
  );
}

function clientProfilePhotoUrlFromApi(x: Record<string, unknown>): string | undefined {
  const raw = x.clientProfilePhotoUrl ?? x.client_profile_photo_url ?? x.profilePhotoUrl ?? x.profile_photo_url;
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s) return undefined;
  if (s.startsWith('http') || s.startsWith('/') || s.startsWith('data:')) return s;
  return undefined;
}

/** Accept absolute URLs for review attachment previews (admin list). */
function isReviewMediaUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return t.startsWith('http') || t.startsWith('/') || t.startsWith('data:');
}

function urlFromReviewMediaEntry(entry: unknown): string | undefined {
  if (typeof entry === 'string') {
    const t = entry.trim();
    return isReviewMediaUrl(t) ? t : undefined;
  }
  if (entry && typeof entry === 'object') {
    const o = entry as Record<string, unknown>;
    const cand = o.url ?? o.src ?? o.href ?? o.path;
    if (typeof cand === 'string' && isReviewMediaUrl(cand)) return cand.trim();
  }
  return undefined;
}

function stringUrlsFromUnknownArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    const u = urlFromReviewMediaEntry(item);
    if (u) out.push(u);
  }
  return out;
}

function mockReviewMediaPlaceholders(reviewId: number, photoCount: number, videoCount: number): { photoUrls: string[]; videoUrls: string[] } {
  const photoUrls = Array.from({ length: Math.max(0, photoCount) }, (_, i) =>
    `https://picsum.photos/seed/baw-admin-review-${reviewId}-p${i}/200/200`
  );
  const videoUrls = Array.from({ length: Math.max(0, videoCount) }, () =>
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  return { photoUrls, videoUrls };
}

function ReviewClientAvatar({
  review,
  onOpenClientDetails,
}: {
  review: AdminReviewRow;
  onOpenClientDetails: (email: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const custom = (review.clientProfilePhotoUrl || '').trim();
  const primary =
    custom && (custom.startsWith('http') || custom.startsWith('/') || custom.startsWith('data:'))
      ? custom
      : '';
  const src = !imgError && primary ? primary : DEFAULT_CLIENT_PROFILE_THUMB;
  const email = (review.clientEmail || '').trim();
  const interactive = email.length > 0;

  const inner = (
    <div
      className="rounded-full shrink-0 overflow-hidden"
      style={{
        width: '44px',
        height: '44px',
        border: '0.8px solid #000',
      }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={() => {
          if (primary) setImgError(true);
        }}
      />
    </div>
  );

  if (!interactive) return inner;

  return (
    <button
      type="button"
      onClick={() => onOpenClientDetails(email)}
      className="p-0 border-0 bg-transparent cursor-pointer"
      style={{ lineHeight: 0 }}
      aria-label={`Open client details for ${review.client}`}
    >
      {inner}
    </button>
  );
}

function sortReviewsByOption(list: AdminReviewRow[], option: ReviewSortOption): AdminReviewRow[] {
  const starFilter = (n: number) => list.filter((r) => reviewStarCount(r) === n);
  const base =
    option === 'VIDEOS'
      ? list.filter((r) => r.videos > 0)
      : option === 'PHOTOS'
        ? list.filter((r) => r.photos > 0)
        : option === '1 STAR'
          ? starFilter(1)
          : option === '2 STAR'
            ? starFilter(2)
            : option === '3 STAR'
              ? starFilter(3)
              : option === '4 STAR'
                ? starFilter(4)
                : option === '5 STAR'
                  ? starFilter(5)
                  : [...list];
  const out = [...base];
  const byDate = (a: AdminReviewRow, b: AdminReviewRow) => parseReviewDate(b.date) - parseReviewDate(a.date);
  if (option === 'PHOTOS') {
    out.sort((a, b) => (b.photos - a.photos) || byDate(a, b));
  } else if (option === 'VIDEOS') {
    out.sort((a, b) => (b.videos - a.videos) || byDate(a, b));
  } else if (
    option === '1 STAR' ||
    option === '2 STAR' ||
    option === '3 STAR' ||
    option === '4 STAR' ||
    option === '5 STAR'
  ) {
    out.sort(byDate);
  }
  return out;
}

function normalizeApiReview(item: unknown, index: number): AdminReviewRow {
  const x = item as Record<string, unknown>;
  const statusRaw = String(x.status ?? 'published').toLowerCase();
  const status: 'published' | 'pending' = statusRaw === 'pending' ? 'pending' : 'published';
  const photosField = x.photos;
  const photoUrlsFromRow = stringUrlsFromUnknownArray(photosField);
  const photoCount = Array.isArray(photosField)
    ? Math.max(photosField.length, photoUrlsFromRow.length)
    : (Number(photosField) || 0) || photoUrlsFromRow.length;

  const videoUrlsFromRow = stringUrlsFromUnknownArray(x.video_urls ?? x.videoUrls ?? x.videos_urls);
  const videosField = x.videos;
  let videoCount = typeof videosField === 'number' && Number.isFinite(videosField) ? Number(videosField) : 0;
  if (Array.isArray(videosField)) {
    videoCount = Math.max(videosField.length, stringUrlsFromUnknownArray(videosField).length);
  }
  videoCount = Math.max(videoCount, videoUrlsFromRow.length);

  const idNum = typeof x.id === 'number' ? x.id : Number(x.id);
  const stableId = Number.isFinite(idNum) && idNum > 0 ? idNum : index + 1;
  const { photoUrls: mockPhotos, videoUrls: mockVideos } = mockReviewMediaPlaceholders(
    stableId,
    photoCount,
    videoCount
  );
  const photoUrls = photoUrlsFromRow.length > 0 ? photoUrlsFromRow : photoCount > 0 ? mockPhotos.slice(0, photoCount) : [];
  const videoUrls = videoUrlsFromRow.length > 0 ? videoUrlsFromRow : videoCount > 0 ? mockVideos.slice(0, videoCount) : [];

  const regionRaw = x.clientRegionParen ?? x.client_region_paren ?? x.client_state_full ?? x.reviewer_state_full;
  const regionStr = typeof regionRaw === 'string' ? regionRaw.trim().toUpperCase() : '';
  const codeRaw = x.clientRegionCode ?? x.client_region_code ?? x.reviewer_state_abbr;
  const codeStr = typeof codeRaw === 'string' ? codeRaw.trim().toUpperCase() : '';
  const regionCode =
    codeStr ||
    (regionStr ? compactRegionCodeForReviewHeader(regionStr) : undefined);
  const vRaw = x.verifiedPurchase ?? x.verified_purchase ?? x.purchase_verified;
  const verifiedPurchase =
    vRaw === true ||
    vRaw === 1 ||
    String(vRaw).toLowerCase() === 'true' ||
    String(vRaw).toLowerCase() === '1';

  return {
    id: stableId,
    client: String(x.client ?? ''),
    rating: Number(x.rating) || 0,
    clientEmail: String(x.email ?? x.clientEmail ?? '').trim() || undefined,
    clientRegionParen: regionStr || undefined,
    clientRegionCode: regionCode,
    product: String(x.product ?? ''),
    review: String(x.review ?? x.body ?? ''),
    date: String(x.date ?? x.createdAt ?? x.created_at ?? ''),
    status,
    photos: photoCount,
    videos: videoCount,
    photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
    videoUrls: videoUrls.length > 0 ? videoUrls : undefined,
    scope: reviewScopeFromUnknown(x as { scope?: unknown }),
    clientProfilePhotoUrl: clientProfilePhotoUrlFromApi(x),
    verifiedPurchase,
  };
}

export default function AdminReviews() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = usePersistentQueryState<ReviewTab>({
    queryKey: 'tab',
    storageKey: 'adminReviewsActiveTab',
    defaultValue: 'OVERVIEW',
    allowedValues: REVIEW_TABS,
  });
  const [reviews, setReviews] = useState<AdminReviewRow[]>(() =>
    withDefaultReviewMedia(enrichReviewsWithMockClientRegion(DEFAULT_REVIEWS))
  );
  const [reviewSortOption, setReviewSortOption] = useState<ReviewSortOption>('4 STAR');
  const [showReviewSortDropdown, setShowReviewSortDropdown] = useState(false);
  const [expandedReviewMediaIds, setExpandedReviewMediaIds] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminReviews()
        .then((r) => {
          if (r.reviews.length > 0) {
            setReviews(
              withDefaultReviewMedia(
                enrichReviewsWithMockClientRegion(r.reviews.map((item, i) => normalizeApiReview(item, i)))
              )
            );
          }
        })
        .catch(() => {});
    }
  }, []);

  const visible = (r: AdminReviewRow) => r.status === 'published' || r.status === 'pending';
  const shopReviews = reviews.filter((r) => visible(r) && r.scope === 'shop');
  const toolsReviews = reviews.filter((r) => visible(r) && r.scope === 'tools');
  const allVisible = useMemo(() => reviews.filter(visible), [reviews]);

  const summaryAllAvg = useMemo(() => averageRatingForVisible(allVisible), [allVisible]);
  const summaryAllTotal = allVisible.length;
  const summaryShopAvg = useMemo(() => averageRatingForVisible(shopReviews), [shopReviews]);
  const summaryShopTotal = shopReviews.length;
  const summaryToolsAvg = useMemo(() => averageRatingForVisible(toolsReviews), [toolsReviews]);
  const summaryToolsTotal = toolsReviews.length;

  const displayAvg =
    activeTab === 'SHOP' ? summaryShopAvg : activeTab === 'TOOLS' ? summaryToolsAvg : summaryAllAvg;
  const displayTotal =
    activeTab === 'SHOP' ? summaryShopTotal : activeTab === 'TOOLS' ? summaryToolsTotal : summaryAllTotal;
  const totalReviewsLabel =
    activeTab === 'SHOP'
      ? 'SHOP REVIEWS'
      : activeTab === 'TOOLS'
        ? 'TOOL REVIEWS'
        : 'TOTAL (SHOP + TOOLS)';

  const overviewShopMetrics = useMemo(
    () => buildScopeOverviewMetrics('SHOP REVIEWS', shopReviews),
    [shopReviews]
  );
  const overviewToolsMetrics = useMemo(
    () => buildScopeOverviewMetrics('TOOLS REVIEWS', toolsReviews),
    [toolsReviews]
  );

  const shopVisibleSorted = useMemo(
    () => sortReviewsByOption(shopReviews, reviewSortOption),
    [shopReviews, reviewSortOption]
  );
  const toolsVisibleSorted = useMemo(
    () => sortReviewsByOption(toolsReviews, reviewSortOption),
    [toolsReviews, reviewSortOption]
  );

  const openClientDetailsFromReview = useCallback(
    (email: string) => {
      const e = email.trim().toLowerCase();
      if (!e) return;
      navigate(
        `/admin/clients/overview?email=${encodeURIComponent(e)}&returnTo=reviews`
      );
    },
    [navigate]
  );

  const toggleReviewMediaExpanded = useCallback((reviewId: number) => {
    setExpandedReviewMediaIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  }, []);

  const renderSortDropdown = () => (
    <div
      className="grid gap-2 px-5 py-2 font-medium text-black items-center min-w-0"
      style={{
        fontFamily: '"Futura PT Book"',
        fontSize: '11px',
        gridTemplateColumns: '1fr',
        marginTop: '7px',
        marginLeft: '-4px',
        marginBottom: '4px',
      }}
    >
      <div className="relative" style={{ paddingLeft: '10px', marginLeft: '6px' }}>
        <button
          type="button"
          onClick={() => setShowReviewSortDropdown((v) => !v)}
          className="flex items-center gap-1.5 text-black hover:text-gray-800 transition-colors max-w-[120px]"
        >
          <span className="truncate min-w-0" style={{ position: 'relative', left: '-8px' }}>
            {reviewSortOptionToLabel(reviewSortOption)}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="flex-shrink-0"
            style={{
              transform: showReviewSortDropdown ? 'rotate(180deg)' : 'none',
              color: '#EB1C24',
              marginLeft: '-2px',
            }}
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {showReviewSortDropdown && (
          <>
            <div
              className="fixed inset-0 z-30"
              aria-hidden="true"
              onClick={() => setShowReviewSortDropdown(false)}
            />
            <div
              className="absolute py-1 bg-white border border-black shadow-lg z-40 max-h-60 overflow-y-auto overflow-x-hidden"
              style={{
                left: '-2px',
                borderWidth: '1.3px',
                marginTop: '7px',
                width: '120px',
                maxWidth: '120px',
                boxSizing: 'border-box',
              }}
            >
              {REVIEW_SORT_OPTIONS.filter((opt) => opt !== reviewSortOption).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setReviewSortOption(opt);
                    setShowReviewSortDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                  style={{
                    fontFamily: '"Futura PT Book"',
                    color: '#000',
                    fontWeight: 400,
                  }}
                >
                  {reviewSortOptionToLabel(opt)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderReviewCard = (review: AdminReviewRow) => {
    const stars = reviewStarCount(review);
    const regionBit = (review.clientRegionCode || compactRegionCodeForReviewHeader(review.clientRegionParen) || '')
      .trim()
      .toUpperCase();
    const clientHeader =
      `${review.client.trim().toUpperCase()}${regionBit ? ` · ${regionBit}` : ''}`;
    const photoUrls = review.photoUrls ?? [];
    const videoUrls = review.videoUrls ?? [];
    const mediaCount = review.photos + review.videos;
    const hasMediaUrls = photoUrls.length > 0 || videoUrls.length > 0;
    const hasExpandableMedia = mediaCount > 0 && hasMediaUrls;
    const mediaOpen = expandedReviewMediaIds.has(review.id);
    const mediaSummaryParts: string[] = [];
    if (review.photos > 0) {
      mediaSummaryParts.push(`${review.photos} ${review.photos === 1 ? 'PHOTO' : 'PHOTOS'}`);
    }
    if (review.videos > 0) {
      mediaSummaryParts.push(`${review.videos} ${review.videos === 1 ? 'VIDEO' : 'VIDEOS'}`);
    }
    const mediaSummary = mediaSummaryParts.length > 0 ? mediaSummaryParts.join(' · ') : `${review.photos} PHOTOS`;

    return (
      <div key={review.id} className="py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1 flex flex-col">
            <div className="flex flex-col items-start w-full">
              <ReviewClientAvatar review={review} onOpenClientDetails={openClientDetailsFromReview} />
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '11px',
                  color: '#000',
                  margin: '8px 0 0',
                  textAlign: 'left',
                  width: '100%',
                  lineHeight: 1.35,
                }}
              >
                <span>{clientHeader}</span>
                {review.verifiedPurchase !== false ? (
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{' '}(VERIFIED)</span>
                ) : null}
              </p>
            </div>
            <p
              className="mt-1 w-full"
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '11px',
                color: '#808080',
                margin: 0,
                textAlign: 'left',
              }}
            >
              {review.product}
            </p>
            <div className="flex items-center gap-1" style={{ marginTop: 'calc(0.25rem + 2px)' }}>
              {[...Array(5)].map((_, i) => {
                const filled = i < stars;
                return (
                  <img
                    key={i}
                    src={filled ? NOIR_REVIEW_STAR_FILLED_SRC : NOIR_REVIEW_STAR_OUTLINE_SRC}
                    alt=""
                    width={REVIEW_STAR_PX}
                    height={REVIEW_STAR_PX}
                    style={{
                      width: `${REVIEW_STAR_PX}px`,
                      height: `${REVIEW_STAR_PX}px`,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 0 1px black)',
                      stroke: '1px black',
                    }}
                  />
                );
              })}
            </div>
          </div>
          <span
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '11px',
              color: '#000',
              flexShrink: 0,
              textAlign: 'right',
            }}
          >
            {review.date}
          </span>
        </div>
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '11px',
            color: '#000',
            margin: 'calc(0.25rem + 4px) 0 0',
          }}
        >
          {review.review}
        </p>
        <div className="mt-2">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1 pr-2">
              {hasExpandableMedia ? (
                <button
                  type="button"
                  onClick={() => toggleReviewMediaExpanded(review.id)}
                  className="text-left p-0 border-0 bg-transparent cursor-pointer"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '11px',
                    color: '#808080',
                    textTransform: 'uppercase',
                  }}
                >
                  {mediaSummary}
                </button>
              ) : (
                <span
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '11px',
                    color: '#808080',
                    textTransform: 'uppercase',
                  }}
                >
                  {mediaSummary}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '11px',
                color: '#EB1C24',
                flexShrink: 0,
              }}
            >
              {review.status.toUpperCase()}
            </span>
          </div>
          {mediaOpen && hasExpandableMedia ? (
            <div className="mt-2 w-full flex flex-col gap-2">
              {photoUrls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {photoUrls.map((url, idx) => (
                    <a
                      key={`${review.id}-p-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block shrink-0 overflow-hidden"
                      style={{
                        width: `${REVIEW_MEDIA_THUMB_PX}px`,
                        height: `${REVIEW_MEDIA_THUMB_PX}px`,
                        border: '0.8px solid #000',
                      }}
                    >
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </a>
                  ))}
                </div>
              ) : null}
              {videoUrls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {videoUrls.map((url, idx) => (
                    <div
                      key={`${review.id}-v-${idx}`}
                      className="shrink-0 overflow-hidden bg-black"
                      style={{
                        width: `${REVIEW_MEDIA_THUMB_PX}px`,
                        height: `${REVIEW_MEDIA_THUMB_PX}px`,
                        border: '0.8px solid #000',
                      }}
                    >
                      <video
                        src={url}
                        controls
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title="REVIEWS"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {/* Main card */}
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex-shrink-0 px-5 pb-2" style={{ marginTop: '10px' }} />

              {/* Cards above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                <div
                  className="text-center py-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderRadius: '4px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: '10px',
                  }}
                >
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>
                    {displayAvg % 1 === 0 ? displayAvg : displayAvg.toFixed(1)}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    AVERAGE RATING
                  </p>
                </div>
                <div
                  className="text-center py-3"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    borderRadius: '4px',
                    height: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: '10px',
                  }}
                >
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>
                    {displayTotal}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    {totalReviewsLabel}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {REVIEW_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="py-3 px-2 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: activeTab === tab ? '#EB1C24' : '#808080',
                      border: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        borderBottom: activeTab === tab ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort — shop/tools lists only (overview is analytics-only) */}
              {activeTab !== 'OVERVIEW' ? renderSortDropdown() : null}

              {/* Tab content – padding below scroll viewport (above card bottom) */}
              <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                <div
                  className="overflow-y-auto"
                  style={{
                    maxHeight: '380px',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                {activeTab === 'OVERVIEW' ? (
                  <OverviewAnalyticsPanel shop={overviewShopMetrics} tools={overviewToolsMetrics} />
                ) : null}
                {activeTab === 'SHOP' && (
                  shopReviews.length === 0 ? (
                    <div className="py-6 text-center">
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>No shop reviews at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-0">{shopVisibleSorted.map(renderReviewCard)}</div>
                  )
                )}
                {activeTab === 'TOOLS' && (
                  toolsReviews.length === 0 ? (
                    <div className="py-6 text-center">
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>No tools reviews at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-0">{toolsVisibleSorted.map(renderReviewCard)}</div>
                  )
                )}
                </div>
              </div>
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                onClick={() => navigate('/admin/pending?tab=reviews')}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={pageActionButtonStyle}
              >
                VIEW PENDING REVIEWS
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}
