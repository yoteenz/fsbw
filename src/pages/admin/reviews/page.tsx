import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminReviews } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';

const REVIEW_TABS = ['ALL', 'SHOP', 'TOOLS'] as const;

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
  /** From API: `profiles.profile_image` join or optional column on `reviews`. */
  clientProfilePhotoUrl?: string;
  /** Reviewer email when API provides it (profile photo join). */
  clientEmail?: string;
};

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
    client: 'SARAH JOHNSON',
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
    client: 'MARIA RODRIGUEZ',
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
    client: 'ASHLEY WILLIAMS',
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
    client: 'JORDAN LEE',
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
    client: 'TAYLOR MARTIN',
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

function clientProfilePhotoUrlFromApi(x: Record<string, unknown>): string | undefined {
  const raw = x.clientProfilePhotoUrl ?? x.client_profile_photo_url ?? x.profilePhotoUrl ?? x.profile_photo_url;
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s) return undefined;
  if (s.startsWith('http') || s.startsWith('/') || s.startsWith('data:')) return s;
  return undefined;
}

function ReviewClientAvatar({ review }: { review: AdminReviewRow }) {
  const [imgError, setImgError] = useState(false);
  const custom = (review.clientProfilePhotoUrl || '').trim();
  const primary =
    custom && (custom.startsWith('http') || custom.startsWith('/') || custom.startsWith('data:'))
      ? custom
      : '';
  const src = !imgError && primary ? primary : DEFAULT_CLIENT_PROFILE_THUMB;

  return (
    <div
      className="rounded-full shrink-0 overflow-hidden"
      style={{
        width: '44px',
        height: '44px',
        border: '0.8px solid #000',
        margin: '0 auto',
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
  const photoCount = Array.isArray(photosField) ? photosField.length : Number(photosField) || 0;
  return {
    id: typeof x.id === 'number' ? x.id : Number(x.id) || index + 1,
    client: String(x.client ?? ''),
    rating: Number(x.rating) || 0,
    clientEmail: String(x.email ?? x.clientEmail ?? '').trim() || undefined,
    product: String(x.product ?? ''),
    review: String(x.review ?? x.body ?? ''),
    date: String(x.date ?? ''),
    status,
    photos: photoCount,
    videos: Number(x.videos) || 0,
    scope: reviewScopeFromUnknown(x as { scope?: unknown }),
    clientProfilePhotoUrl: clientProfilePhotoUrlFromApi(x),
  };
}

export default function AdminReviews() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = usePersistentQueryState<(typeof REVIEW_TABS)[number]>({
    queryKey: 'tab',
    storageKey: 'adminReviewsActiveTab',
    defaultValue: 'ALL',
    allowedValues: REVIEW_TABS,
  });
  const [reviews, setReviews] = useState<AdminReviewRow[]>(DEFAULT_REVIEWS);
  const [reviewSortOption, setReviewSortOption] = useState<ReviewSortOption>('4 STAR');
  const [showReviewSortDropdown, setShowReviewSortDropdown] = useState(false);

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
            setReviews(r.reviews.map((item, i) => normalizeApiReview(item, i)));
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
    activeTab === 'SHOP' ? 'SHOP REVIEWS' : activeTab === 'TOOLS' ? 'TOOL REVIEWS' : 'TOTAL REVIEWS';

  const allVisibleSorted = useMemo(
    () => sortReviewsByOption(allVisible, reviewSortOption),
    [allVisible, reviewSortOption]
  );
  const shopVisibleSorted = useMemo(
    () => sortReviewsByOption(shopReviews, reviewSortOption),
    [shopReviews, reviewSortOption]
  );
  const toolsVisibleSorted = useMemo(
    () => sortReviewsByOption(toolsReviews, reviewSortOption),
    [toolsReviews, reviewSortOption]
  );

  const renderSortDropdown = () => (
    <div
      className="grid gap-2 py-2 font-medium text-black items-center min-w-0"
      style={{
        fontFamily: '"Futura PT Book"',
        fontSize: '11px',
        gridTemplateColumns: '1fr',
        marginTop: '0',
        marginBottom: '4px',
        marginLeft: '-2px',
      }}
    >
      <div className="relative" style={{ paddingLeft: '6px', marginLeft: '0' }}>
        <button
          type="button"
          onClick={() => setShowReviewSortDropdown((v) => !v)}
          className="flex items-center gap-1.5 text-black hover:text-gray-800 transition-colors"
        >
          <span>{reviewSortOptionToLabel(reviewSortOption)}</span>
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
              className="fixed inset-0 z-10"
              aria-hidden="true"
              onClick={() => setShowReviewSortDropdown(false)}
            />
            <div
              className="absolute left-0 py-1 bg-white border border-black shadow-lg z-20 min-w-[120px] max-h-60 overflow-y-auto"
              style={{ borderWidth: '1.3px', marginTop: '7px' }}
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
    return (
    <div key={review.id} className="py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex flex-col items-center w-full">
            <ReviewClientAvatar review={review} />
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '11px',
                color: '#EB1C24',
                margin: '8px 0 0',
                textAlign: 'center',
              }}
            >
              {review.client}
            </p>
          </div>
          <p
            className="mt-1 w-full"
            style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080', margin: 0, textAlign: 'left' }}
          >
            {review.product}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => {
              const filled = i < stars;
              return (
                <img
                  key={i}
                  src={filled ? NOIR_REVIEW_STAR_FILLED_SRC : NOIR_REVIEW_STAR_OUTLINE_SRC}
                  alt=""
                  width={14}
                  height={14}
                  style={{
                    width: '14px',
                    height: '14px',
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
      <p className="mt-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000' }}>
        {review.review}
      </p>
      <div className="flex justify-between items-center mt-2">
        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.photos} photos</span>
        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{review.status.toUpperCase()}</span>
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
                {activeTab === 'ALL' && (
                  <>
                    {renderSortDropdown()}
                    <div className="space-y-0">{allVisibleSorted.map(renderReviewCard)}</div>
                  </>
                )}
                {activeTab === 'SHOP' && (
                  <>
                    {renderSortDropdown()}
                    {shopReviews.length === 0 ? (
                      <div className="py-6 text-center">
                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>No shop reviews at this time.</p>
                      </div>
                    ) : (
                      <div className="space-y-0">{shopVisibleSorted.map(renderReviewCard)}</div>
                    )}
                  </>
                )}
                {activeTab === 'TOOLS' && (
                  <>
                    {renderSortDropdown()}
                    {toolsReviews.length === 0 ? (
                      <div className="py-6 text-center">
                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>No tools reviews at this time.</p>
                      </div>
                    ) : (
                      <div className="space-y-0">{toolsVisibleSorted.map(renderReviewCard)}</div>
                    )}
                  </>
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
