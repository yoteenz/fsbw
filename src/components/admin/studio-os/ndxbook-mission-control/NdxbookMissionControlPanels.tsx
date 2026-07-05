import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NdxbookMissionControlStore } from '../../../../studio-os-core/ndxbook/mission-control/types';
import type { NdxbookVolumeId } from '../../../../studio-os-core/ndxbook/types';
import { VOLUME_LABELS, PLATFORM_LABELS } from '../../../../studio-os-core/ndxbook/constants';
import { ACTIVITY_CATEGORY_COLORS, PLATFORM_ICONS, TALENT_STATUS_COLORS } from '../../../../studio-os-core/ndxbook/mission-control/constants';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import {
  MC,
  formatCurrency,
  formatNumber,
  mcDarkPanel,
  mcLabel,
  mcLiveDot,
  mcPanel,
  mcProgressBar,
  mcSectionTitle,
  mcValue,
  trendArrow,
  trendColor,
} from './ndxbookMissionControlTheme';

type PanelProps = {
  store: NdxbookMissionControlStore;
  formatTime: (iso: string) => string;
  formatDate: () => string;
  formatClock: () => string;
  countdownToLaunch: string;
  lastUpdatedAt: string;
  onReschedule: (itemId: string, newScheduledAt: string) => void;
};

function MetricRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-2 py-0.5">
      <span style={mcLabel}>{label}</span>
      <span style={{ ...mcLabel, color: accent ? MC.accent : MC.black, fontFamily: '"Futura PT Medium"' }}>{value}</span>
    </div>
  );
}

export function TodaysBriefingPanel({ store, formatDate, formatClock }: PanelProps) {
  const b = store.briefing;
  return (
    <section className="p-3 mb-3" style={{ ...mcDarkPanel, borderTop: `3px solid ${MC.accent}` }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p style={{ ...mcLabel, color: '#94A3B8', fontSize: '8px' }}>
            <span style={mcLiveDot} />
            TODAY&apos;S BRIEFING · LIVE
          </p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '20px', color: '#F8FAFC', margin: '4px 0 0' }}>
            {b.greeting.toUpperCase()}
          </p>
          <p style={{ ...mcLabel, color: '#CBD5E1' }}>{formatDate()}</p>
        </div>
        <p className="ndxbook-mc-countdown" style={{ color: MC.accent, fontSize: '16px', textAlign: 'right' }}>
          {formatClock()}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3">
        <MetricRow label="PAGES PUBLISHING TODAY" value={String(b.pagesPublishingToday)} accent />
        <MetricRow label="IN PRODUCTION" value={String(b.pagesInProduction)} accent />
        <MetricRow label="PENDING APPROVALS" value={String(b.pendingApprovals)} />
        <MetricRow label="EST. REACH TODAY" value={formatNumber(b.estimatedReachToday)} />
        <MetricRow label="EST. REVENUE TODAY" value={formatCurrency(b.estimatedRevenueToday)} />
        <MetricRow label="TOP PAGE" value={b.highestPerformingPage.slice(0, 28) + (b.highestPerformingPage.length > 28 ? '…' : '')} />
        <MetricRow label="TOP VOLUME" value={b.highestPerformingVolume} />
        <MetricRow label="TOP HOST" value={b.highestPerformingHost} />
      </div>
      <div className="mt-3 pt-2 space-y-1" style={{ borderTop: '1px solid rgba(99,102,241,0.25)' }}>
        <p style={{ ...mcLabel, color: '#A5B4FC' }}>STUDIO INTELLIGENCE · {b.studioRecommendation}</p>
        <p style={{ ...mcLabel, color: MC.green }}>OPPORTUNITY · {b.topOpportunity}</p>
        <p style={{ ...mcLabel, color: MC.red }}>RISK · {b.topRisk}</p>
        <p style={{ ...mcLabel, color: '#F8FAFC', fontFamily: '"Futura PT Medium"' }}>NEXT · {b.nextSuggestedAction}</p>
      </div>
    </section>
  );
}

