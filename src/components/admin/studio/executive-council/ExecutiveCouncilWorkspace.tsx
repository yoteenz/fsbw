import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExecutiveCouncilState } from '../../../../hooks/useExecutiveCouncilState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  EXECUTIVE_COUNCIL_V2_PHILOSOPHY,
} from '../../../../studio-os-core/executive-council';
import { adminStudioMemoryEnginePath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type CouncilTab = 'overview' | 'executives' | 'meeting' | 'briefing' | 'history';

const TABS: { id: CouncilTab; label: string }[] = [
  { id: 'overview', label: 'COUNCIL OVERVIEW' },
  { id: 'executives', label: 'DIGITAL EXECUTIVES' },
  { id: 'meeting', label: 'COLLABORATIVE MEETING' },
  { id: 'briefing', label: 'EXECUTIVE BRIEFING' },
  { id: 'history', label: 'DECISION HISTORY' },
];

function stanceColor(stance: string): string {
  if (stance === 'support') return '#16A34A';
  if (stance === 'caution') return '#CA8A04';
  if (stance === 'oppose') return ADMIN_STUDIO_THEME.accent;
  return ADMIN_STUDIO_THEME.textSecondary;
}

export function ExecutiveCouncilWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<CouncilTab>('overview');
  const {
    profile,
    refresh,
    meetingQuery,
    setMeetingQuery,
    meetingLoading,
    runCouncilMeeting,
    resolveDecision,
  } = useExecutiveCouncilState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXECUTIVE COUNCIL™ LOADING — ASSEMBLING DIGITAL EXECUTIVE LEADERSHIP
      </p>
    );
  }

  const briefing = profile.latestBriefing;

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 99 · EXECUTIVE COUNCIL V2.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Many minds. One briefing. — never isolated AI responses for major decisions."
        progressPct={profile.councilHealthPct}
        stats={[
          { label: 'EXECUTIVES', value: String(profile.activeExecutives) },
          { label: 'MEETINGS', value: String(profile.meetingsHeld) },
          { label: 'PENDING', value: String(profile.pendingDecisions) },
          { label: 'HEALTH', value: `${profile.councilHealthPct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.councilHealthPct} size={56} label="COUNCIL" accent="#B45309" />
        <div>
          {EXECUTIVE_COUNCIL_V2_PHILOSOPHY.slice(0, 3).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="CHIEF CONCIERGE · UNIFIED SYNTHESIS">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          When founders ask strategic questions, multiple Digital Executives contribute — Chief Concierge delivers one executive briefing.
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: '#B45309', color: '#B45309' }}
      >
        REFRESH COUNCIL
      </button>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        MISSION CONTROL →
      </button>
    </ExecutivePageShell>
  );

  const renderExecutives = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`DIGITAL EXECUTIVES · ${profile.digitalExecutives.length} TOTAL · CORE + DEPARTMENT PACKS`}>
        {profile.digitalExecutives.map((exec) => (
          <div key={exec.id} className="flex items-start gap-2 mb-2 pb-2 border-b" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <ExecutiveHealthRing value={exec.active ? 88 : 40} size={28} accent={exec.source === 'department-pack' ? '#6366F1' : '#B45309'} />
            <div>
              <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#B45309' }}>
                {exec.title} · {exec.source.replace(/-/g, ' ').toUpperCase()}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {exec.department} · {exec.focus}
              </p>
            </div>
          </div>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderMeeting = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONVENE EXECUTIVE COUNCIL MEETING">
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Ask a strategic question — Marketing, Finance, Operations, Customer Experience, Strategy, and pack executives collaborate before Chief Concierge synthesizes.
        </p>
        <textarea
          value={meetingQuery}
          onChange={(e) => setMeetingQuery(e.target.value)}
          rows={3}
          className="w-full mb-2 p-2 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
          placeholder="We need to increase revenue."
        />
        <button
          type="button"
          disabled={meetingLoading}
          onClick={() => {
            runCouncilMeeting();
            setTab('briefing');
          }}
          className="px-2 py-1 text-[6px] font-futura uppercase border"
          style={{ borderColor: '#B45309', color: '#B45309', opacity: meetingLoading ? 0.6 : 1 }}
        >
          {meetingLoading ? 'COUNCIL IN SESSION…' : 'CONVENE COUNCIL MEETING'}
        </button>
      </ExecutiveFocusPanel>
      {briefing?.contributions.map((c) => (
        <ExecutiveSecondaryCard key={c.id} title={`${c.executiveName.toUpperCase()} · ${c.stance.toUpperCase()}`}>
          <p className="text-[6px] font-futura mb-1" style={{ color: stanceColor(c.stance) }}>
            CONFIDENCE {c.confidencePct}%
          </p>
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            {c.analysis}
          </p>
        </ExecutiveSecondaryCard>
      ))}
    </ExecutivePageShell>
  );

  const renderBriefing = () => (
    <ExecutivePageShell>
      {!briefing ? (
        <ExecutiveSecondaryCard title="NO BRIEFING YET">
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Convene a collaborative meeting to generate an executive briefing with summary, recommendations, risks, and action plan.
          </p>
        </ExecutiveSecondaryCard>
      ) : (
        <>
          <ExecutiveHeroCard
            eyebrow="CHIEF CONCIERGE · EXECUTIVE BRIEFING"
            title={briefing.query.slice(0, 60).toUpperCase()}
            subtitle={briefing.chiefConciergeSummary}
            progressPct={Math.round(
              briefing.confidenceLevels.reduce((s, c) => s + c.confidencePct, 0) /
                Math.max(briefing.confidenceLevels.length, 1)
            )}
            stats={[
              { label: 'EXECUTIVES', value: String(briefing.participants.length) },
              { label: 'RISKS', value: String(briefing.risks.length) },
              { label: 'ACTIONS', value: String(briefing.actionPlan.length) },
              { label: 'DEPTS', value: String(briefing.departmentsAffected.length) },
            ]}
          />
          <ExecutiveSecondaryCard title="SUMMARY">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>{briefing.summary}</p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RECOMMENDATIONS">
            {briefing.recommendations.map((r) => (
              <p key={r} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>· {r}</p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RISKS · TRADE-OFFS">
            {briefing.risks.map((r) => (
              <p key={r} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>· {r}</p>
            ))}
            {briefing.tradeoffs.map((t) => (
              <p key={t} className="text-[6px] font-futura mb-1" style={{ color: '#CA8A04' }}>↔ {t}</p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="EXPECTED OUTCOMES · ACTION PLAN">
            {briefing.expectedOutcomes.map((o) => (
              <p key={o} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>→ {o}</p>
            ))}
            {briefing.actionPlan.map((a) => (
              <p key={a} className="text-[6px] font-futura mb-1" style={{ color: '#B45309' }}>▸ {a}</p>
            ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="CONFIDENCE LEVELS">
            {briefing.confidenceLevels.map((c) => (
              <p key={c.area} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {c.area}: {c.confidencePct}%
              </p>
            ))}
          </ExecutiveSecondaryCard>
        </>
      )}
    </ExecutivePageShell>
  );

  const renderHistory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`DECISION HISTORY · ${profile.decisionHistory.length} RECORDS · FEEDS MEMORY ENGINE`}>
        {profile.decisionHistory.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Every Executive Council decision is stored with reasoning, participants, and lessons learned.
          </p>
        ) : (
          profile.decisionHistory.map((d) => (
            <ExecutiveSecondaryCard key={d.id} title={`${d.query.slice(0, 50).toUpperCase()} · ${d.outcome.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {d.reasoning.slice(0, 140)}…
              </p>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Participants: {d.participants.join(', ')}
              </p>
              {d.lessonsLearned.slice(0, 2).map((l) => (
                <p key={l} className="text-[6px] font-futura mb-1" style={{ color: '#B45309' }}>Lesson: {l}</p>
              ))}
              {d.outcome === 'pending' && (
                <div className="mt-1 flex gap-1 flex-wrap">
                  {(['approved', 'declined', 'deferred'] as const).map((outcome) => (
                    <button
                      key={outcome}
                      type="button"
                      onClick={() => resolveDecision(d.id, outcome)}
                      className="px-1 py-0.5 text-[5px] font-futura uppercase border"
                      style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
                    >
                      {outcome}
                    </button>
                  ))}
                </div>
              )}
            </ExecutiveSecondaryCard>
          ))
        )}
      </ExecutiveFocusPanel>
      <button
        type="button"
        onClick={() => navigate(adminStudioMemoryEnginePath())}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        MEMORY ENGINE →
      </button>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'executives':
        return renderExecutives();
      case 'meeting':
        return renderMeeting();
      case 'briefing':
        return renderBriefing();
      case 'history':
        return renderHistory();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="executive-council-root">
      <StudioOsBrandTagline systemId="executive-council" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#B45309' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#B45309' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(180,83,9,0.06)' : 'white',
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
