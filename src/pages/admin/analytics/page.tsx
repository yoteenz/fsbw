import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { getSocialAnalyticsSummary } from '../../../utils/socialAnalytics';
import type { SocialPlatform, SocialSource } from '../../../utils/socialAnalytics';
import { getAdminAnalytics } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';

const ANALYTICS_TABS = ['SUMMARY', 'BY PLATFORM', 'BY SOURCE'] as const;

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

function formatEventTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function AdminAnalytics() {
  useRequireAdminPageAccess();
  const localSummary = getSocialAnalyticsSummary();
  const [summary, setSummary] = useState(localSummary);
  const [activeTab, setActiveTab] = useState<typeof ANALYTICS_TABS[number]>('SUMMARY');

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
          if (!r) return;
          const recent = (r.recentEvents ?? []).filter(
            (e): e is typeof e & { platform: SocialPlatform; source: SocialSource } =>
              e != null &&
              typeof e.platform === 'string' &&
              typeof e.source === 'string' &&
              typeof e.timestamp === 'number'
          );
          setSummary({
            total: r.total,
            bySource: r.bySource as Record<SocialSource, number>,
            byPlatform: r.byPlatform as Record<SocialPlatform, number>,
            byPlatformAndSource: r.byPlatformAndSource as Record<SocialPlatform, Record<SocialSource, number>>,
            recentEvents: recent.map((e) => ({
              platform: e.platform as SocialPlatform,
              source: e.source as SocialSource,
              timestamp: e.timestamp,
            })),
          });
        })
        .catch(() => {});
    }
  }, []);

  void ([
    {
      title: 'TOTAL CLICKS',
      count: summary.total,
      items: [
        { label: 'Menu toggle', value: String(summary.bySource.menu), color: 'text-gray-500' },
        { label: 'More ways to earn', value: String(summary.bySource.more_ways_to_earn), color: 'text-red-500' },
      ],
      activity: 'Social link clicks across the site',
    },
    {
      title: 'BY PLATFORM',
      count: summary.total,
      items: [
        { label: 'Instagram', value: String(summary.byPlatform.instagram), color: 'text-red-500' },
        { label: 'Twitter / X', value: String(summary.byPlatform.twitter), color: 'text-red-500' },
        { label: 'Facebook', value: String(summary.byPlatform.facebook), color: 'text-red-500' },
        { label: 'TikTok', value: String(summary.byPlatform.tiktok), color: 'text-gray-500' },
      ],
      activity: 'Clicks per social platform',
    },
    {
      title: 'MENU CLICKS',
      count: summary.bySource.menu,
      items: [
        { label: 'Instagram', value: String(summary.byPlatformAndSource.instagram.menu), color: 'text-gray-500' },
        { label: 'Twitter', value: String(summary.byPlatformAndSource.twitter.menu), color: 'text-gray-500' },
        { label: 'Facebook', value: String(summary.byPlatformAndSource.facebook.menu), color: 'text-gray-500' },
      ],
      activity: 'From mobile menu social icons',
    },
    {
      title: 'MORE WAYS TO EARN',
      count: summary.bySource.more_ways_to_earn,
      items: [
        { label: 'Instagram', value: String(summary.byPlatformAndSource.instagram.more_ways_to_earn), color: 'text-gray-500' },
        { label: 'Twitter', value: String(summary.byPlatformAndSource.twitter.more_ways_to_earn), color: 'text-gray-500' },
        { label: 'Facebook', value: String(summary.byPlatformAndSource.facebook.more_ways_to_earn), color: 'text-gray-500' },
        { label: 'TikTok', value: String(summary.byPlatformAndSource.tiktok.more_ways_to_earn), color: 'text-gray-500' },
      ],
      activity: 'From membership “More ways to earn” links',
    },
  ]);

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
          title="ANALYTICS"
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
              <div style={{ height: '10px' }} />

              {/* Total clicks above tabs */}
              <div className="text-center py-4 px-5">
                <p className="font-covered-by-your-grace text-3xl" style={{ color: '#EB1C24' }}>{summary.total}</p>
                <p className="text-xs font-futura mt-2" style={{ color: '#808080' }}>TOTAL CLICKS</p>
              </div>

              <div className="flex flex-wrap justify-center gap-[14px] px-5">
                {ANALYTICS_TABS.map((tab) => (
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
                {activeTab === 'SUMMARY' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>BY SOURCE</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>MENU TOGGLE</span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{summary.bySource.menu}</span>
                      </div>
                      <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>MORE WAYS TO EARN</span>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{summary.bySource.more_ways_to_earn}</span>
                      </div>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>RECENT CLICKS</h3>
                    {summary.recentEvents.length === 0 ? (
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', margin: '0', textTransform: 'uppercase' }}>NO CLICKS RECORDED YET.</p>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          maxHeight: '140px',
                          overflowY: 'auto',
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          boxSizing: 'border-box',
                        }}
                      >
                        {summary.recentEvents.slice(0, 10).map((evt, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontFamily: '"Futura PT Book"', color: '#000', padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                            <span style={{ fontWeight: '500' }}>{PLATFORM_LABEL[evt.platform]}</span>
                            <span style={{ color: '#808080' }}>{SOURCE_LABEL[evt.source]}</span>
                            <span style={{ color: '#808080', whiteSpace: 'nowrap' }}>{formatEventTime(evt.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'BY PLATFORM' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>CLICKS BY PLATFORM</h3>
                    <div className="space-y-2">
                      {(['instagram', 'twitter', 'facebook', 'tiktok'] as const).map((p) => (
                        <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{summary.byPlatform[p]}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'BY SOURCE' && (
                  <>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>MENU TOGGLE</h3>
                    <div className="space-y-2 mb-4">
                      {(['instagram', 'twitter', 'facebook'] as const).map((p) => (
                        <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{summary.byPlatformAndSource[p].menu}</span>
                        </div>
                      ))}
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>MORE WAYS TO EARN</h3>
                    <div className="space-y-2">
                      {(['instagram', 'twitter', 'facebook', 'tiktok'] as const).map((p) => (
                        <div key={p} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080' }}>{PLATFORM_LABEL[p]}</span>
                          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{summary.byPlatformAndSource[p].more_ways_to_earn}</span>
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
                onClick={() => {
                  const blob = new Blob([JSON.stringify(summary, null, 2)], {
                    type: 'application/json',
                  });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `admin-analytics-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
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