export function CompanyHealthPanel({ store }: PanelProps) {
  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>COMPANY HEALTH</p>
      <div className="space-y-2">
        {store.companyHealth.map((m) => (
          <div key={m.id}>
            <div className="flex justify-between mb-0.5">
              <span style={mcLabel}>{m.label}</span>
              <span style={{ ...mcLabel, color: trendColor(m.trend) }}>
                {m.score}% {trendArrow(m.trend)} {m.trendLabel}
              </span>
            </div>
            <div className="w-full h-1 overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <div style={mcProgressBar(m.score, m.id === 'overall' ? MC.red : MC.accent)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NewsroomPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  return (
    <section className="p-3 mb-3 overflow-x-auto" style={mcPanel}>
      <div className="flex items-center justify-between mb-2">
        <p style={mcSectionTitle}>NEWSROOM · PRODUCTION PIPELINE</p>
        <button
          type="button"
          onClick={() => navigate('/admin/studio-os/workspace/ai-media/newsroom')}
          className="px-2 py-1 text-[6px] font-futura border"
          style={{ fontWeight: 515, color: MC.accent, borderColor: MC.accent }}
        >
          ENTER NEWSROOM →
        </button>
      </div>
      <div className="flex gap-1 min-w-max pb-1">
        {store.newsroomStages.map((stage, i) => (
          <div key={stage.id} className="flex items-center">
            <button
              type="button"
              onClick={() => navigate(`/admin/studio/ndxbook?tab=pages&stage=${stage.id}`)}
              className="p-2 text-left min-w-[72px] border transition-opacity hover:opacity-90"
              style={{
                borderColor: stage.activeItems > 0 ? MC.accent : MC.panelBorder,
                background: stage.activeItems > 0 ? 'rgba(99,102,241,0.08)' : 'white',
              }}
            >
              <p style={{ ...mcLabel, color: MC.accent, fontSize: '6px' }}>{stage.label}</p>
              <p style={{ ...mcValue, fontSize: '16px' }}>{stage.pageCount}</p>
              <p style={mcLabel}>{stage.activeItems} ACTIVE</p>
              <p style={mcLabel}>ETA {stage.estimatedCompletionMins}M</p>
              <p style={{ ...mcLabel, fontSize: '5px' }}>{stage.assignedExecutive}</p>
            </button>
            {i < store.newsroomStages.length - 1 ? (
              <span style={{ color: MC.gray, fontSize: '10px', padding: '0 2px' }}>↓</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function PublishingTimelinePanel({ store, formatTime, onReschedule }: PanelProps) {
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDrop = (targetHour: number) => {
    if (!dragId) return;
    const d = new Date();
    d.setHours(targetHour, 0, 0, 0);
    onReschedule(dragId, d.toISOString());
    setDragId(null);
  };

  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>PUBLISHING TIMELINE · TODAY</p>
      <div className="space-y-1">
        {store.publishingSchedule.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragId(item.id)}
            onDragEnd={() => setDragId(null)}
            className="p-2 border flex items-center gap-2 cursor-grab active:cursor-grabbing"
            style={{
              borderColor: dragId === item.id ? MC.accent : MC.panelBorder,
              background: item.status === 'published' ? 'rgba(22,163,74,0.06)' : 'white',
              opacity: dragId === item.id ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '12px' }}>{PLATFORM_ICONS[item.platform] ?? '•'}</span>
            <div className="flex-1 min-w-0">
              <p style={{ ...mcLabel, color: MC.black, fontFamily: '"Futura PT Medium"' }}>
                {formatTime(item.scheduledAt)} · {item.pageLabel.toUpperCase()} · {VOLUME_LABELS[item.volumeId]} · {item.chapter.toUpperCase()}
              </p>
              <p style={mcLabel}>{PLATFORM_LABELS[item.platform]} · {item.status.replace('-', ' ').toUpperCase()}</p>
            </div>
            <span style={{ ...mcLabel, color: item.status === 'published' ? MC.green : MC.accent }}>{formatTime(item.estimatedPublishAt)}</span>
          </div>
        ))}
      </div>
      <p style={{ ...mcLabel, marginTop: 8 }}>DRAG ROW · DROP ON SLOT TO RESCHEDULE</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {[10, 12, 14, 16, 18, 20].map((h) => (
          <button
            key={h}
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(h)}
            className="px-2 py-1 text-[6px] font-futura border"
            style={{ borderColor: MC.accent, color: MC.accent, fontWeight: 515 }}
          >
            {h > 12 ? h - 12 : h}{h >= 12 ? ' PM' : ' AM'}
          </button>
        ))}
      </div>
    </section>
  );
}

export function PageOfTheDayPanel({ store, countdownToLaunch }: PanelProps) {
  const p = store.pageOfTheDay;
  return (
    <section className="p-3 mb-3 relative overflow-hidden" style={{ ...mcPanel, borderColor: MC.accent, borderWidth: 2 }}>
      <div className="absolute top-2 right-2 ndxbook-mc-live" style={mcLiveDot} />
      <p style={mcSectionTitle}>PAGE OF THE DAY</p>
      <p style={{ ...mcValue, fontSize: '18px', color: MC.red }}>{p.pageLabel.toUpperCase()}</p>
      <p style={{ ...mcLabel, color: MC.black, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}>{p.title}</p>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <MetricRow label="VOLUME" value={VOLUME_LABELS[p.volumeId]} />
        <MetricRow label="CHAPTER" value={p.chapter.toUpperCase()} />
        <MetricRow label="HOST" value={p.hostName} />
        <MetricRow label="STATUS" value={p.status.toUpperCase()} accent />
      </div>
      <p style={{ ...mcLabel, marginTop: 6 }}>THUMBNAIL · {p.thumbnailNote}</p>
      <p style={mcLabel}>PLATFORMS · {p.platforms.map((pl) => PLATFORM_LABELS[pl]).join(' · ')}</p>
      <p style={{ ...mcLabel, color: MC.accent }}>PREDICTED · {p.predictedPerformance}</p>
      <p className="ndxbook-mc-countdown mt-2" style={{ color: MC.red }}>
        LAUNCH IN {countdownToLaunch}
      </p>
    </section>
  );
}

function LibraryPageList({ pages, emptyLabel }: { pages: NdxbookMissionControlStore['library']['latestPages']; emptyLabel: string }) {
  if (pages.length === 0) return <p style={mcLabel}>{emptyLabel}</p>;
  return (
    <div className="space-y-1">
      {pages.map((p) => (
        <div key={p.id} className="p-1.5 border" style={{ borderColor: MC.panelBorder }}>
          <p style={{ ...mcLabel, color: MC.accent, fontFamily: '"Futura PT Medium"' }}>
            {p.pageLabel.toUpperCase()} · {VOLUME_LABELS[p.volumeId]} · {p.chapter.toUpperCase()}
          </p>
          <p style={{ ...mcLabel, color: MC.black, fontSize: '6px' }}>{p.title}</p>
          <p style={mcLabel}>{p.status.toUpperCase()} · {p.performanceSnapshot}</p>
        </div>
      ))}
    </div>
  );
}

export function NdxbookLibraryPanel({ store }: PanelProps) {
  const lib = store.library;
  return (
    <section className="p-3 mb-3 space-y-3" style={mcPanel}>
      <p style={mcSectionTitle}>NDXBOOK LIBRARY</p>
      {(
        [
          ['LATEST PAGES', lib.latestPages],
          ['RECENTLY UPDATED', lib.recentlyUpdated],
          ['MOST BOOKMARKED', lib.mostBookmarked],
          ['HIGHEST SHARED', lib.highestShared],
          ['HIGHEST RETENTION', lib.highestRetention],
        ] as const
      ).map(([label, pages]) => (
        <div key={label}>
          <p style={{ ...mcSectionTitle, fontSize: '8px' }}>{label}</p>
          <LibraryPageList pages={pages} emptyLabel="NO PAGES YET" />
        </div>
      ))}
      <div>
        <p style={{ ...mcSectionTitle, fontSize: '8px' }}>RECENT COLLECTIONS</p>
        {lib.recentCollections.map((c) => (
          <p key={c.id} style={mcLabel}>· {c.title} · {c.pageCount} PAGES</p>
        ))}
      </div>
    </section>
  );
}

export function VolumeExplorerPanel({ store }: PanelProps) {
  const [selectedVolume, setSelectedVolume] = useState<NdxbookVolumeId | null>(null);
  const chapters = selectedVolume ? store.chaptersByVolume[selectedVolume] ?? [] : [];

  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>VOLUME EXPLORER</p>
      <div className="grid grid-cols-2 gap-2">
        {store.volumes.map((vol) => (
          <button
            key={vol.volumeId}
            type="button"
            onClick={() => setSelectedVolume(vol.volumeId === selectedVolume ? null : vol.volumeId)}
            className="p-2 border text-left"
            style={{
              borderColor: selectedVolume === vol.volumeId ? MC.accent : MC.panelBorder,
              background: selectedVolume === vol.volumeId ? 'rgba(99,102,241,0.08)' : 'white',
            }}
          >
            <p style={{ ...mcValue, fontSize: '14px' }}>{vol.label}</p>
            <p style={mcLabel}>{vol.pageCount} PAGES · {vol.chapterCount} CHAPTERS</p>
            <p style={mcLabel}>{vol.avgRetentionPct}% RET · {formatNumber(vol.shares)} SHARES</p>
            <p style={{ ...mcLabel, color: trendColor(vol.trend) }}>+{vol.growthPct}% GROWTH {trendArrow(vol.trend)}</p>
          </button>
        ))}
      </div>
      {selectedVolume && chapters.length > 0 ? (
        <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${MC.panelBorder}` }}>
          <p style={mcSectionTitle}>CHAPTER EXPLORER · {VOLUME_LABELS[selectedVolume]}</p>
          {chapters.map((ch) => (
            <div key={ch.id} className="p-2 mb-1 border" style={{ borderColor: MC.panelBorder }}>
              <p style={{ ...mcLabel, color: MC.accent, fontFamily: '"Futura PT Medium"' }}>{ch.name.toUpperCase()} · {ch.pageCount} PAGES · SCORE {ch.performanceScore}</p>
              <p style={mcLabel}>ENGAGEMENT · {ch.engagementPct}%</p>
              <p style={mcLabel}>NEXT · {ch.recommendedNextPage}</p>
              <p style={mcLabel}>GAPS · {ch.knowledgeGaps.join(' · ')}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ReaderIntelligencePanel({ store }: PanelProps) {
  const r = store.readerIntelligence;
  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>READER INTELLIGENCE</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <MetricRow label="NEW READERS" value={formatNumber(r.newReaders)} accent />
        <MetricRow label="RETURNING" value={formatNumber(r.returningReaders)} />
        <MetricRow label="RETENTION" value={`${r.retentionPct}%`} />
        <MetricRow label="BOOKMARKS" value={formatNumber(r.bookmarks)} />
        <MetricRow label="SHARES" value={formatNumber(r.shares)} />
        <MetricRow label="COMMENTS" value={formatNumber(r.comments)} />
        <MetricRow label="WATCH TIME" value={`${formatNumber(r.watchTimeHours)}H`} />
        <MetricRow label="AVG COMPLETION" value={`${r.avgCompletionPct}%`} />
        <MetricRow label="BEST HOUR" value={r.bestPublishingHour} accent />
      </div>
      <p style={{ ...mcSectionTitle, marginTop: 10, fontSize: '8px' }}>TOP COUNTRIES</p>
      <p style={mcLabel}>{r.topCountries.join(' · ')}</p>
      <p style={{ ...mcSectionTitle, marginTop: 6, fontSize: '8px' }}>AGE GROUPS</p>
      <p style={mcLabel}>{r.topAgeGroups.join(' · ')}</p>
      <p style={{ ...mcSectionTitle, marginTop: 6, fontSize: '8px' }}>INTERESTS</p>
      <p style={mcLabel}>{r.topInterests.join(' · ')}</p>
    </section>
  );
}

export function StudioIntelligencePanel({ store }: PanelProps) {
  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>STUDIO INTELLIGENCE</p>
      <div className="space-y-2">
        {store.intelligence.map((rec) => (
          <div key={rec.id} className="p-2 border" style={{ borderColor: rec.category === 'risk' ? MC.red : MC.panelBorder, background: rec.category === 'risk' ? 'rgba(235,28,36,0.04)' : 'white' }}>
            <p style={{ ...mcLabel, color: MC.accent, fontFamily: '"Futura PT Medium"' }}>{rec.category.toUpperCase()} · {rec.title}</p>
            <p style={{ ...mcLabel, color: MC.black, fontSize: '6px' }}>WHY · {rec.why}</p>
            <p style={mcLabel}>CONFIDENCE · {rec.confidencePct}% · IMPACT · {rec.expectedImpact}</p>
            <p style={{ ...mcLabel, color: MC.red }}>ACTION · {rec.recommendedAction}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RevenueCenterPanel({ store }: PanelProps) {
  const r = store.revenue;
  const periods = [
    ['TODAY', r.today],
    ['THIS WEEK', r.thisWeek],
    ['THIS MONTH', r.thisMonth],
    ['THIS YEAR', r.thisYear],
  ] as const;
  const channels = Object.entries(r.breakdown) as [string, number][];

  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>REVENUE CENTER</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {periods.map(([label, val]) => (
          <div key={label} className="p-2 text-center border" style={{ borderColor: MC.panelBorder }}>
            <p style={{ ...mcValue, fontSize: '14px' }}>{formatCurrency(val)}</p>
            <p style={mcLabel}>{label}</p>
          </div>
        ))}
      </div>
      <p style={{ ...mcSectionTitle, fontSize: '8px' }}>BY CHANNEL</p>
      {channels.map(([ch, val]) => (
        <MetricRow key={ch} label={ch.replace(/([A-Z])/g, ' $1').toUpperCase()} value={formatCurrency(val)} />
      ))}
      <p style={{ ...mcLabel, marginTop: 8, color: MC.accent }}>
        FORECAST NEXT MONTH · {formatCurrency(r.forecastNextMonth)} · {r.forecastConfidencePct}% CONFIDENCE (STUDIO INTELLIGENCE)
      </p>
    </section>
  );
}

export function LabsExperimentsPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>STUDIO OS LABS · ACTIVE EXPERIMENTS</p>
      {store.experiments.map((exp) => (
        <div key={exp.id} className="p-2 mb-1 border" style={{ borderColor: exp.status === 'active' ? MC.accent : MC.panelBorder }}>
          <p style={{ ...mcLabel, color: MC.accent, fontFamily: '"Futura PT Medium"' }}>{exp.name.toUpperCase()}</p>
          <p style={mcLabel}>WINNER · {exp.winner} · {exp.confidencePct}% CONF</p>
          <p style={mcLabel}>LEADER · {exp.currentLeader} · {exp.historicalResults}</p>
          <p style={mcLabel}>ROLLOUT · {exp.recommendedRollout}</p>
        </div>
      ))}
      <button type="button" className="text-[6px] underline mt-2" style={{ color: MC.accent }} onClick={() => navigate('/admin/studio/labs')}>
        OPEN STUDIO OS LABS
      </button>
    </section>
  );
}

export function TalentBoardPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>TALENT BOARD · LIVE HOSTS</p>
      {store.talentBoard.map((host) => (
        <div key={host.id} className="p-2 mb-1 border flex justify-between gap-2" style={{ borderColor: MC.panelBorder }}>
          <div>
            <p style={{ ...mcLabel, color: MC.black, fontFamily: '"Futura PT Medium"' }}>{host.displayName.toUpperCase()}</p>
            <p style={mcLabel}>{host.role.toUpperCase()} · {VOLUME_LABELS[host.volumeId]}</p>
            {host.currentPage ? <p style={mcLabel}>NOW · {host.currentPage}</p> : null}
            {host.nextSlot ? <p style={mcLabel}>NEXT · {host.nextSlot}</p> : null}
          </div>
          <span
            className="self-start px-1 py-0.5 text-[5px] font-futura"
            style={{ background: TALENT_STATUS_COLORS[host.status], color: 'white', fontWeight: 515 }}
          >
            {host.status.toUpperCase()}
          </span>
        </div>
      ))}
      <button type="button" className="text-[6px] underline mt-2" style={{ color: MC.accent }} onClick={() => navigate('/admin/studio/talent-network')}>
        OPEN TALENT NETWORK
      </button>
    </section>
  );
}

export function MissionActionsPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  const sorted = [...store.missionActions].sort((a, b) => b.frequencyScore - a.frequencyScore);

  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>MISSION CONTROL · PRIMARY ACTIONS</p>
      <div className="grid grid-cols-2 gap-1">
        {sorted.map((action, i) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.route)}
            className="py-2 px-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: i < 3 ? MC.red : MC.panelBorder,
              color: i < 3 ? MC.red : MC.gray,
              background: i < 3 ? 'rgba(235,28,36,0.04)' : 'white',
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export function ActivityWallPanel({ store, formatTime }: PanelProps) {
  const sorted = [...store.activityFeed].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section className="p-3 mb-3" style={mcPanel}>
      <p style={mcSectionTitle}>
        <span style={mcLiveDot} />
        ACTIVITY WALL · LIVE
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {sorted.map((ev) => (
          <div key={ev.id} className="flex gap-2 py-1 border-b" style={{ borderColor: '#eee' }}>
            <span style={{ width: 4, flexShrink: 0, background: ACTIVITY_CATEGORY_COLORS[ev.category] ?? MC.gray }} />
            <div className="flex-1 min-w-0">
              <p style={{ ...mcLabel, color: MC.black, fontSize: '6px' }}>{ev.message}</p>
              <p style={{ ...mcLabel, fontSize: '5px' }}>{formatTime(ev.timestamp)} · {ev.category.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MissionControlHeader({ lastUpdatedAt }: { lastUpdatedAt: string }) {
  return (
    <header className="p-3 mb-3 flex items-center justify-between" style={{ ...mcPanel, borderTop: `3px solid ${MC.red}` }}>
      <div>
        <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', color: MC.black, margin: 0 }}>
          MISSION CONTROL
        </p>
        <p style={mcLabel}>
          <span style={mcLiveDot} />
          NDXBOOK HQ · AI MEDIA OPERATING CENTER
        </p>
      </div>
      <p style={{ ...mcLabel, fontSize: '5px', textAlign: 'right' }}>
        UPDATED<br />
        {new Date(lastUpdatedAt).toLocaleTimeString()}
      </p>
    </header>
  );
}

export function ExternalNavPanel({ tab, workspaceId }: { tab: string; workspaceId: string }) {
  const navigate = useNavigate();
  const routes: Record<string, { label: string; path: string }> = {
    'creative-dna': { label: 'CREATIVE DNA', path: '/admin/studio/memory-bible' },
    knowledge: { label: 'KNOWLEDGE', path: '/admin/studio/knowledge-hub' },
    settings: { label: 'SETTINGS', path: STUDIO_OS_ROUTES.workspaceSettings(workspaceId) },
  };
  const r = routes[tab];
  if (!r) return null;

  return (
    <section className="p-6 mb-3 text-center" style={mcPanel}>
      <p style={mcSectionTitle}>{r.label}</p>
      <p style={mcLabel}>FULL MODULE AVAILABLE IN STUDIO OS</p>
      <button
        type="button"
        className="mt-3 px-4 py-2 text-[7px] font-futura border"
        style={{ fontWeight: 515, borderColor: MC.accent, color: MC.accent }}
        onClick={() => navigate(r.path)}
      >
        OPEN {r.label}
      </button>
    </section>
  );
}
