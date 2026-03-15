import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminReferrals } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';

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
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  REFERRALS
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '8px' }}>
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#EB1C24" />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Cards above tabs */}
              <div className="grid grid-cols-2 gap-4 px-5 mb-4">
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{inviteeCount}</p>
                  <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>TOTAL INVITEES</p>
                </div>
                <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                  <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>${totalEarned}</p>
                  <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>TOTAL PAID OUT</p>
                </div>
              </div>

              <div className="flex px-5">
                {REFERRAL_TABS.map((tab) => (
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

            <button
              type="button"
              onClick={() => {}}
              className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
              style={{ ...pageActionButtonStyle, marginTop: '14px' }}
            >
              EXPORT REFERRAL DATA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
