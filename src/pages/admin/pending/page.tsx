import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminPending, getAdminReviews } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';

const PENDING_TABS = ['OVERVIEW', 'REVIEWS', 'FORMS', 'AFFILIATE'] as const;

const rowStyle = {
  borderBottom: '1px solid #e5e7eb' as const,
};

/** Mock: client reviews as submitted on Account → Reviews (pending admin). */
const MOCK_PENDING_CLIENT_REVIEWS = [
  {
    id: '1',
    client: 'SARAH JOHNSON',
    email: 'sarah.j@email.com',
    product: 'NOIR 24" RAW RUSSIAN',
    rating: 5,
    excerpt: 'ABSOLUTELY IN LOVE WITH THE QUALITY AND THE INSTALL TEAM WAS SO PROFESSIONAL.',
    date: '3/28/2026',
    status: 'PENDING' as const,
  },
  {
    id: '2',
    client: 'MARIA RODRIGUEZ',
    email: 'maria.r@email.com',
    product: 'SOFT WAVE 26"',
    rating: 4,
    excerpt: 'GREAT TEXTURE, SHIPPING WAS FAST. WOULD LOVE SLIGHTLY MORE DENSITY NEXT TIME.',
    date: '3/26/2026',
    status: 'PENDING' as const,
  },
  {
    id: '3',
    client: 'JORDAN LEE',
    email: 'jordan.lee@email.com',
    product: 'SLAY STYLING TOOL',
    rating: 5,
    excerpt: 'GAME CHANGER FOR MY MORNING ROUTINE. FIVE STARS.',
    date: '3/22/2026',
    status: 'PENDING' as const,
  },
] as const;

/** Mock: signed / awaiting order authorization forms. */
const MOCK_ORDER_AUTH_FORMS = [
  { id: '1', order: 'ORDER #2847', client: 'ASHLEY WILLIAMS', date: '3/29/2026', status: 'AWAITING SIGNATURE' },
  { id: '2', order: 'ORDER #2842', client: 'TAYLOR MARTIN', date: '3/28/2026', status: 'SIGNED · PENDING VERIFY' },
  { id: '3', order: 'ORDER #2839', client: 'KEIRA MARTINEZ', date: '3/27/2026', status: 'INCOMPLETE' },
  { id: '4', order: 'ORDER #2831', client: 'NINA PATEL', date: '3/25/2026', status: 'AWAITING SIGNATURE' },
] as const;

/** Mock: affiliate submissions (Account → Affiliate). */
const MOCK_AFFILIATE_PHOTOS = ['/assets/gallery-mock.png', '/assets/gallery-mock.png', '/assets/gallery-mock.png'] as const;
const MOCK_AFFILIATE_VIDEOS = ['/assets/gallery-mock.png', '/assets/gallery-mock.png'] as const;
const MOCK_AFFILIATE_SOCIALS = [
  { platform: 'INSTAGRAM', handle: '@CLIENTSTYLE · REEL SUBMITTED', date: '3/27/2026' },
  { platform: 'TIKTOK', handle: '@WIGGLOW · TAGGED @FRONTALSLAYER', date: '3/24/2026' },
  { platform: 'YOUTUBE', handle: 'SHORTS · INSTALL ROUTINE', date: '3/20/2026' },
] as const;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', margin: '16px 0 8px' }}>{children}</h3>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2" style={rowStyle}>
      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{label}</span>
      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{value}</span>
    </div>
  );
}

