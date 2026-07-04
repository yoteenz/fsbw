import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioAiMediaNetworkState } from '../../../../hooks/useAdminStudioAiMediaNetworkState';
import {
  AI_MEDIA_NETWORK_TABS,
  type AiMediaNetworkTabId,
} from '../../../../utils/adminStudioAiMediaNetworkDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  PILLAR_LABELS,
  PLATFORM_LABELS,
  SHOW_LABELS,
} from '../../../../studio-os-core/ai-media-network/constants';
import { formatSeasonLabel } from '../../../../studio-os-core/ai-media-network/contentCalendar';
import { adminStudioLabsPath, adminStudioMemoryBiblePath } from '../../../../utils/adminStudioRoutes';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border" style={panelStyle}>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[14px] leading-none mt-1"
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function AiMediaNetworkWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as AiMediaNetworkTabId | null) ?? 'overview';
  const [tab, setTab] = useState<AiMediaNetworkTabId>(
    AI_MEDIA_NETWORK_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    workspaceId,
    companyDna,
    pillars,
    shows,
    showAnalytics,
    episodes,
    publishedEpisodes,
    scheduledEpisodes,
    calendar,
    seasonPlans,
    crossPlatform,
    monetizationSummary,
    seriesRankings,
    weeklySchedule,
    labsTargets,
  } = useAdminStudioAiMediaNetworkState();

  const selectTab = (id: AiMediaNetworkTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (!companyDna) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AI MEDIA NETWORK LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="NETWORK SHOWS" value={`${shows.length}`} accent />
              <MetricCard label="CONTENT PILLARS" value={`${pillars.length}`} />
              <MetricCard label="PUBLISHED EPISODES" value={`${publishedEpisodes.length}`} />
              <MetricCard label="NETWORK REVENUE" value={`$${monetizationSummary.total.toLocaleString()}`} />
            </div>
            <SectionLabel>WEEKLY PROGRAMMING LINEUP</SectionLabel>
            {weeklySchedule.map((slot) => (
              <p key={slot.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {slot.date} {slot.time} · {SHOW_LABELS[slot.showId]} · {slot.label}
              </p>
            ))}
            <SectionLabel>TOP SERIES BY REVENUE</SectionLabel>
            {seriesRankings.slice(0, 3).map((s) => (
              <p key={s.showId} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                {SHOW_LABELS[s.showId]} · ${s.revenue.toLocaleString()}
              </p>
            ))}
            <SectionLabel>UPCOMING EPISODES</SectionLabel>
            {scheduledEpisodes.map((ep) => (
              <p key={ep.id} className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {SHOW_LABELS[ep.showId]} S{ep.season}E{ep.episodeNumber} · {ep.title}
              </p>
            ))}
          </div>
        );

      case 'company-dna':
        return (
          <div className="space-y-2">
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                MISSION
              </p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                {companyDna.mission}
              </p>
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                BRAND VALUES
              </p>
              {companyDna.brandValues.map((v) => (
                <p key={v} className="text-[6px] font-futura mt-1 uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  · {v}
                </p>
              ))}
            </div>
            <div className="p-2 border" style={panelStyle}>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                STUDIO OS PILOT ROLE
              </p>
              <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
                {companyDna.pilotRole}
              </p>
            </div>
            <button type="button" className="text-[6px] underline" style={{ color: '#6366F1' }} onClick={() => navigate(adminStudioMemoryBiblePath())}>
              OPEN MEMORY BIBLE
            </button>
          </div>
        );

      case 'pillars':
        return (
          <div className="space-y-2">
            <SectionLabel>FIVE EVERGREEN CONTENT PILLARS · PERMANENT STRATEGY</SectionLabel>
            {pillars.map((p) => (
              <div key={p.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {p.label}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {p.strategy}
                </p>
                <p className="text-[5px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  TOPICS · {p.topics.join(' · ')}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: '#6366F1' }}>
                  KG · {p.knowledgeGraphNodeId}
                </p>
              </div>
            ))}
          </div>
        );

      case 'programming':
        return (
          <div className="space-y-2">
            <SectionLabel>PROGRAMMING NETWORK · RECURRING SHOWS · NOT RANDOM UPLOADS</SectionLabel>
            {shows.map((show) => (
              <div key={show.id} className="p-2 border" style={panelStyle}>
                <p className="text-[8px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {show.name} · {show.weekday.toUpperCase()}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  PILLAR · {PILLAR_LABELS[show.primaryPillar]} · HOST · {show.host}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {show.description}
                </p>
                <p className="text-[5px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  BRANDING · {show.branding}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  THUMB · {show.thumbnailStyle} · INTRO · {show.intro} · OUTRO · {show.outro}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: '#6366F1' }}>
                  CREATIVE DNA · {show.creativeDnaRef} · KG · {show.knowledgeGraphNodeId}
                </p>
              </div>
            ))}
          </div>
        );

      case 'series':
        return (
          <div className="space-y-2">
            <SectionLabel>SERIES MANAGEMENT · EPISODES · ANALYTICS · RECOMMENDATIONS</SectionLabel>
            {shows.map((show) => {
              const analytics = showAnalytics[show.id];
              const showEpisodes = episodes.filter((e) => e.showId === show.id);
              return (
                <div key={show.id} className="p-2 border mb-2" style={panelStyle}>
                  <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                    {show.name} · SEASON {analytics.season} · {analytics.episodes} EPISODES
                  </p>
                  <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    CADENCE · {analytics.publishingCadence} · WATCH · {analytics.averageWatchTimeSec}s · GROWTH +{analytics.audienceGrowth}%
                  </p>
                  <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    REV · ${analytics.revenue} · AFFILIATE · {analytics.affiliatePerformance} clicks
                  </p>
                  <p className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    TOP TOPICS · {analytics.bestPerformingTopics.join(' · ')}
                  </p>
                  {analytics.recommendations.map((r) => (
                    <p key={r} className="text-[5px] font-futura mt-1" style={{ color: '#6366F1' }}>
                      REC · {r}
                    </p>
                  ))}
                  <SectionLabel>EPISODES ({showEpisodes.length})</SectionLabel>
                  {showEpisodes.map((ep) => (
                    <p key={ep.id} className="text-[5px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                      S{ep.season}E{ep.episodeNumber} · {ep.title} · {ep.status.toUpperCase()}
                      {ep.experimentId ? ` · EXP ${ep.experimentId}` : ''}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-2">
            <SectionLabel>NETWORK PROGRAMMING CALENDAR</SectionLabel>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              DAILY SCHEDULE · WEEKLY LINEUP · SEASON PLANNING · SPECIAL CAMPAIGNS
            </p>
            {calendar.map((slot) => (
              <div key={slot.id} className="p-2 border" style={panelStyle}>
                <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {slot.date} · {slot.time} · {SHOW_LABELS[slot.showId]}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {slot.label}
                </p>
                <p className="text-[5px] font-futura mt-1" style={{ color: slot.type === 'campaign' ? '#6366F1' : ADMIN_STUDIO_THEME.textSecondary }}>
                  {slot.type.toUpperCase()}
                </p>
              </div>
            ))}
            <SectionLabel>SEASON PLANS</SectionLabel>
            {seasonPlans.map((plan) => (
              <p key={plan.id} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {formatSeasonLabel(plan)} · {plan.episodeCount} eps · {plan.startDate} → {plan.endDate}
              </p>
            ))}
          </div>
        );

      case 'cross-platform':
        return (
          <div className="space-y-2">
            <SectionLabel>CROSS-PLATFORM PUBLISHING · EVERY EPISODE PREPARED FOR ALL CHANNELS</SectionLabel>
            {episodes.map((ep) => (
              <div key={ep.id} className="p-2 border" style={panelStyle}>
                <p className="text-[6px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.accent }}>
                  {ep.title} · {SHOW_LABELS[ep.showId]}
                </p>
                {crossPlatform
                  .filter((cp) => cp.episodeId === ep.id)
                  .map((cp) => (
                    <p key={`${cp.episodeId}-${cp.platform}`} className="text-[5px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                      {PLATFORM_LABELS[cp.platform]} · {cp.aspectRatio} · {cp.ready ? 'READY' : 'PENDING'} · {cp.captionVariant}
                    </p>
                  ))}
              </div>
            ))}
          </div>
        );

      case 'monetization':
        return (
          <div className="space-y-2">
            <SectionLabel>MONETIZATION CENTER · ${monetizationSummary.total.toLocaleString()} TOTAL</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(monetizationSummary.byChannel).map(([ch, amt]) => (
                <MetricCard key={ch} label={ch.replace(/-/g, ' ').toUpperCase()} value={`$${amt.toLocaleString()}`} />
              ))}
            </div>
            <SectionLabel>BY SERIES</SectionLabel>
            {Object.entries(monetizationSummary.bySeries).map(([showId, amt]) => (
              <p key={showId} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {SHOW_LABELS[showId as keyof typeof SHOW_LABELS] ?? showId} · ${amt.toLocaleString()}
              </p>
            ))}
            <SectionLabel>BY PILLAR</SectionLabel>
            {Object.entries(monetizationSummary.byPillar).map(([pillarId, amt]) => (
              <p key={pillarId} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {PILLAR_LABELS[pillarId] ?? pillarId} · ${amt.toLocaleString()}
              </p>
            ))}
            <SectionLabel>BY PLATFORM</SectionLabel>
            {Object.entries(monetizationSummary.byPlatform).map(([platform, amt]) => (
              <p key={platform} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] ?? platform} · ${amt.toLocaleString()}
              </p>
            ))}
          </div>
        );

      case 'labs':
        return (
          <div className="space-y-2">
            <SectionLabel>STUDIO OS LABS INTEGRATION · EVERY PUBLISHED EPISODE = EXPERIMENT</SectionLabel>
            <p className="text-[6px] font-futura normal-case mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Published episodes auto-register in Labs via publishEpisodeToLabs(). Learnings feed back into platform intelligence.
            </p>
            <SectionLabel>LEARNING FEED TARGETS</SectionLabel>
            {labsTargets.map((t) => (
              <p key={t} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: '#6366F1' }}>
                → {t.toUpperCase()}
              </p>
            ))}
            <SectionLabel>PUBLISHED EPISODES WITH EXPERIMENT IDS</SectionLabel>
            {publishedEpisodes.map((ep) => (
              <p key={ep.id} className="text-[5px] font-futura px-2 py-1 border" style={{ ...panelStyle, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {ep.title} · {ep.experimentId ?? 'PENDING LABS SYNC'}
              </p>
            ))}
            <button
              type="button"
              className="w-full py-2 text-[6px] font-futura uppercase border mt-2"
              style={{ fontWeight: 515, color: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              onClick={() => navigate(adminStudioLabsPath())}
            >
              OPEN STUDIO OS LABS →
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <p className="text-[6px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        WORKSPACE · {workspaceId.toUpperCase()} · REAL DIGITAL MEDIA COMPANY · NOT RANDOM AI VIDEOS
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {AI_MEDIA_NETWORK_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="px-2 py-1 text-[5px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
