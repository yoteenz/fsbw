import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeMachineState } from '../../../../hooks/useTimeMachineState';
import {
  TIME_MACHINE_ACCENT,
  TIME_MACHINE_PHILOSOPHY,
  REPLAY_EVENT_TYPE_LABELS,
  queryTimeMachine,
  getCurrentReplayEvent,
  getFilteredEvents,
  selectReplayEvent,
  setPlaybackState,
  stepForward,
  stepBackward,
  jumpToStep,
  setTimelineFilter,
  compareMoments,
} from '../../../../studio-os-core/time-machine';
import type { ReplayEventType } from '../../../../studio-os-core/time-machine';
import {
  adminStudioExecutiveTrustDashboardPath,
  adminStudioExecutiveTimelinePath,
  adminStudioPredictiveQaPath,
} from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type TimeMachineTab = 'overview' | 'replay' | 'events' | 'compare';

const TABS: { id: TimeMachineTab; label: string }[] = [
  { id: 'overview', label: 'TIME MACHINE OVERVIEW' },
  { id: 'replay', label: 'REPLAY' },
  { id: 'events', label: 'EVENT LIBRARY' },
  { id: 'compare', label: 'COMPARE MOMENTS' },
];

export function TimeMachineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TimeMachineTab>('overview');
  const [searchQuery, setSearchQuery] = useState('automation');
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const { profile, refresh } = useTimeMachineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        TIME MACHINE™ LOADING — RECONSTRUCTING ORGANIZATIONAL EVENTS
      </p>
    );
  }

  const currentEvent = getCurrentReplayEvent(profile);
  const currentStep = currentEvent?.steps[profile.currentStepIndex] ?? null;
  const filteredEvents = getFilteredEvents(profile);
  const searchHits = queryTimeMachine(searchQuery, profile, 8);

  const handleSelectEvent = (id: string) => {
    selectReplayEvent(profile.organizationId, id);
    refresh();
    setTab('replay');
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 148 · TIME MACHINE™ · ORGANIZATIONAL REPLAY ENGINE"
        title={profile.companyName.toUpperCase()}
        subtitle="Replay any workflow, automation, AI recommendation, or event exactly as it occurred — understand WHY, not just what."
        progressPct={profile.replayScore}
        stats={[
          { label: 'REPLAYABLE', value: `${profile.totalReplayableEvents}` },
          { label: 'LAYERS', value: '11' },
          { label: 'STATE', value: profile.playbackState.toUpperCase() },
          { label: 'STEP', value: currentEvent ? `${profile.currentStepIndex + 1}/${currentEvent.stepCount}` : '—' },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.replayScore} size={56} label="TM" accent={TIME_MACHINE_ACCENT} />
        <div>
          {TIME_MACHINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="EXPERIENCE IT EXACTLY AS IT OCCURRED">
        <p className="text-[6px] font-futura" style={{ color: TIME_MACHINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockTimeMachineLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="11 RECONSTRUCTION LAYERS PER EVENT">
        {currentEvent?.reconstructedLayers.slice(0, 6).map((l) => (
          <p key={l.layer} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {l.label}: {l.snapshot.slice(0, 60)}…
          </p>
        )) ?? null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => currentEvent && handleSelectEvent(currentEvent.id)} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: TIME_MACHINE_ACCENT, color: TIME_MACHINE_ACCENT }}>
        START REPLAY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExecutiveTimelinePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXECUTIVE TIMELINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExecutiveTrustDashboardPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        TRUST DASHBOARD →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPredictiveQaPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PREDICTIVE QA →
      </button>
    </ExecutivePageShell>
  );

  const renderReplay = () => {
    if (!currentEvent) return null;
    const c = currentEvent.commentary;
    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={`REPLAY · ${currentEvent.title.toUpperCase()}`}>
          <div className="flex flex-wrap gap-1 mb-3">
            <button type="button" onClick={() => { setPlaybackState(profile.organizationId, 'playing'); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: TIME_MACHINE_ACCENT, color: TIME_MACHINE_ACCENT }}>▶ PLAY</button>
            <button type="button" onClick={() => { setPlaybackState(profile.organizationId, 'paused'); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>⏸ PAUSE</button>
            <button type="button" onClick={() => { stepForward(profile.organizationId); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>STEP →</button>
            <button type="button" onClick={() => { stepBackward(profile.organizationId); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>← STEP</button>
            <button type="button" onClick={() => { jumpToStep(profile.organizationId, 0); refresh(); }} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>JUMP START</button>
          </div>
          {currentStep ? (
            <ExecutiveSecondaryCard title={`STEP ${currentStep.stepIndex + 1} · ${currentStep.label}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: TIME_MACHINE_ACCENT, fontWeight: 515 }}>
                {currentStep.actor} · {currentStep.action} · {new Date(currentStep.timestamp).toLocaleTimeString()}
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {currentStep.detail}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Layers: {currentStep.layerHighlights.join(' · ')}
              </p>
            </ExecutiveSecondaryCard>
          ) : null}
        </ExecutiveFocusPanel>
        <ExecutiveFocusPanel title="STUDIO INTELLIGENCE™ COMMENTARY">
          <ExecutiveSecondaryCard title="WHAT HAPPENED">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>{c.whatHappened}</p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="WHY IT HAPPENED">
            <p className="text-[6px] font-futura" style={{ color: TIME_MACHINE_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>{c.whyItHappened}</p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="ALTERNATIVE OUTCOMES">
            {c.alternativeOutcomes.map((alt) => (
              <p key={alt} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>· {alt}</p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RECOMMENDED IMPROVEMENTS">
            {c.recommendedImprovements.map((imp) => (
              <p key={imp} className="text-[6px] font-futura mb-1" style={{ color: '#10B981' }}>→ {imp}</p>
            ))}
          </ExecutiveSecondaryCard>
        </ExecutiveFocusPanel>
        <ExecutiveFocusPanel title="FULL RECONSTRUCTION">
          {currentEvent.reconstructedLayers.map((l) => (
            <ExecutiveSecondaryCard key={l.layer} title={l.label.toUpperCase()}>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>{l.snapshot}</p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderEvents = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="FILTER TIMELINE">
        <select
          className="w-full px-2 py-1 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          value={profile.activeFilter.eventType}
          onChange={(e) => {
            setTimelineFilter(profile.organizationId, { eventType: e.target.value as ReplayEventType | 'all' });
            refresh();
          }}
        >
          <option value="all">ALL EVENT TYPES</option>
          {Object.entries(REPLAY_EVENT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.toUpperCase()}</option>
          ))}
        </select>
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title={`EVENT LIBRARY · ${filteredEvents.length} EVENTS`}>
        {filteredEvents.map((e) => (
          <ExecutiveSecondaryCard key={e.id} title={e.title.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: TIME_MACHINE_ACCENT, fontWeight: 515 }}>
              {e.eventLabel} · {e.stepCount} steps · {e.durationMinutes} min · {new Date(e.occurredAt).toLocaleDateString()}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>{e.commentary.whatHappened.slice(0, 100)}…</p>
            <button type="button" onClick={() => handleSelectEvent(e.id)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: TIME_MACHINE_ACCENT, color: TIME_MACHINE_ACCENT }}>
              REPLAY →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCompare = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="COMPARE TWO MOMENTS">
        <select className="w-full px-2 py-1 text-[7px] font-futura border mb-1" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }} value={compareA} onChange={(e) => setCompareA(e.target.value)}>
          <option value="">SELECT MOMENT A</option>
          {profile.replayEvents.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <select className="w-full px-2 py-1 text-[7px] font-futura border mb-2" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }} value={compareB} onChange={(e) => setCompareB(e.target.value)}>
          <option value="">SELECT MOMENT B</option>
          {profile.replayEvents.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <button type="button" onClick={() => { if (compareA && compareB) { compareMoments(profile.organizationId, compareA, compareB); refresh(); } }} className="px-2 py-1 text-[6px] font-futura uppercase border mb-3" style={{ borderColor: TIME_MACHINE_ACCENT, color: TIME_MACHINE_ACCENT }}>
          COMPARE →
        </button>
        {profile.momentComparison ? (
          <ExecutiveSecondaryCard title="COMPARISON RESULT">
            <p className="text-[6px] font-futura mb-1" style={{ color: TIME_MACHINE_ACCENT, fontWeight: 515 }}>A: {profile.momentComparison.momentA.label}</p>
            <p className="text-[6px] font-futura mb-1" style={{ color: TIME_MACHINE_ACCENT, fontWeight: 515 }}>B: {profile.momentComparison.momentB.label}</p>
            {profile.momentComparison.differences.map((d) => (
              <p key={d} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>· {d}</p>
            ))}
          </ExecutiveSecondaryCard>
        ) : null}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="time-machine" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: tab === t.id ? TIME_MACHINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder, color: tab === t.id ? TIME_MACHINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: tab === t.id ? 515 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? renderOverview() : null}
      {tab === 'replay' ? renderReplay() : null}
      {tab === 'events' ? renderEvents() : null}
      {tab === 'compare' ? renderCompare() : null}
      <div className="mt-3">
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events…" className="w-full px-2 py-1 text-[7px] font-futura border mb-2" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'transparent', color: ADMIN_STUDIO_THEME.textPrimary }} />
        {searchHits.map((h) => (
          <p key={h.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ color: TIME_MACHINE_ACCENT }}>{h.label}</span> · {h.matchReason}
          </p>
        ))}
      </div>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC TIME MACHINE
      </button>
    </div>
  );
}
