import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioMetricTile } from '../../../../components/admin/studio/AdminStudioMetricTile';
import { AdminStudioRankedList } from '../../../../components/admin/studio/AdminStudioRankedList';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioFilterBar } from '../../../../components/admin/studio/AdminStudioFilterBar';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { ADMIN_STUDIO_DEFAULT_ANALYTICS } from '../../../../utils/adminStudioAnalyticsDemo';

export default function AdminStudioAnalyticsPage() {
  const navigate = useNavigate();
  const [showId, setShowId] = useState(ADMIN_STUDIO_DEFAULT_ANALYTICS[0]?.showId ?? 'the-slay-report');

  const analytics = useMemo(
    () => ADMIN_STUDIO_DEFAULT_ANALYTICS.find((a) => a.showId === showId),
    [showId]
  );

  return (
    <AdminStudioStageShell
      title="ANALYTICS"
      subtitle="PER-SHOW PERFORMANCE — DEMO METRICS"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
      accentHex={analytics?.accentHex}
    >
      <AdminStudioSectionHeading>SHOW PERFORMANCE</AdminStudioSectionHeading>

      <AdminStudioFilterBar
        items={ADMIN_STUDIO_DEFAULT_ANALYTICS.map((show) => ({
          id: show.showId,
          label: show.showName,
        }))}
        activeId={showId}
        onChange={setShowId}
        accentHex={analytics?.accentHex}
      />

      {analytics ? (
        <div className="space-y-4">
          <p
            className="text-[9px] font-futura uppercase"
            style={{ fontWeight: 515, color: '#9A9A9A' }}
          >
            {analytics.showName} · DEMO DATA
          </p>

          <div className="grid grid-cols-2 gap-2">
            <AdminStudioMetricTile label="VIEWS" value={analytics.views} accentHex={analytics.accentHex} />
            <AdminStudioMetricTile label="WATCH TIME" value={analytics.watchTime} accentHex={analytics.accentHex} />
            <AdminStudioMetricTile label="COMPLETION RATE" value={analytics.completionRate} accentHex={analytics.accentHex} />
            <AdminStudioMetricTile label="CTR" value={analytics.ctr} accentHex={analytics.accentHex} />
            <AdminStudioMetricTile label="EMAIL OPENS" value={analytics.emailOpens} accentHex={analytics.accentHex} />
            <AdminStudioMetricTile label="MEMBERSHIP CONVERSIONS" value={analytics.membershipConversions} accentHex={analytics.accentHex} />
          </div>

          <AdminStudioMetricTile
            label="PRODUCTS PURCHASED"
            value={analytics.productsPurchased}
            accentHex={analytics.accentHex}
          />

          <AdminStudioRankedList
            title="TOP EPISODES"
            items={analytics.topEpisodes}
            accentHex={analytics.accentHex}
          />

          <div
            className="p-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p
              className="text-[8px] font-futura uppercase mb-2 tracking-wider"
              style={{ fontWeight: 515, color: analytics.accentHex }}
            >
              TRENDING TOPICS
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analytics.trendingTopics.map((topic) => (
                <span
                  key={topic}
                  className="text-[7px] font-futura uppercase px-2 py-1"
                  style={{
                    fontWeight: 515,
                    color: '#FFFFFF',
                    background: `${analytics.accentHex}22`,
                    border: `1px solid ${analytics.accentHex}44`,
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <AdminStudioRankedList
            title="MOST POPULAR CONTENT"
            items={analytics.mostPopularContent}
            accentHex={analytics.accentHex}
          />
        </div>
      ) : null}

      <AdminStudioDisclaimerFooter>DEMO ANALYTICS · NO BACKEND · FRONTEND ONLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
