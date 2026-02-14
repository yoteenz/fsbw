import { useMemo } from 'react';
import AdminHeader from '../components/AdminHeader';
import StatsCard from '../components/StatsCard';
import { getSocialAnalyticsSummary } from '../../../utils/socialAnalytics';
import type { SocialPlatform, SocialSource } from '../../../utils/socialAnalytics';

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
  const summary = useMemo(() => getSocialAnalyticsSummary(), []);

  const statsData = [
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
  ];

  return (
    <>
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
          <AdminHeader title="ANALYTICS" showBack onBack={() => window.history.back()} />
          <div className="pb-6 px-4">
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4">
                {statsData.map((stat, index) => (
                  <StatsCard key={index} data={stat} />
                ))}
              </div>
              {/* Recent events */}
              <div className="mt-6 border border-black bg-white/60 backdrop-blur-sm" style={{ borderWidth: '1.3px', padding: '16px' }}>
                <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', margin: '0 0 12px 0', fontWeight: '500' }}>
                  RECENT SOCIAL CLICKS
                </h3>
                {summary.recentEvents.length === 0 ? (
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080', margin: '0' }}>
                    No clicks recorded yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
                    {summary.recentEvents.map((evt, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '10px',
                          fontFamily: '"Futura PT Book"',
                          color: '#000',
                          padding: '6px 8px',
                          backgroundColor: 'rgba(0,0,0,0.04)',
                          borderRadius: '4px',
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>{PLATFORM_LABEL[evt.platform]}</span>
                        <span style={{ color: '#808080' }}>{SOURCE_LABEL[evt.source]}</span>
                        <span style={{ color: '#808080', whiteSpace: 'nowrap' }}>{formatEventTime(evt.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
