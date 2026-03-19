import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getAdminBrand, getAdminAnalytics } from '../../../utils/api';
import { getSocialAnalyticsSummary } from '../../../utils/socialAnalytics';
import type { SocialPlatform, SocialSource } from '../../../utils/socialAnalytics';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

const BRAND_TABS = ['OVERVIEW', 'METRICS', 'ACHIEVEMENTS', 'ANALYTICS'] as const;
const ANALYTICS_SUB_TABS = ['SUMMARY', 'BY PLATFORM', 'BY SOURCE'] as const;

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

const SOURCE_LABEL: Record<SocialSource, string> = {
  menu: 'Menu toggle',
  more_ways_to_earn: 'More ways to earn',
};

const defaultBrandMetrics = {
  retention: '94%',
  referralRate: '23%',
  repeatBookings: '78%',
  growthRate: '+15%',
  brandScore: 94,
  marketPenetration: '15%',
};

export default function AdminBrand() {
  useRequireAdminPageAccess();
  const [activeTab, setActiveTab] = useState<typeof BRAND_TABS[number]>('OVERVIEW');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<typeof ANALYTICS_SUB_TABS[number]>('SUMMARY');
  const [brandMetrics, setBrandMetrics] = useState(defaultBrandMetrics);
  const localSummary = getSocialAnalyticsSummary();
  const [analyticsSummary, setAnalyticsSummary] = useState(localSummary);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminBrand()
        .then((r) => {
          setBrandMetrics({
            retention: String(r.retention ?? defaultBrandMetrics.retention),
            referralRate: String(r.referralRate ?? defaultBrandMetrics.referralRate),
            repeatBookings: String(r.repeatBookings ?? defaultBrandMetrics.repeatBookings),
            growthRate: String(r.growthRate ?? defaultBrandMetrics.growthRate),
            brandScore: Number(r.brandScore) ?? defaultBrandMetrics.brandScore,
            marketPenetration: String(r.marketPenetration ?? defaultBrandMetrics.marketPenetration),
          });
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminAnalytics()
        .then((r) => {
          if (r && Number(r.total) > 0) {
            setAnalyticsSummary((prev) => ({
              total: r.total,
              bySource: r.bySource as Record<SocialSource, number>,
              byPlatform: r.byPlatform as Record<SocialPlatform, number>,
              byPlatformAndSource: r.byPlatformAndSource as Record<SocialPlatform, Record<SocialSource, number>>,
              recentEvents: prev.recentEvents,
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

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
          title="BRAND"
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
                  BRAND
                </h2>
                <svg width="15.5" height="15.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '-5px', transform: 'translateX(-6px)' }}>
                  <path d="M3 4H4V18L9.58 8.33L15.59 11.8L19.21 5.54L20.07 6.04L15.96 13.17L9.95 9.7L4 20H20V21H3V4Z" fill="#EB1C24"/>
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              {/* Brand score / Analytics total above tabs - show analytics total when on ANALYTICS tab */}
              {activeTab === 'ANALYTICS' ? (
                <div className="text-center py-4 px-5">
                  <p className="font-covered-by-your-grace text-4xl" style={{ color: '#EB1C24' }}>{analyticsSummary.total}</p>
                  <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>TOTAL CLICKS</p>
                </div>
              ) : (
                <div className="text-center py-4 px-5">
                  <p className="font-covered-by-your-grace text-4xl" style={{ color: '#EB1C24' }}>{brandMetrics.brandScore}%</p>
                  <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>OVERALL BRAND SCORE</p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {BRAND_TABS.map((tab) => (
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

              {/* Tab content */}
              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px', padding: '8px', paddingTop: '2px', boxSizing: 'border-box' }}>
                {activeTab === 'OVERVIEW' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.retention}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>CLIENT RETENTION</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.referralRate}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>REFERRAL RATE</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.repeatBookings}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>REPEAT BOOKINGS</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{brandMetrics.growthRate}</p>
                        <p className="text-xs font-futura mt-1" style={{ color: '#808080' }}>GROWTH RATE</p>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'METRICS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>KEY METRICS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'CLIENT RETENTION', value: brandMetrics.retention },
                        { label: 'REFERRAL RATE', value: brandMetrics.referralRate },
                        { label: 'REPEAT BOOKINGS', value: brandMetrics.repeatBookings },
                        { label: 'GROWTH RATE', value: brandMetrics.growthRate },
                        { label: 'MARKET PENETRATION', value: brandMetrics.marketPenetration },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'ACHIEVEMENTS' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '12px' }}>RECENT ACHIEVEMENTS</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'REVENUE TARGET EXCEEDED', value: '✓ ACHIEVED' },
                        { label: '94% RETENTION MILESTONE', value: '✓ ACHIEVED' },
                        { label: '15% QUARTERLY GROWTH', value: '✓ ACHIEVED' },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{row.label}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'ANALYTICS' && (
                  <>
                    <div className="flex gap-2 mt-2 mb-3">
                      {ANALYTICS_SUB_TABS.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setAnalyticsSubTab(sub)}
                          className="flex-1 py-2 text-xs font-medium"
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            color: analyticsSubTab === sub ? '#EB1C24' : '#808080',
                            border: 'none',
                            borderBottom: analyticsSubTab === sub ? '1px solid #EB1C24' : '1px solid transparent',
                            background: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                    {analyticsSubTab === 'SUMMARY' && (
                      <>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>BY SOURCE</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>MENU TOGGLE</span>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.bySource.menu}</span>
                          </div>
                          <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>MORE WAYS TO EARN</span>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.bySource.more_ways_to_earn}</span>
                          </div>
                        </div>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>RECENT CLICKS</h3>
                        {analyticsSummary.recentEvents.length === 0 ? (
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', margin: 0, textTransform: 'uppercase' }}>NO CLICKS RECORDED YET.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', padding: '8px', boxSizing: 'border-box' }}>
                            {analyticsSummary.recentEvents.slice(0, 10).map((evt, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontFamily: '"Futura PT Book"', color: '#000', padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                                <span style={{ fontWeight: '500' }}>{PLATFORM_LABEL[evt.platform]}</span>
                                <span style={{ color: '#808080' }}>{SOURCE_LABEL[evt.source]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {analyticsSubTab === 'BY PLATFORM' && (
                      <>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>CLICKS BY PLATFORM</h3>
                        <div className="space-y-2">
                          {(['instagram', 'twitter', 'facebook', 'tiktok'] as const).map((p) => (
                            <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.byPlatform[p]}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {analyticsSubTab === 'BY SOURCE' && (
                      <>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>MENU TOGGLE</h3>
                        <div className="space-y-2 mb-4">
                          {(['instagram', 'twitter', 'facebook'] as const).map((p) => (
                            <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.byPlatformAndSource[p].menu}</span>
                            </div>
                          ))}
                        </div>
                        <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>MORE WAYS TO EARN</h3>
                        <div className="space-y-2">
                          {(['instagram', 'twitter', 'facebook', 'tiktok'] as const).map((p) => (
                            <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{analyticsSummary.byPlatformAndSource[p].more_ways_to_earn}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <PageActionsBelowCard>
              <button
                type="button"
                onClick={() => {}}
                className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
                style={pageActionButtonStyle}
              >
                EXPORT ANALYTICS
              </button>
            </PageActionsBelowCard>
          </div>
        </div>
      </div>
    </div>
  );
}

