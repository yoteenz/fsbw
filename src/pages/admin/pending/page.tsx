import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminPending } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';

const PENDING_TABS = ['ALL', 'REVIEWS', 'FORMS', 'ALERTS'] as const;

export default function AdminPending() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof PENDING_TABS[number]>('ALL');
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
              <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4" style={{ marginBottom: 0 }}>
                <h2
                  className="flex-1"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  PENDING
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '8px' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#EB1C24" />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Cards above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4">
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{pendingReviews}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>PENDING REVIEWS</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{orderForms}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>ORDER FORMS</p>
                </div>
              </div>

              <div className="flex px-5">
                {PENDING_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-3 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
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

              {/* Tab content */}
              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px' }}>
                {activeTab === 'ALL' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>ALL PENDING ITEMS</h3>
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
                    <div className="text-center py-3 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                      <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>12</p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>PENDING REVIEWS</p>
                    </div>
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
                {activeTab === 'ALERTS' && (
                  <>
                    <div className="text-center py-3 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                      <p className="font-covered-by-your-grace text-2xl" style={{ color: '#EB1C24' }}>5</p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>ACTIVE ALERTS</p>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>SYSTEM ALERTS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'INVENTORY LOW', value: '2 items' },
                        { label: 'PAYMENT FAILED', value: '1 order' },
                        { label: 'SCHEDULE CONFLICT', value: '1 booking' },
                        { label: 'BACKUP OVERDUE', value: '1 system' },
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

            <button
              type="button"
              onClick={() => navigate('/admin/reviews')}
              className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
              style={{ ...pageActionButtonStyle, marginTop: '14px' }}
            >
              REVIEW PENDING ITEMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

