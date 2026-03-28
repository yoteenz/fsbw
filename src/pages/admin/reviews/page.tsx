import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminReviews } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

const REVIEW_TABS = ['ALL', 'SHOP', 'TOOLS'] as const;

const REVIEW_SORT_OPTIONS = ['1 STAR', '2 STAR', '3 STAR', '4 STAR', 'PHOTOS', 'VIDEOS'] as const;
type ReviewSortOption = (typeof REVIEW_SORT_OPTIONS)[number];

function reviewSortOptionToLabel(opt: ReviewSortOption): string {
  return opt.toUpperCase().replace(/\s+/g, ' ');
}

type ReviewScope = 'shop' | 'tools';

type AdminReviewRow = {
  id: number;
  client: string;
  rating: number;
  product: string;
  review: string;
  date: string;
  status: 'published' | 'pending';
  photos: number;
  videos: number;
  scope: ReviewScope;
};

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

function sortReviewsByOption(list: AdminReviewRow[], option: ReviewSortOption): AdminReviewRow[] {
  const out = [...list];
  const byDate = (a: AdminReviewRow, b: AdminReviewRow) => parseReviewDate(b.date) - parseReviewDate(a.date);
  if (option === 'PHOTOS') {
    out.sort((a, b) => (b.photos - a.photos) || byDate(a, b));
  } else if (option === 'VIDEOS') {
    out.sort((a, b) => (b.videos - a.videos) || byDate(a, b));
  } else if (option === '1 STAR') {
    out.sort((a, b) => (a.rating - b.rating) || byDate(a, b));
  } else if (option === '2 STAR') {
    out.sort((a, b) => {
      const pa = a.rating === 2 ? 0 : 1;
      const pb = b.rating === 2 ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return byDate(a, b);
    });
  } else if (option === '3 STAR') {
    out.sort((a, b) => {
      const pa = a.rating === 3 ? 0 : 1;
      const pb = b.rating === 3 ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return byDate(a, b);
    });
  } else {
    /* 4 STAR */
    out.sort((a, b) => {
      const pa = a.rating >= 4 ? 0 : 1;
      const pb = b.rating >= 4 ? 0 : 1;
      if (pa !== pb) return pa - pb;
      if (pa === 0) return (b.rating - a.rating) || byDate(a, b);
      return byDate(a, b);
    });
  }
  return out;
}

function normalizeApiReview(item: unknown, index: number): AdminReviewRow {
  const x = item as Record<string, unknown>;
  const statusRaw = String(x.status ?? 'published').toLowerCase();
  const status: 'published' | 'pending' = statusRaw === 'pending' ? 'pending' : 'published';
  return {
    id: typeof x.id === 'number' ? x.id : Number(x.id) || index + 1,
    client: String(x.client ?? ''),
    rating: Number(x.rating) || 0,
    product: String(x.product ?? ''),
    review: String(x.review ?? x.body ?? ''),
    date: String(x.date ?? ''),
    status,
    photos: Number(x.photos) || 0,
    videos: Number(x.videos) || 0,
    scope: reviewScopeFromUnknown(x as { scope?: unknown }),
  };
}

export default function AdminReviews() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<(typeof REVIEW_TABS)[number]>('ALL');
  const [reviews, setReviews] = useState<AdminReviewRow[]>(DEFAULT_REVIEWS);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(247);
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
            setAverageRating(r.averageRating || 0);
            setTotalReviews(r.totalReviews || 0);
          }
        })
        .catch(() => {});
    }
  }, []);

  const visible = (r: AdminReviewRow) => r.status === 'published' || r.status === 'pending';
  const shopReviews = reviews.filter((r) => visible(r) && r.scope === 'shop');
  const toolsReviews = reviews.filter((r) => visible(r) && r.scope === 'tools');
  const toolsPublishedCount = reviews.filter((r) => r.status === 'published' && r.scope === 'tools').length;

  const allVisibleSorted = useMemo(
    () => sortReviewsByOption(reviews.filter(visible), reviewSortOption),
    [reviews, reviewSortOption]
  );

  const renderReviewCard = (review: AdminReviewRow) => (
    <div key={review.id} className="py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <div className="flex justify-between items-start">
        <div>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24' }}>{review.client}</p>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: i < review.rating ? '#EB1C24' : '#ccc', fontSize: '10px' }}>
                ★
              </span>
            ))}
          </div>
        </div>
        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.date}</span>
      </div>
      <p className="mt-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>
        {review.product}
      </p>
      <p className="mt-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000' }}>
        {review.review}
      </p>
      <div className="flex justify-between items-center mt-2">
        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.photos} photos</span>
        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{review.status.toUpperCase()}</span>
      </div>
    </div>
  );

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
              <div className="flex items-center justify-between -mt-1 pb-1 px-5 pt-4" style={{ marginBottom: 0 }}>
                <h2
                  className="flex-1"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    marginLeft: '6px',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  REVIEWS
                </h2>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}
                >
                  <path
                    d="M9.517 13.673L12 12.167L14.483 13.673L13.823 10.848L16.019 8.964L13.133 8.708L12 6.058L10.867 8.708L7.981 8.964L10.177 10.848L9.517 13.673ZM3 20.077V3H21V17H6.077L3 20.077ZM5.65 16H20V4H4V17.644L5.65 16Z"
                    fill="#EB1C24"
                  />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Cards above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>
                    {averageRating}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    AVERAGE RATING
                  </p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>
                    {totalReviews}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    TOTAL REVIEWS
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
                    <div
                      className="grid gap-2 py-2 font-medium text-black items-center min-w-0"
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        gridTemplateColumns: '1fr',
                        marginTop: '0',
                        marginBottom: '4px',
                        marginLeft: '-4px',
                      }}
                    >
                      <div className="relative" style={{ paddingLeft: '10px', marginLeft: '6px' }}>
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
                    <div className="space-y-0">{allVisibleSorted.map(renderReviewCard)}</div>
                  </>
                )}
                {activeTab === 'SHOP' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>
                      SHOP REVIEWS
                    </h3>
                    {shopReviews.length === 0 ? (
                      <div className="py-6 text-center">
                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>No shop reviews at this time.</p>
                      </div>
                    ) : (
                      <div className="space-y-0">{shopReviews.map(renderReviewCard)}</div>
                    )}
                  </>
                )}
                {activeTab === 'TOOLS' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>
                          {toolsPublishedCount}
                        </p>
                        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                          TOOLS
                        </p>
                      </div>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>
                      TOOLS REVIEWS
                    </h3>
                    {toolsReviews.length === 0 ? (
                      <div className="py-6 text-center">
                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>No tools reviews at this time.</p>
                      </div>
                    ) : (
                      <div className="space-y-0">{toolsReviews.map(renderReviewCard)}</div>
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
