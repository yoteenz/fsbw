import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminReferrals } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

const REFERRAL_TABS = ['OVERVIEW', 'BY REFERRER', 'ACTIVITY'] as const;

type ReferralEntry = {
  referrerEmail: string;
  referredEmail: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  status: string;
  date: string;
};

export default function AdminReferralsPage() {
  useRequireAdminPageAccess();
  const [log, setLog] = useState<ReferralEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof REFERRAL_TABS[number]>('OVERVIEW');

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminReferrals()
        .then((r) => {
          if (r.log.length > 0) {
            setLog(r.log as ReferralEntry[]);
          } else {
            try {
              const raw = localStorage.getItem('referralEarnings');
              const data = raw ? JSON.parse(raw) : [];
              setLog(Array.isArray(data) ? data : []);
            } catch {
              setLog([]);
            }
          }
        })
        .catch(() => {
          try {
            const raw = localStorage.getItem('referralEarnings');
            const data = raw ? JSON.parse(raw) : [];
            setLog(Array.isArray(data) ? data : []);
          } catch {
            setLog([]);
          }
        })
        .finally(() => setLoading(false));
    } else {
      try {
        const raw = localStorage.getItem('referralEarnings');
        const data = raw ? JSON.parse(raw) : [];
        setLog(Array.isArray(data) ? data : []);
      } catch {
        setLog([]);
      }
      setLoading(false);
    }
  }, []);

  const confirmed = log.filter(e => e.status === 'confirmed');
  const totalEarned = confirmed.reduce((sum, e) => sum + (e.amount || 0), 0);
  const inviteeCount = confirmed.length;
  const byReferrer = confirmed.reduce((acc, e) => {
    const email = (e.referrerEmail || '').trim().toLowerCase();
    if (!acc[email]) acc[email] = { count: 0, earned: 0 };
    acc[email].count += 1;
    acc[email].earned += e.amount || 0;
    return acc;
  }, {} as Record<string, { count: number; earned: number }>);

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
          title="REFERRALS"
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
                    marginLeft: '6px',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  REFERRALS
                </h2>
                <svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                  <path d="M8.13293 1.97719C10.4189 1.086 12.9425 1.01166 15.277 1.76676C17.6114 2.52186 19.6134 4.06006 20.9444 6.12119C22.2754 8.18224 22.8536 10.6398 22.5812 13.0781C22.3088 15.5164 21.2025 17.7857 19.4494 19.5022M13.9769 22.3572C11.8971 22.7499 9.74741 22.5138 7.80239 21.679C5.85738 20.8443 4.2053 19.4487 3.05714 17.6706C1.90898 15.8925 1.31684 13.8126 1.35635 11.6963C1.39585 9.58012 2.06521 7.52371 3.27893 5.78969" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.47162 4.73231C6.20672 4.73231 6.80262 4.1364 6.80262 3.40131C6.80262 2.66622 6.20672 2.07031 5.47162 2.07031C4.73653 2.07031 4.14062 2.66622 4.14062 3.40131C4.14062 4.1364 4.73653 4.73231 5.47162 4.73231Z" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.3086 21.4231C18.3097 20.688 17.7147 20.0912 16.9796 20.09C16.2445 20.0889 15.6477 20.6839 15.6466 21.419C15.6454 22.1541 16.2404 22.7509 16.9755 22.752C17.7106 22.7532 18.3074 22.1582 18.3086 21.4231Z" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.1943 9.44325C18.9294 9.44325 19.5253 8.84734 19.5253 8.11225C19.5253 7.37716 18.9294 6.78125 18.1943 6.78125C17.4592 6.78125 16.8633 7.37716 16.8633 8.11225C16.8633 8.84734 17.4592 9.44325 18.1943 9.44325Z" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19.46 10.7152C19.7372 12.4474 19.4071 14.2221 18.5256 15.7388C17.6441 17.2555 16.2653 18.4207 14.623 19.0372C13.3964 19.4977 12.0717 19.6336 10.7772 19.4316C9.48272 19.2296 8.26237 18.6966 7.23444 17.8843C6.20652 17.0719 5.40588 16.0078 4.91015 14.7951C4.41442 13.5823 4.2404 12.2621 4.40496 10.9623C4.56952 9.66251 5.06708 8.42729 5.8494 7.37635C6.63173 6.32541 7.6723 5.49441 8.87024 4.96389C10.0682 4.43337 11.3829 4.22132 12.6868 4.34831C13.9908 4.47529 15.2399 4.937 16.313 5.68868" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.0441 11.6428C12.7372 11.6428 13.2991 11.0809 13.2991 10.3878C13.2991 9.6947 12.7372 9.13281 12.0441 9.13281C11.3509 9.13281 10.7891 9.6947 10.7891 10.3878C10.7891 11.0809 11.3509 11.6428 12.0441 11.6428Z" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.20529 15.191C8.70429 15.2145 8.65029 14.9945 8.63379 14.754V13.7625C10.0358 12.118 14.1648 12.3255 15.2668 13.796V14.6195C15.2218 14.811 15.2413 15.0415 14.9858 15.107L9.20529 15.191Z" stroke="#EB1C24" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Cards above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4" style={{ marginTop: '12px' }}>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{inviteeCount}</p>
                  <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>TOTAL INVITEES</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>${totalEarned}</p>
                  <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>TOTAL PAID OUT</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {REFERRAL_TABS.map((tab) => (
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

              {loading ? (
                <div className="px-5 py-8 text-center">
                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>LOADING REFERRAL DATA...</p>
                </div>
              ) : (
                <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px' }}>
                  {activeTab === 'OVERVIEW' && (
                    <>
                    </>
                  )}
                  {activeTab === 'BY REFERRER' && (
                    <>
                      <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '12px' }}>EARNINGS BY REFERRER</h3>
                      {Object.entries(byReferrer).length === 0 ? (
                        <p className="py-6" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>NO REFERRAL EARNINGS YET.</p>
                      ) : (
                        <div className="space-y-2">
                          {Object.entries(byReferrer).map(([email, { count, earned }]) => (
                            <div key={email} className="py-3 flex justify-between items-center" style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <span className="text-xs font-futura truncate flex-1 mr-2" style={{ color: '#000' }}>{email}</span>
                              <span className="text-xs font-futura shrink-0 mr-2" style={{ color: '#808080' }}>Invitees: {count}</span>
                              <span className="text-xs font-futura shrink-0" style={{ color: '#EB1C24' }}>${earned}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'ACTIVITY' && (
                    <>
                      <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '12px' }}>RECENT REFERRAL ACTIVITY</h3>
                      {confirmed.length === 0 ? (
                        <p className="py-6" style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase' }}>NO CONFIRMED REFERRALS YET.</p>
                      ) : (
                        <div className="space-y-2">
                          {[...confirmed]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 20)
                            .map((e, i) => (
                              <div key={i} className="py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <div className="flex justify-between items-start gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-futura truncate" style={{ color: '#EB1C24' }}>Referrer: {e.referrerEmail}</p>
                                    <p className="text-xs font-futura truncate mt-0.5" style={{ color: '#808080' }}>Referred: {e.referredEmail || '—'}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-futura" style={{ color: '#EB1C24' }}>${e.amount}</p>
                                    <p className="text-xs font-futura" style={{ color: '#808080' }}>{e.date ? new Date(e.date).toLocaleDateString() : '—'}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                onClick={() => {}}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={pageActionButtonStyle}
              >
                EXPORT REFERRAL DATA
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}
