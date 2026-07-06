import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExecutiveTimelineHistoryState } from '../../../../hooks/useExecutiveTimelineHistoryState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  EXECUTIVE_HISTORY_ACCENT,
  HISTORY_DEPARTMENT_LABELS,
  HISTORY_DEPARTMENTS,
  HISTORY_EVENT_LABELS,
  HISTORY_EVENT_TYPES,
  HISTORY_PHILOSOPHY,
  filterExecutiveHistoryEvents,
  getMilestoneEvents,
} from '../../../../studio-os-core/executive-timeline';
import { adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type HistoryTab = 'overview' | 'timeline' | 'insights' | 'filters';

const TABS: { id: HistoryTab; label: string }[] = [
  { id: 'overview', label: 'HISTORY OVERVIEW' },
  { id: 'timeline', label: 'EXECUTIVE TIMELINE' },
  { id: 'insights', label: 'INTELLIGENT INSIGHTS' },
  { id: 'filters', label: 'EXPLORE & REPLAY' },
];

type Props = {
  tab: HistoryTab;
  onTabChange: (tab: HistoryTab) => void;
};

export function ExecutiveTimelineHistoryWorkspace({ tab, onTabChange }: Props) {
  const navigate = useNavigate();
  const {
    profile,
    filters,
    selectedYear,
    replayActive,
    replayIndex,
    refresh,
    updateFilter,
    setSelectedYear,
    startReplay,
    stopReplay,
    advanceReplay,
  } = useExecutiveTimelineHistoryState();

  const filteredEvents = useMemo(() => {
    if (!profile) return [];
    return filterExecutiveHistoryEvents(profile.events, filters);
  }, [profile, filters]);

  const yearEvents = useMemo(() => {
    if (!profile || selectedYear == null) return filteredEvents;
    return filteredEvents.filter((e) => e.year === selectedYear);
  }, [profile, selectedYear, filteredEvents]);

  const replayYear = profile?.yearSnapshots[replayIndex];

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXECUTIVE TIMELINE™ LOADING — PRESERVING ORGANIZATIONAL HISTORY
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 116 · EXECUTIVE TIMELINE™"
        title={profile.companyName.toUpperCase()}
        subtitle="Permanent visual history — understand not only where you are, but how you arrived there."
        progressPct={profile.historyDepthScore}
        stats={[
          { label: 'HISTORY DEPTH', value: `${profile.historyDepthScore}%` },
          { label: 'EVENTS', value: String(profile.totalEvents) },
          { label: 'YEARS', value: String(profile.yearsSpan) },
          { label: 'INSIGHTS', value: String(profile.timelineInsights.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.historyDepthScore} size={56} label="HISTORY" accent={EXECUTIVE_HISTORY_ACCENT} />
        <div>
          {HISTORY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      {profile.anniversaryContext ? (
        <ExecutiveSecondaryCard title="HISTORICAL CONTEXT">
          <p className="text-[6px] font-futura" style={{ color: EXECUTIVE_HISTORY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
            {profile.anniversaryContext}
          </p>
        </ExecutiveSecondaryCard>
      ) : null}
      <ExecutiveSecondaryCard title="PERMANENT EXECUTIVE HISTORY">
        <p className="text-[6px] font-futura" style={{ color: EXECUTIVE_HISTORY_ACCENT }}>
          {profile.dockHistoryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: EXECUTIVE_HISTORY_ACCENT, color: EXECUTIVE_HISTORY_ACCENT }}
      >
        MISSION CONTROL →
      </button>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH HISTORY
      </button>
    </ExecutivePageShell>
  );

  const renderTimeline = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SCROLL THROUGH YEARS · PERMANENT ORGANIZATIONAL HISTORY">
        <div className="flex flex-wrap gap-1 mb-3">
          {profile.yearSnapshots.map((snap) => (
            <button
              key={snap.year}
              type="button"
              onClick={() => setSelectedYear(snap.year)}
              className="px-2 py-1 text-[6px] font-futura uppercase border"
              style={{
                borderColor: selectedYear === snap.year ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                color: selectedYear === snap.year ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              }}
            >
              {snap.year} · {snap.eventCount}
            </button>
          ))}
        </div>
        {yearEvents.map((event) => (
          <ExecutiveSecondaryCard key={event.id} title={`${event.year} · ${HISTORY_EVENT_LABELS[event.type].toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXECUTIVE_HISTORY_ACCENT, fontWeight: 515 }}>
              {event.title}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
              {event.summary}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {HISTORY_DEPARTMENT_LABELS[event.department].toUpperCase()} · {event.sourceModule}
              {event.archivedHeadquarters ? ' · ARCHIVED HQ' : ''}
              {event.historicalDashboardAvailable ? ' · HISTORICAL DASHBOARD' : ''}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderInsights = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="INTELLIGENT INSIGHTS · HISTORY AS ACTIONABLE INTELLIGENCE">
        {profile.timelineInsights.map((insight) => (
          <ExecutiveSecondaryCard key={insight.id} title={insight.headline.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXECUTIVE_HISTORY_ACCENT, lineHeight: 1.5 }}>
              {insight.narrative}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {insight.confidencePct}% confidence · {insight.relatedEventIds.length} related events
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFilters = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FILTER · REPLAY · COMPARE ORGANIZATIONAL GROWTH">
        <ExecutiveSecondaryCard title="FILTERS">
          <div className="flex flex-wrap gap-1 mb-2">
            {(['all', ...HISTORY_DEPARTMENTS] as const).map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => updateFilter({ department: dept === 'all' ? 'all' : dept })}
                className="px-2 py-1 text-[6px] font-futura uppercase border"
                style={{
                  borderColor: filters.department === dept ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                  color: filters.department === dept ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
                }}
              >
                {dept === 'all' ? 'ALL DEPTS' : HISTORY_DEPARTMENT_LABELS[dept].toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {(['all', ...HISTORY_EVENT_TYPES.slice(0, 6)] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateFilter({ eventType: type === 'all' ? 'all' : type })}
                className="px-2 py-1 text-[6px] font-futura uppercase border"
                style={{
                  borderColor: filters.eventType === type ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                  color: filters.eventType === type ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
                }}
              >
                {type === 'all' ? 'ALL EVENTS' : HISTORY_EVENT_LABELS[type].slice(0, 12).toUpperCase()}
              </button>
            ))}
          </div>
        </ExecutiveSecondaryCard>

        <ExecutiveSecondaryCard title="JUMP TO MILESTONES">
          {getMilestoneEvents(profile.events)
            .slice(0, 5)
            .map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedYear(m.year);
                  onTabChange('timeline');
                }}
                className="block w-full text-left mb-2 px-2 py-1 border text-[6px] font-futura"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: EXECUTIVE_HISTORY_ACCENT }}
              >
                {m.year} · {m.title}
              </button>
            ))}
        </ExecutiveSecondaryCard>

        <ExecutiveSecondaryCard title="REPLAY ORGANIZATIONAL HISTORY">
          {replayActive && replayYear ? (
            <>
              <p className="text-[6px] font-futura mb-2" style={{ color: EXECUTIVE_HISTORY_ACCENT }}>
                REPLAYING {replayYear.year} — {replayYear.headline}
              </p>
              <button type="button" onClick={advanceReplay} className="mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: EXECUTIVE_HISTORY_ACCENT, color: EXECUTIVE_HISTORY_ACCENT }}>
                NEXT YEAR →
              </button>
              <button type="button" onClick={stopReplay} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                STOP REPLAY
              </button>
            </>
          ) : (
            <button type="button" onClick={startReplay} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: EXECUTIVE_HISTORY_ACCENT, color: EXECUTIVE_HISTORY_ACCENT }}>
              START HISTORY REPLAY
            </button>
          )}
        </ExecutiveSecondaryCard>

        <ExecutiveSecondaryCard title="GROWTH COMPARISON ACROSS TIME">
          {profile.growthComparison.map((point) => (
            <p key={point.year} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {point.year}: {point.eventsRecorded} events · knowledge {point.knowledgeScore}% · health {point.healthScore}% · revenue index {point.revenueIndex}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="executive-timeline" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? EXECUTIVE_HISTORY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'timeline' && renderTimeline()}
      {tab === 'insights' && renderInsights()}
      {tab === 'filters' && renderFilters()}
    </div>
  );
}

export type { HistoryTab };
