import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminPending } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

const PENDING_TABS = ['OVERVIEW', 'REVIEWS', 'FORMS', 'AFFILIATE'] as const;

export default function AdminPending() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<typeof PENDING_TABS[number]>('OVERVIEW');
  const [pendingReviews, setPendingReviews] = useState(12);
  const [orderForms, setOrderForms] = useState(8);
  const [pendingItems, setPendingItems] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminPending()
        .then((r) => {
          setPendingReviews(r.pendingReviews);
          setOrderForms(r.orderForms);
          setPendingItems(r.pendingItems.length ? r.pendingItems : [
            { label: 'PENDING REVIEWS', value: String(r.pendingReviews) },
            { label: 'ORDER FORMS', value: String(r.orderForms) },
            { label: 'TIER UPGRADES', value: '0' },
            { label: 'AFFILIATE REQUESTS', value: '0' },
            { label: 'REFUND REQUESTS', value: '0' },
            { label: 'SYSTEM ALERTS', value: '0' },
          ]);
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

  const displayItems = pendingItems.length > 0 ? pendingItems : [
    { label: 'PENDING REVIEWS', value: String(pendingReviews) },
    { label: 'ORDER FORMS', value: String(orderForms) },
    { label: 'TIER UPGRADES', value: '23' },
    { label: 'AFFILIATE REQUESTS', value: '47' },
    { label: 'REFUND REQUESTS', value: '3' },
    { label: 'SYSTEM ALERTS', value: '5' },
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
                  PENDING
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                  <path d="M2.25 5.75C2.25 5.35218 2.40804 4.97064 2.68934 4.68934C2.97064 4.40804 3.35218 4.25 3.75 4.25H8.109C8.52585 4.24999 8.93229 4.38022 9.2715 4.6225L11.7285 6.3775C12.0677 6.61978 12.4741 6.75001 12.891 6.75H20.25C20.6478 6.75 21.0294 6.90804 21.3107 7.18934C21.592 7.47064 21.75 7.85218 21.75 8.25V18.25C21.75 18.6478 21.592 19.0294 21.3107 19.3107C21.0294 19.592 20.6478 19.75 20.25 19.75H3.75C3.35218 19.75 2.97064 19.592 2.68934 19.3107C2.40804 19.0294 2.25 18.6478 2.25 18.25V5.75Z" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12.9936L10.835 15.8291L16 10.6641" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Cards above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{pendingReviews}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>PENDING REVIEWS</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{orderForms}</p>
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
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>BY TYPE</h3>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'NEW REVIEWS', value: '8' },
                        { label: 'PHOTO REVIEWS', value: '4' },
                        { label: 'VIDEO REVIEWS', value: '2' },
                        { label: 'RATING REVIEWS', value: '6' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>PRIORITY</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'HIGH', value: '4' },
                        { label: 'MEDIUM', value: '5' },
                        { label: 'LOW', value: '3' },
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

