import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { NdxbookMissionControlStore } from '../../../../studio-os-core/ndxbook/mission-control/types';
import type { NdxbookVolumeId } from '../../../../studio-os-core/ndxbook/types';
import { VOLUME_LABELS, PLATFORM_LABELS } from '../../../../studio-os-core/ndxbook/constants';
import { ACTIVITY_CATEGORY_COLORS, PLATFORM_ICONS, TALENT_STATUS_COLORS } from '../../../../studio-os-core/ndxbook/mission-control/constants';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { FOUNDER_DISPLAY_NAME } from '../../../../studio-os-core/command-dock/constants';
import { buildChiefConciergeBrief } from '../../../../studio-os-core/studio-immersion/engine';
import { useOrganizationContext } from '../../../../studio-os-core/organization-context';
import {
  INTELLIGENCE_MATURITY_TIERS,
  readFounderPilotModeStore,
} from '../../../../studio-os-core/founder-pilot-mode';
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

const SECTION_ICONS = {
  health: '◉',
  timeline: '◷',
  page: '★',
  operations: '⚙',
  library: '▤',
  intelligence: '◎',
  revenue: '↗',
  labs: '⚗',
  talent: '◈',
  actions: '▶',
  activity: '◌',
} as const;

function CollapsibleSection({
  title,
  icon,
  summary,
  defaultOpen = false,
  children,
  accentBorder,
}: {
  title: string;
  icon?: string;
  summary: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  accentBorder?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className="p-3 mb-4"
      style={{
        ...mcPanel,
        borderTop: accentBorder ? `3px solid ${accentBorder}` : undefined,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p style={mcSectionTitle}>
              {icon ? <span style={{ marginRight: 6 }}>{icon}</span> : null}
              {title}
            </p>
            {!open ? <div className="mt-1">{summary}</div> : null}
          </div>
          <span style={{ ...mcLabel, color: MC.accent, flexShrink: 0 }}>{open ? '−' : '+'}</span>
        </div>
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

export function ChiefConciergeBriefingPanel() {
  const org = useOrganizationContext();
  const brief = buildChiefConciergeBrief('/admin/studio/ndxbook/mission-control', {
    moduleTenantId: org.moduleTenantId,
    organizationName: org.organizationName,
    founderName: FOUNDER_DISPLAY_NAME,
  });

  return (
    <section
      className="p-4 mb-4"
      style={{
        ...mcPanel,
        borderTop: `3px solid ${MC.accent}`,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(99,102,241,0.06) 100%)',
      }}
    >
      <p style={{ ...mcSectionTitle, color: MC.accent }}>CHIEF CONCIERGE</p>
      <p
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          fontSize: '16px',
          color: MC.black,
          margin: '0 0 8px',
        }}
      >
        {brief.greeting}
      </p>
      <div className="space-y-1.5">
        {brief.lines.map((line) => (
          <p key={line} style={{ ...mcLabel, color: '#333', fontSize: '7px', margin: 0 }}>
            {line}
          </p>
        ))}
      </div>
      {brief.cta ? (
        <Link
          to={brief.cta.route}
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontFamily: '"Futura PT Medium"',
            fontSize: '7px',
            letterSpacing: '0.06em',
            color: MC.accent,
            textDecoration: 'none',
          }}
        >
          {brief.cta.label} →
        </Link>
      ) : null}
    </section>
  );
}

export function HeadquartersIntro({ lastUpdatedAt, formatDate }: { lastUpdatedAt: string; formatDate: () => string }) {
  return (
    <header className="mb-4 pb-3" style={{ borderBottom: `1px solid ${MC.panelBorder}` }}>
      <p style={{ ...mcLabel, color: MC.accent, margin: 0 }}>
        <span style={mcLiveDot} />
        NDXBOOK HEADQUARTERS · {formatDate().toUpperCase()}
      </p>
      <p style={{ ...mcLabel, fontSize: '5px', marginTop: 6 }}>
        UPDATED {new Date(lastUpdatedAt).toLocaleTimeString()}
      </p>
    </header>
  );
}

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
  const overall = store.companyHealth.find((m) => m.id === 'overall');
  const summary = overall
    ? `${overall.score}% overall · ${store.companyHealth.length - 1} departments tracked`
    : `${store.companyHealth.length} departments tracked`;

  return (
    <CollapsibleSection
      title="COMPANY HEALTH"
      icon={SECTION_ICONS.health}
      defaultOpen
      summary={<p style={mcLabel}>{summary}</p>}
      accentBorder={MC.red}
    >
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
    </CollapsibleSection>
  );
}