export default function AdminPending() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = usePersistentQueryState<(typeof PENDING_TABS)[number]>({
    queryKey: 'tab',
    storageKey: 'adminPendingActiveTab',
    defaultValue: 'OVERVIEW',
    allowedValues: PENDING_TABS,
  });
  const [pendingReviews, setPendingReviews] = useState(0);
  const [orderForms, setOrderForms] = useState(0);
  const [pendingItems, setPendingItems] = useState<{ label: string; value: string }[]>([]);
  const [reviewBreakdown, setReviewBreakdown] = useState<{
    total: number;
    withPhotos: number;
    withVideos: number;
    textOnly: number;
  }>({ total: 0, withPhotos: 0, withVideos: 0, textOnly: 0 });

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      Promise.all([getAdminPending(), getAdminReviews()])
        .then(([pending, reviewsRes]) => {
          const apiPending = pending.pendingReviews;
          const fromList = (reviewsRes.reviews as Array<Record<string, unknown>>).filter(
            (r) => String(r.status || '').toLowerCase() === 'pending'
          ).length;
          const pendingCount = fromList > 0 ? fromList : apiPending;

          setPendingReviews(pendingCount);
          setOrderForms(pending.orderForms);
          setReviewBreakdown(
            fromList > 0
              ? (() => {
                  const pendingRows = (reviewsRes.reviews as Array<Record<string, unknown>>).filter(
                    (r) => String(r.status || '').toLowerCase() === 'pending'
                  );
                  let withPhotos = 0;
                  let withVideos = 0;
                  let textOnly = 0;
                  for (const r of pendingRows) {
                    const p = r.photos;
                    const photoN = Array.isArray(p) ? p.length : Number(p) || 0;
                    const vidN = Number(r.videos) || 0;
                    if (photoN > 0) withPhotos += 1;
                    if (vidN > 0) withVideos += 1;
                    if (photoN === 0 && vidN === 0) textOnly += 1;
                  }
                  return {
                    total: pendingRows.length,
                    withPhotos,
                    withVideos,
                    textOnly,
                  };
                })()
              : pending.pendingReviewBreakdown
          );
          setPendingItems(
            pending.pendingItems.length
              ? pending.pendingItems.map((row, i) => (i === 0 ? { ...row, value: String(pendingCount) } : row))
              : [
                  { label: 'PENDING REVIEWS', value: String(pendingCount) },
                  { label: 'ORDER FORMS', value: String(pending.orderForms) },
                  { label: 'TIER UPGRADES', value: '0' },
                  { label: 'AFFILIATE REQUESTS', value: '0' },
                  { label: 'REFUND REQUESTS', value: '0' },
                  { label: 'SYSTEM ALERTS', value: '0' },
                ]
          );
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const t = (searchParams.get('tab') || '').toLowerCase();
    if (t === 'reviews') {
      setActiveTab('REVIEWS');
    }
  }, [searchParams]);

  const displayItems =
    pendingItems.length > 0
      ? pendingItems
      : [
          { label: 'PENDING REVIEWS', value: String(pendingReviews) },
          { label: 'ORDER FORMS', value: String(orderForms) },
          { label: 'TIER UPGRADES', value: '0' },
          { label: 'AFFILIATE REQUESTS', value: '0' },
          { label: 'REFUND REQUESTS', value: '0' },
          { label: 'SYSTEM ALERTS', value: '0' },
        ];

  const formsRows = [
    { label: 'INCOMPLETE FORMS', value: '5' },
    { label: 'MISSING INFO', value: '3' },
    { label: 'PENDING APPROVAL', value: '2' },
    { label: 'REQUIRES FOLLOW-UP', value: '1' },
  ];
  const tierRows = [
    { label: 'STANDARD TO PREMIUM', value: '12' },
    { label: 'PREMIUM TO VIP', value: '8' },
    { label: 'VIP TO BLACK TIER', value: '3' },
    { label: 'PENDING PAYMENT', value: '5' },
  ];
  const affiliateReqRows = [
    { label: 'NEW APPLICANTS', value: '23' },
    { label: 'DOCUMENTATION', value: '15' },
    { label: 'BACKGROUND CHECK', value: '9' },
    { label: 'APPROVED PENDING', value: '12' },
  ];
  const refundRows = [
    { label: 'PRODUCT ISSUES', value: '2' },
    { label: 'SERVICE COMPLAINTS', value: '1' },
    { label: 'PROCESSING TIME', value: '2-3 days' },
    { label: 'TOTAL AMOUNT', value: '$1,250' },
  ];
  const affiliateQueueRows = [
    { label: 'CONTENT SUBMISSIONS', value: '18' },
    { label: 'PHOTO REVIEW', value: '11' },
    { label: 'VIDEO REVIEW', value: '4' },
    { label: 'SOCIAL TAGS', value: '7' },
    { label: 'POINTS PAYOUT QUEUE', value: '3' },
  ];

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
          title="PENDING"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex-shrink-0 px-5 pb-2" style={{ marginTop: '10px' }} />

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
                    {pendingReviews}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    PENDING REVIEWS
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
                    {orderForms}
                  </p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                    ORDER FORMS
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {PENDING_TABS.map((tab) => (
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

              <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                <div
                  className="overflow-y-auto"
                  style={{
                    maxHeight: '380px',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                  {activeTab === 'OVERVIEW' && (
                    <>
                      <SectionTitle>PENDING ITEMS</SectionTitle>
                      <div className="space-y-0">
                        {displayItems.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>REVIEWS · PENDING BY TYPE</SectionTitle>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px', lineHeight: 1.35 }}>
                        ALIGNS WITH <span style={{ color: '#000' }}>ADMIN → REVIEWS</span> &amp; <span style={{ color: '#000' }}>CLIENT → REVIEWS</span> WHEN API DATA LOADS.
                      </p>
                      <div className="space-y-0">
                        <DataRow label="PENDING (ALL)" value={String(reviewBreakdown.total)} />
                        <DataRow label="WITH PHOTOS" value={String(reviewBreakdown.withPhotos)} />
                        <DataRow label="WITH VIDEOS" value={String(reviewBreakdown.withVideos)} />
                        <DataRow label="TEXT ONLY" value={String(reviewBreakdown.textOnly)} />
                      </div>

                      <SectionTitle>ORDER FORMS</SectionTitle>
                      <div className="space-y-0">
                        {formsRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>TIER UPGRADES</SectionTitle>
                      <div className="space-y-0">
                        {tierRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>AFFILIATE REQUESTS</SectionTitle>
                      <div className="space-y-0">
                        {affiliateReqRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>REFUND REQUESTS</SectionTitle>
                      <div className="space-y-0">
                        {refundRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <SectionTitle>AFFILIATE QUEUE</SectionTitle>
                      <div className="space-y-0">
                        {affiliateQueueRows.map((row) => (
                          <DataRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'REVIEWS' && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 10px', lineHeight: 1.35 }}>
                        MOCK: SUBMITTED CLIENT REVIEWS (ACCOUNT → REVIEWS). DESIGN PREVIEW ONLY.
                      </p>
                      {MOCK_PENDING_CLIENT_REVIEWS.map((r) => (
                        <div key={r.id} className="py-3" style={rowStyle}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', margin: 0 }}>{r.client}</p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '4px 0 0' }}>{r.email}</p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '6px 0 0' }}>{r.product}</p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '6px 0 0', lineHeight: 1.35 }}>
                                {r.excerpt}
                              </p>
                              <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', color: '#808080', margin: '6px 0 0' }}>
                                {r.rating} STARS · {r.status}
                              </p>
                            </div>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', flexShrink: 0 }}>{r.date}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'FORMS' && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 10px', lineHeight: 1.35 }}>
                        MOCK: ORDER AUTHORIZATION FORMS FROM CLIENTS. DESIGN PREVIEW ONLY.
                      </p>
                      {MOCK_ORDER_AUTH_FORMS.map((f) => (
                        <div key={f.id} className="py-3" style={rowStyle}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', margin: 0 }}>{f.order}</p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '6px 0 0' }}>{f.client}</p>
                              <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', color: '#808080', margin: '6px 0 0' }}>{f.status}</p>
                            </div>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', flexShrink: 0 }}>{f.date}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {activeTab === 'AFFILIATE' && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 10px', lineHeight: 1.35 }}>
                        MOCK: ACCOUNT → AFFILIATE SUBMISSIONS (PHOTOS, VIDEOS, SOCIALS). DESIGN PREVIEW ONLY.
                      </p>

                      <SectionTitle>PHOTOS</SectionTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {MOCK_AFFILIATE_PHOTOS.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              width: '72px',
                              height: '72px',
                              border: '3px solid #fff',
                              boxShadow: '0 0 0 1.1px #000',
                              overflow: 'hidden',
                              background: '#f3f4f6',
                            }}
                          >
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>

                      <SectionTitle>VIDEOS</SectionTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {MOCK_AFFILIATE_VIDEOS.map((src, i) => (
                          <div
                            key={i}
                            style={{
                              width: '72px',
                              height: '72px',
                              border: '3px solid #fff',
                              boxShadow: '0 0 0 1.1px #000',
                              overflow: 'hidden',
                              background: '#f3f4f6',
                              position: 'relative',
                            }}
                          >
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                            <span
                              style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '8px',
                                color: '#EB1C24',
                              }}
                            >
                              ▶
                            </span>
                          </div>
                        ))}
                      </div>

                      <SectionTitle>SOCIAL LINKS</SectionTitle>
                      <div className="space-y-0">
                        {MOCK_AFFILIATE_SOCIALS.map((s, i) => (
                          <div key={i} className="py-2" style={rowStyle}>
                            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', margin: 0 }}>{s.platform}</p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#000', margin: '4px 0 0' }}>{s.handle}</p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '4px 0 0' }}>{s.date}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                onClick={() => navigate('/admin/reviews')}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={pageActionButtonStyle}
              >
                REVIEW PENDING ITEMS
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}
