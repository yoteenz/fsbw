import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminReferrals } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';

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
  const [activeTab, setActiveTab] = usePersistentQueryState<typeof REFERRAL_TABS[number]>({
    queryKey: 'tab',
    storageKey: 'adminReferralsActiveTab',
    defaultValue: 'OVERVIEW',
    allowedValues: REFERRAL_TABS,
  });

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
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>{inviteeCount}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>TOTAL INVITEES</p>
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
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', fontSize: '24px' }}>${totalEarned}</p>
                  <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>TOTAL PAID OUT</p>
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
                <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}>
                  <div
                    className="overflow-y-auto admin-hub-tab-scroll"
                    style={{
                      maxHeight: '380px',
                      paddingTop: '2px',
                      boxSizing: 'border-box',
                    }}
                  >
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
                </div>
              )}
            </div>

            <PageActionsBelowCard adminHub>
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