export function NewsroomPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  const activePages = store.newsroomStages.reduce((sum, s) => sum + s.activeItems, 0);
  return (
    <CollapsibleSection
      title="OPERATIONS SNAPSHOT"
      icon={SECTION_ICONS.operations}
      summary={
        <p style={mcLabel}>
          {store.newsroomStages.length} pipeline stages · {activePages} active pages in motion · tap to expand production flow
        </p>
      }
    >
      <div className="overflow-x-auto">
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
              </button>
              {i < store.newsroomStages.length - 1 ? (
                <span style={{ color: MC.gray, fontSize: '10px', padding: '0 2px' }}>→</span>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/studio-os/workspace/ai-media/newsroom')}
          className="mt-2 px-2 py-1 text-[6px] font-futura border"
          style={{ fontWeight: 515, color: MC.accent, borderColor: MC.accent }}
        >
          ENTER NEWSROOM →
        </button>
      </div>
    </CollapsibleSection>
  );
}

const TIMELINE_STATUS_STYLE: Record<string, { color: string; label: string }> = {
  published: { color: MC.green, label: 'PUBLISHED' },
  ready: { color: MC.accent, label: 'READY' },
  queued: { color: MC.warn, label: 'QUEUED' },
  publishing: { color: MC.accent, label: 'PUBLISHING' },
  delayed: { color: MC.red, label: 'DELAYED' },
};

export function PublishingTimelinePanel({ store, formatTime, onReschedule }: PanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDrop = (targetHour: number) => {
    if (!dragId) return;
    const d = new Date();
    d.setHours(targetHour, 0, 0, 0);
    onReschedule(dragId, d.toISOString());
    setDragId(null);
  };

  const publishedCount = store.publishingSchedule.filter((i) => i.status === 'published').length;
  const isEmpty = store.publishingSchedule.length === 0;

  if (isEmpty) {
    return (
      <section className="p-4 mb-4" style={{ ...mcPanel, borderTop: `3px solid ${MC.accent}` }}>
        <p style={mcSectionTitle}>{SECTION_ICONS.timeline} PUBLISHING TIMELINE</p>
        <p style={{ ...mcValue, fontSize: '14px', color: MC.gray }}>No scheduled content.</p>
        <p style={{ ...mcSectionTitle, fontSize: '8px', marginTop: 12 }}>NEXT STEP</p>
        <ul style={{ margin: 0, paddingLeft: 14 }}>
          {['Connect Instagram', 'Create Page 001', 'Schedule your first post'].map((step) => (
            <li key={step} style={{ ...mcLabel, color: MC.black, marginBottom: 4 }}>{step}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="p-4 mb-4" style={{ ...mcPanel, borderTop: `3px solid ${MC.accent}` }}>
      <p style={mcSectionTitle}>
        {SECTION_ICONS.timeline} TODAY&apos;S TIMELINE
      </p>
      <p style={{ ...mcLabel, marginBottom: 12 }}>
        {publishedCount} published · {store.publishingSchedule.length - publishedCount} remaining · tap a block for details
      </p>

      <div className="relative pl-4">
        <div
          className="absolute left-[7px] top-2 bottom-2"
          style={{ width: 2, background: `linear-gradient(180deg, ${MC.green}, ${MC.accent}, ${MC.warn})` }}
        />
        <div className="space-y-3">
          {store.publishingSchedule.map((item) => {
            const status = TIMELINE_STATUS_STYLE[item.status] ?? TIMELINE_STATUS_STYLE.queued;
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className="relative pl-4">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  className="absolute left-0 top-1 w-3 h-3 rounded-full border-2"
                  style={{
                    background: 'white',
                    borderColor: status.color,
                    boxShadow: expanded ? `0 0 0 3px ${status.color}33` : undefined,
                  }}
                  aria-expanded={expanded}
                />
                <div
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragEnd={() => setDragId(null)}
                  className="p-2 border cursor-grab active:cursor-grabbing text-left w-full"
                  style={{
                    borderColor: expanded ? MC.accent : MC.panelBorder,
                    background: item.status === 'published' ? 'rgba(22,163,74,0.06)' : 'white',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: status.color, minWidth: 44 }}>
                      {formatTime(item.scheduledAt)}
                    </span>
                    <span style={{ fontSize: '12px' }}>{PLATFORM_ICONS[item.platform] ?? '•'}</span>
                    <span style={{ ...mcLabel, color: MC.black, fontFamily: '"Futura PT Medium"', flex: 1 }}>
                      {status.label}
                    </span>
                  </div>
                  {expanded ? (
                    <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${MC.panelBorder}` }}>
                      <p style={{ ...mcLabel, color: MC.black, fontFamily: '"Futura PT Medium"' }}>
                        {item.pageLabel.toUpperCase()} · {VOLUME_LABELS[item.volumeId]} · {item.chapter.toUpperCase()}
                      </p>
                      <p style={mcLabel}>{PLATFORM_LABELS[item.platform]}</p>
                    </div>
                  ) : (
                    <p style={{ ...mcLabel, marginTop: 2 }}>{item.pageLabel.toUpperCase()}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ ...mcLabel, marginTop: 12 }}>DRAG BLOCK · DROP ON SLOT TO RESCHEDULE</p>
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
    <section className="p-4 mb-4 relative overflow-hidden" style={{ ...mcPanel, borderColor: MC.accent, borderWidth: 2 }}>
      <div className="absolute top-2 right-2 ndxbook-mc-live" style={mcLiveDot} />
      <p style={mcSectionTitle}>{SECTION_ICONS.page} PRIORITY OF THE DAY</p>
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
  const navigate = useNavigate();
  const lib = store.library;
  const topPages = lib.latestPages.slice(0, 3);
  const isEmpty = lib.latestPages.length === 0;

  if (isEmpty) {
    return (
      <section className="p-4 mb-4 text-center" style={{ ...mcPanel, borderTop: `3px solid ${MC.accent}` }}>
        <p style={mcSectionTitle}>{SECTION_ICONS.library} KNOWLEDGE LIBRARY</p>
        <p style={{ ...mcValue, fontSize: '14px', color: MC.gray }}>No published pages yet.</p>
        <p style={{ ...mcLabel, marginTop: 8 }}>Create your first knowledge asset.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/studio/ndxbook?tab=pages')}
          className="mt-3 px-4 py-2 text-[7px] font-futura border"
          style={{ fontWeight: 515, borderColor: MC.accent, color: MC.accent, background: 'rgba(99,102,241,0.06)' }}
        >
          CREATE PAGE 001 →
        </button>
      </section>
    );
  }

  return (
    <CollapsibleSection
      title="LIBRARY SNAPSHOT"
      icon={SECTION_ICONS.library}
      summary={
        <div className="space-y-1">
          {topPages.map((p) => (
            <p key={p.id} style={{ ...mcLabel, margin: 0 }}>
              {p.pageLabel.toUpperCase()} · {p.title.slice(0, 42)}{p.title.length > 42 ? '…' : ''}
            </p>
          ))}
        </div>
      }
    >
      {(
        [
          ['LATEST PAGES', lib.latestPages],
          ['RECENTLY UPDATED', lib.recentlyUpdated],
          ['MOST BOOKMARKED', lib.mostBookmarked],
          ['HIGHEST SHARED', lib.highestShared],
          ['HIGHEST RETENTION', lib.highestRetention],
        ] as const
      ).map(([label, pages]) => (
        <div key={label} className="mb-3">
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
    </CollapsibleSection>
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
  const org = useOrganizationContext();
  const [showOthers, setShowOthers] = useState(false);
  const [best, ...others] = store.intelligence;
  const publishedCount = readFounderPilotModeStore(org.organizationId).pagesPublished;

  if (!best) {
    return (
      <section className="p-4 mb-4" style={mcPanel}>
        <p style={mcSectionTitle}>{SECTION_ICONS.intelligence} STUDIO INTELLIGENCE</p>
        <p style={{ ...mcValue, fontSize: '16px', color: MC.black }}>Welcome to Studio Intelligence.</p>
        <p style={{ ...mcLabel, marginTop: 8, color: '#333' }}>
          You haven&apos;t published enough content yet for meaningful recommendations.
        </p>
        <p style={{ ...mcSectionTitle, marginTop: 14, fontSize: '8px' }}>PUBLISHING MILESTONES</p>
        <div className="space-y-2 mt-2">
          {INTELLIGENCE_MATURITY_TIERS.map((tier) => {
            const unlocked = publishedCount >= tier.postsRequired;
            return (
              <div
                key={tier.postsRequired}
                className="p-2 border"
                style={{
                  borderColor: unlocked ? MC.green : MC.panelBorder,
                  background: unlocked ? 'rgba(22,163,74,0.06)' : 'white',
                  opacity: unlocked ? 1 : 0.85,
                }}
              >
                <p style={{ ...mcLabel, color: unlocked ? MC.green : MC.gray, fontFamily: '"Futura PT Medium"' }}>
                  {tier.label} {unlocked ? '✓' : '—'}
                </p>
                <p style={mcLabel}>{tier.unlocks}</p>
              </div>
            );
          })}
        </div>
        <p style={{ ...mcLabel, marginTop: 10, color: MC.accent }}>STATUS · LEARNING</p>
      </section>
    );
  }

  return (
    <section className="p-4 mb-4" style={mcPanel}>
      <p style={mcSectionTitle}>{SECTION_ICONS.intelligence} STUDIO INTELLIGENCE</p>

      <div
        className="p-3 mb-3"
        style={{
          border: `2px solid ${MC.accent}`,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(255,255,255,0.95) 100%)',
        }}
      >
        <p style={{ ...mcLabel, color: MC.accent, letterSpacing: '0.1em' }}>TODAY&apos;S BEST MOVE</p>
        <p style={{ ...mcValue, fontSize: '18px', color: MC.black, margin: '6px 0' }}>
          {best.title.replace(/^Publish /i, 'Approve ').replace(/ at .+$/i, '')}
        </p>
        <MetricRow label="EXPECTED IMPACT" value={best.expectedImpact} accent />
        <MetricRow label="CONFIDENCE" value={`${best.confidencePct}%`} accent />
        <p style={{ ...mcLabel, marginTop: 8, color: '#333' }}>WHY · {best.why}</p>
        <p style={{ ...mcLabel, color: MC.red, marginTop: 4 }}>ACTION · {best.recommendedAction}</p>
      </div>

      <button
        type="button"
        onClick={() => setShowOthers((v) => !v)}
        className="w-full text-left py-2 px-2 border"
        style={{ borderColor: MC.panelBorder, background: 'white' }}
      >
        <span style={{ ...mcLabel, color: MC.accent }}>
          OTHER RECOMMENDATIONS ({others.length}) {showOthers ? '−' : '+'}
        </span>
      </button>

      {showOthers ? (
        <div className="space-y-2 mt-2">
          {others.map((rec) => (
            <div key={rec.id} className="p-2 border" style={{ borderColor: rec.category === 'risk' ? MC.red : MC.panelBorder }}>
              <p style={{ ...mcLabel, color: MC.accent, fontFamily: '"Futura PT Medium"' }}>{rec.category.toUpperCase()} · {rec.title}</p>
              <p style={mcLabel}>CONFIDENCE · {rec.confidencePct}% · {rec.expectedImpact}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function channelLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

export function RevenueCenterPanel({ store }: PanelProps) {
  const r = store.revenue;
  const [showChannels, setShowChannels] = useState(false);
  const channels = Object.entries(r.breakdown) as [string, number][];
  const topChannelLabel = channelLabel(r.topChannel);
  const isPilotEmpty = r.today === 0 && r.thisWeek === 0;

  if (isPilotEmpty) {
    return (
      <section className="p-4 mb-4" style={mcPanel}>
        <p style={mcSectionTitle}>{SECTION_ICONS.revenue} REVENUE SNAPSHOT</p>
        <MetricRow label="REVENUE TODAY" value="$0.00" />
        <MetricRow label="FORECAST" value="Unavailable" accent />
        <p style={{ ...mcLabel, marginTop: 8 }}>Publishing history required. Analytics unlock naturally as you publish.</p>
      </section>
    );
  }

  return (
    <CollapsibleSection
      title="REVENUE SNAPSHOT"
      icon={SECTION_ICONS.revenue}
      defaultOpen
      summary={
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p style={{ ...mcValue, fontSize: '16px', margin: 0 }}>{formatCurrency(r.today)}</p>
            <p style={mcLabel}>REVENUE TODAY</p>
          </div>
          <div>
            <p style={{ ...mcLabel, color: trendColor(r.changeVsYesterdayPct >= 0 ? 'up' : 'down'), margin: 0 }}>
              {r.changeVsYesterdayPct >= 0 ? '+' : ''}{r.changeVsYesterdayPct}% VS YESTERDAY
            </p>
            <p style={mcLabel}>TOP CHANNEL · {topChannelLabel.toUpperCase()}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-2 mb-3">
        <MetricRow label="REVENUE TODAY" value={formatCurrency(r.today)} accent />
        <MetricRow
          label="CHANGE VS YESTERDAY"
          value={`${r.changeVsYesterdayPct >= 0 ? '+' : ''}${r.changeVsYesterdayPct}% (${formatCurrency(r.yesterday)} yesterday)`}
        />
        <MetricRow label="TOP CHANNEL" value={`${topChannelLabel} · ${formatCurrency(r.breakdown[r.topChannel])}`} accent />
        <MetricRow label="PROJECTED END OF DAY" value={formatCurrency(r.projectedEndOfDay)} accent />
        <MetricRow label="THIS WEEK" value={formatCurrency(r.thisWeek)} />
        <MetricRow label="THIS MONTH" value={formatCurrency(r.thisMonth)} />
        <MetricRow label="FORECAST NEXT MONTH" value={`${formatCurrency(r.forecastNextMonth)} · ${r.forecastConfidencePct}% CONFIDENCE`} />
      </div>

      <button
        type="button"
        onClick={() => setShowChannels((v) => !v)}
        style={{ ...mcLabel, color: MC.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        CHANNEL BREAKDOWN {showChannels ? '−' : '+'}
      </button>
      {showChannels ? (
        <div className="mt-2 space-y-0.5">
          {channels.map(([ch, val]) => (
            <MetricRow key={ch} label={channelLabel(ch).toUpperCase()} value={formatCurrency(val)} />
          ))}
        </div>
      ) : null}
    </CollapsibleSection>
  );
}

export function LabsExperimentsPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  const active = store.experiments.filter((e) => e.status === 'active');

  if (store.experiments.length === 0) {
    return (
      <section className="p-4 mb-4" style={mcPanel}>
        <p style={mcSectionTitle}>{SECTION_ICONS.labs} STUDIO LABS</p>
        <p style={{ ...mcValue, fontSize: '14px', color: MC.gray }}>No active experiments.</p>
        <p style={{ ...mcLabel, marginTop: 8 }}>
          Publish at least five pieces of content to unlock experimentation.
        </p>
        <button type="button" className="text-[6px] underline mt-2" style={{ color: MC.accent }} onClick={() => navigate('/admin/studio/labs')}>
          OPEN STUDIO OS LABS →
        </button>
      </section>
    );
  }

  return (
    <CollapsibleSection
      title="LABS SNAPSHOT"
      icon={SECTION_ICONS.labs}
      summary={
        <p style={mcLabel}>
          {active.length} active experiments · leader {active[0]?.currentLeader ?? '—'} · tap for full board
        </p>
      }
    >
      {store.experiments.map((exp) => (
        <div key={exp.id} className="p-2 mb-1 border" style={{ borderColor: exp.status === 'active' ? MC.accent : MC.panelBorder }}>
          <p style={{ ...mcLabel, color: MC.accent, fontFamily: '"Futura PT Medium"' }}>{exp.name.toUpperCase()}</p>
          <p style={mcLabel}>WINNER · {exp.winner} · {exp.confidencePct}% CONF</p>
          <p style={mcLabel}>LEADER · {exp.currentLeader}</p>
        </div>
      ))}
      <button type="button" className="text-[6px] underline mt-2" style={{ color: MC.accent }} onClick={() => navigate('/admin/studio/labs')}>
        OPEN STUDIO OS LABS →
      </button>
    </CollapsibleSection>
  );
}

export function TalentBoardPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  const activeHosts = store.talentBoard.filter((h) => h.status !== 'available');

  return (
    <CollapsibleSection
      title="TALENT SNAPSHOT"
      icon={SECTION_ICONS.talent}
      summary={
        <p style={mcLabel}>
          {activeHosts.length} hosts active · {store.talentBoard.filter((h) => h.status === 'scheduled').length} scheduled · tap for full talent board
        </p>
      }
    >
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
        OPEN TALENT NETWORK →
      </button>
    </CollapsibleSection>
  );
}

const ACTION_ICONS: Record<string, string> = {
  'create-page': '＋',
  approve: '✓',
  publish: '▶',
  intelligence: '◎',
  experiment: '⚗',
  'knowledge-graph': '◈',
  talent: '◉',
  marketplace: '◆',
};

export function MissionActionsPanel({ store }: PanelProps) {
  const navigate = useNavigate();
  const commandActions = [
    { id: 'create-page', label: 'CREATE PAGE', route: '/admin/studio/ndxbook?tab=pages' },
    { id: 'approve', label: 'APPROVE PRODUCTION', route: '/admin/studio/ndxbook?tab=checklist' },
    { id: 'publish', label: 'PUBLISH', route: '/admin/studio/distribution-network?brand=ndxbook' },
    { id: 'intelligence', label: 'OPEN STUDIO INTELLIGENCE', route: '/admin/studio/studio-intelligence' },
    { id: 'experiment', label: 'LAUNCH EXPERIMENT', route: '/admin/studio/labs' },
    { id: 'knowledge-graph', label: 'OPEN KNOWLEDGE GRAPH', route: '/admin/studio/knowledge-hub' },
    { id: 'talent', label: 'OPEN TALENT NETWORK', route: '/admin/studio/talent-network' },
    { id: 'marketplace', label: 'OPEN MARKETPLACE', route: '/admin/studio/marketplace' },
  ];

  const extra = store.missionActions.filter(
    (a) => !commandActions.some((c) => c.route === a.route)
  );

  return (
    <section className="p-4 mb-4" style={mcPanel}>
      <p style={mcSectionTitle}>{SECTION_ICONS.actions} PRIMARY ACTIONS</p>
      <div className="grid grid-cols-1 gap-2">
        {commandActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.route)}
            className="p-3 text-left border transition-opacity hover:opacity-90"
            style={{
              borderColor: MC.accent,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, white 100%)',
            }}
          >
            <span style={{ fontSize: '14px', marginRight: 8 }}>{ACTION_ICONS[action.id] ?? '•'}</span>
            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: MC.black, letterSpacing: '0.06em' }}>
              {action.label}
            </span>
          </button>
        ))}
        {extra.slice(0, 2).map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.route)}
            className="p-2 text-left border"
            style={{ borderColor: MC.panelBorder, background: 'white' }}
          >
            <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '7px', color: MC.gray }}>{action.label}</span>
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
    <section className="p-4 mb-6" style={mcPanel}>
      <p style={mcSectionTitle}>
        {SECTION_ICONS.activity}
        <span style={mcLiveDot} />
        ACTIVITY WALL
      </p>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {sorted.map((ev, idx) => (
          <div
            key={ev.id}
            className="studio-activity-entry flex gap-2 py-1 border-b"
            style={{ borderColor: '#eee', animationDelay: `${Math.min(idx, 8) * 0.05}s` }}
          >
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

/** @deprecated Use HeadquartersIntro — kept for focused tab views if needed */
export function MissionControlHeader({ lastUpdatedAt }: { lastUpdatedAt: string }) {
  return <HeadquartersIntro lastUpdatedAt={lastUpdatedAt} formatDate={() => new Date().toLocaleDateString()} />;
}

export function FounderTimelinePanel() {
  const org = useOrganizationContext();
  const pilot = readFounderPilotModeStore(org.organizationId);

  if (!pilot.enabled) return null;

  return (
    <section className="p-4 mb-4" style={{ ...mcPanel, borderTop: `3px solid ${MC.accent}` }}>
      <p style={mcSectionTitle}>FOUNDER TIMELINE · PERMANENT HISTORY</p>
      <p style={{ ...mcLabel, marginBottom: 10 }}>
        Every milestone is earned — Studio OS remembers this organization&apos;s real story.
      </p>
      {pilot.milestones.length === 0 ? (
        <p style={mcLabel}>Your timeline begins now.</p>
      ) : (
        <div className="space-y-2">
          {pilot.milestones.map((m) => (
            <div key={`${m.id}-${m.recordedAt}`} className="p-2 border flex gap-2" style={{ borderColor: MC.panelBorder }}>
              <span style={{ fontSize: '10px', color: MC.accent }}>◆</span>
              <div>
                <p style={{ ...mcLabel, color: MC.black, fontFamily: '"Futura PT Medium"' }}>{m.label.toUpperCase()}</p>
                <p style={mcLabel}>{m.description}</p>
                <p style={{ ...mcLabel, fontSize: '5px' }}>
                  {new Date(m.recordedAt).toLocaleString()}
                  {m.pageNumber ? ` · PAGE ${String(m.pageNumber).padStart(3, '0')}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
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
