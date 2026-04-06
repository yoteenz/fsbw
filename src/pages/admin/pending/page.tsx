import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminPending, getAdminReviews } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';

const PENDING_TABS = ['OVERVIEW', 'REVIEWS', 'FORMS', 'AFFILIATE'] as const;

export default function AdminPending() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = usePersistentQueryState<typeof PENDING_TABS[number]>({
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
              ? pending.pendingItems.map((row, i) =>
                  i === 0 ? { ...row, value: String(pendingCount) } : row
                )
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
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>{pendingReviews}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>PENDING REVIEWS</p>
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
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>{orderForms}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>ORDER FORMS</p>
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
                {activeTab === 'OVERVIEW' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>PENDING ITEMS</h3>
                    <div className="space-y-2">
                      {displayItems.map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'REVIEWS' && (
                  <>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: '0 0 8px', lineHeight: 1.35 }}>
                      COUNTS MATCH <span style={{ color: '#000' }}>ADMIN → REVIEWS</span> PENDING ROWS (BY EMAIL IN{' '}
                      <span style={{ color: '#000' }}>CLIENT DETAILS → REVIEWS</span>).
                    </p>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>BY TYPE</h3>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'PENDING (ALL)', value: String(reviewBreakdown.total) },
                        { label: 'WITH PHOTOS', value: String(reviewBreakdown.withPhotos) },
                        { label: 'WITH VIDEOS', value: String(reviewBreakdown.withVideos) },
                        { label: 'TEXT ONLY', value: String(reviewBreakdown.textOnly) },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'FORMS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>ORDER FORMS</h3>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'INCOMPLETE FORMS', value: '5' },
                        { label: 'MISSING INFO', value: '3' },
                        { label: 'PENDING APPROVAL', value: '2' },
                        { label: 'REQUIRES FOLLOW-UP', value: '1' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>TIER UPGRADES</h3>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'STANDARD TO PREMIUM', value: '12' },
                        { label: 'PREMIUM TO VIP', value: '8' },
                        { label: 'VIP TO BLACK TIER', value: '3' },
                        { label: 'PENDING PAYMENT', value: '5' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>AFFILIATE REQUESTS</h3>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'NEW APPLICANTS', value: '23' },
                        { label: 'DOCUMENTATION', value: '15' },
                        { label: 'BACKGROUND CHECK', value: '9' },
                        { label: 'APPROVED PENDING', value: '12' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>REFUND REQUESTS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'PRODUCT ISSUES', value: '2' },
                        { label: 'SERVICE COMPLAINTS', value: '1' },
                        { label: 'PROCESSING TIME', value: '2-3 days' },
                        { label: 'TOTAL AMOUNT', value: '$1,250' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'AFFILIATE' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>AFFILIATE PENDING</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'CONTENT SUBMISSIONS', value: '18' },
                        { label: 'PHOTO REVIEW', value: '11' },
                        { label: 'VIDEO REVIEW', value: '4' },
                        { label: 'SOCIAL TAGS', value: '7' },
                        { label: 'POINTS PAYOUT QUEUE', value: '3' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
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

