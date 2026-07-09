import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ER_MEETING_STAGE_LABELS,
  type ErMeetingStage,
} from '../../../../studio-os-core/genesis';
import { useEvolutionRoomState } from '../../../../hooks/useEvolutionRoomState';
import { HQ, hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/evolution-room';

const ROOM_NAV: { slug: string; label: string }[] = [
  { slug: 'evolution-room', label: 'Evolution Room™' },
  { slug: 'executive-review', label: 'Executive Review' },
  { slug: 'evolution-brief', label: 'Evolution Brief™' },
  { slug: 'monthly-review', label: 'Monthly Review' },
  { slug: 'genesis-proposals', label: 'Genesis Proposals' },
  { slug: 'evolution-council', label: 'Evolution Council™' },
  { slug: 'future-wall', label: 'Future Wall™' },
  { slug: 'legacy-wall', label: 'Legacy Wall™' },
];

function stageIndex(stage: ErMeetingStage): number {
  const stages = Object.keys(ER_MEETING_STAGE_LABELS) as ErMeetingStage[];
  return stages.indexOf(stage);
}

/**
 * The Evolution Room™ — immersive executive strategy session.
 * Orb Presentation Mode™ · holographic panels · ceremonial meeting flow.
 */
export function EvolutionRoomWorkspace() {
  const navigate = useNavigate();
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const {
    view,
    advanceStage,
    acceptCouncilItem,
    deferCouncilItem,
    recordDecision,
    summarizeSession,
    archiveSession,
    refresh,
  } = useEvolutionRoomState();

  const session = view.activeSession;
  const currentStage = session?.currentStage ?? 'arrival';
  const stageProgress = useMemo(() => {
    const total = view.meetingStages.length;
    const idx = stageIndex(currentStage);
    return Math.round(((idx + 1) / total) * 100);
  }, [currentStage, view.meetingStages.length]);

  const activeSlug = roomSlug ?? 'evolution-room';

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{
        background:
          'linear-gradient(165deg, #f8f6f3 0%, #efeae4 35%, #f5f2ee 70%, #faf8f5 100%)',
      }}
    >
      <HqExperienceStyles />
      <style>{`
        @keyframes er-orb-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(235,28,36,0.15), 0 0 80px rgba(99,102,241,0.08); }
          50% { box-shadow: 0 0 60px rgba(235,28,36,0.25), 0 0 100px rgba(99,102,241,0.12); }
        }
        @keyframes er-holo-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .er-orb-core {
          animation: er-orb-pulse 5s ease-in-out infinite;
        }
        .er-holo-panel {
          background: linear-gradient(105deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.88) 100%);
          background-size: 200% 100%;
          animation: er-holo-shimmer 12s linear infinite;
        }
        .er-timeline-glow {
          box-shadow: inset 0 0 24px rgba(235,28,36,0.06);
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url('/assets/marble-half.png')",
          backgroundSize: '480px',
        }}
        aria-hidden
      />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3" style={hqGlassPanel}>
        <div>
          <p style={{ ...hqLabel, color: HQ.red, margin: 0 }}>THE EVOLUTION ROOM™</p>
          <p
            style={{
              fontFamily: '"Covered By Your Grace", sans-serif',
              fontSize: '18px',
              margin: '4px 0 0',
              color: HQ.black,
            }}
          >
            {view.stats.currentMonthLabel} Strategy Session
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/studio/live-validation-system')}
            className="rounded border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] uppercase tracking-wider"
          >
            Live Validation →
          </button>
            <button
              type="button"
              onClick={() => navigate('/admin/studio/executive-reflection')}
              className="rounded-lg border border-amber-500/30 px-4 py-2 text-sm text-amber-200/90 hover:bg-amber-500/10"
            >
              Reflection Suite™ →
            </button>
            <button
              type="button"
              onClick={refresh}
            className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-red-700"
          >
            Refresh Brief
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px] flex-col gap-4 p-4 lg:flex-row">
        {/* Room navigation — east/west walls metaphor */}
        <nav className="lg:w-52 shrink-0 space-y-1" aria-label="Evolution Room destinations">
          {ROOM_NAV.map((room) => (
            <Link
              key={room.slug}
              to={`${BASE}/${room.slug}`}
              className="block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
              style={{
                ...(activeSlug === room.slug
                  ? { background: 'rgba(255,255,255,0.85)', borderLeft: `2px solid ${HQ.red}` }
                  : { background: 'rgba(255,255,255,0.45)' }),
                fontFamily: '"Futura PT Medium"',
                color: activeSlug === room.slug ? HQ.black : HQ.gray,
              }}
            >
              {room.label}
            </Link>
          ))}
        </nav>

        {/* Central executive table — Orb Presentation Mode™ */}
        <main className="flex flex-1 flex-col gap-4">
          {(activeSlug === 'evolution-room' || activeSlug === 'executive-review') && (
            <OrbPresentationPanel
              stage={currentStage}
              stageProgress={stageProgress}
              greeting={view.brief?.orbGreeting}
              monthLabel={view.stats.currentMonthLabel}
              onAdvance={advanceStage}
              onSummarize={summarizeSession}
              onArchive={archiveSession}
              sessionOutputs={session?.outputs}
            />
          )}

          {activeSlug === 'evolution-brief' && view.brief && (
            <EvolutionBriefPanel brief={view.brief} />
          )}

          {activeSlug === 'monthly-review' && view.brief && (
            <MonthlyReviewPanel
              highlights={view.brief.sections.slice(0, 4)}
              founderTimeline={view.founderTimeline}
            />
          )}

          {activeSlug === 'genesis-proposals' && (
            <GenesisProposalPanel proposals={view.genesisProposalQueue} />
          )}

          {activeSlug === 'evolution-council' && (
            <EvolutionCouncilPanel
              agenda={view.councilAgenda}
              onAccept={acceptCouncilItem}
              onDefer={deferCouncilItem}
              onDecide={recordDecision}
            />
          )}

          {activeSlug === 'future-wall' && (
            <FutureWallPanel
              opportunities={view.futureOpportunities}
              automations={view.automationSuggestions}
              priorities={view.strategicPriorities}
            />
          )}

          {activeSlug === 'legacy-wall' && (
            <LegacyWallPanel timeline={view.legacyTimeline} archived={view.archivedSessions} />
          )}

          {/* Stats ribbon — contextual, not dashboard */}
          <StatsRibbon stats={view.stats} launchStack={view.launchStackProgress} />
        </main>
      </div>
    </div>
  );
}

function OrbPresentationPanel({
  stage,
  stageProgress,
  greeting,
  monthLabel,
  onAdvance,
  onSummarize,
  onArchive,
  sessionOutputs,
}: {
  stage: ErMeetingStage;
  stageProgress: number;
  greeting?: string;
  monthLabel: string;
  onAdvance: () => void;
  onSummarize: () => void;
  onArchive: () => void;
  sessionOutputs?: import('../../../../studio-os-core/genesis').ErSessionOutputs;
}) {
  const navigate = useNavigate();
  return (
    <section className="er-holo-panel rounded-2xl border border-white/80 p-6 er-timeline-glow">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="er-orb-core flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #fff 0%, rgba(235,28,36,0.12) 50%, rgba(99,102,241,0.15) 100%)',
            border: '1px solid rgba(255,255,255,0.9)',
          }}
        >
          <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', letterSpacing: '0.2em', color: HQ.red }}>
            ORB
          </span>
        </div>
        <p style={{ ...hqLabel, color: HQ.gray }}>{monthLabel} · Orb Presentation Mode™</p>
        <h2
          style={{
            fontFamily: '"Covered By Your Grace", sans-serif',
            fontSize: '22px',
            color: HQ.black,
            maxWidth: 520,
          }}
        >
          {ER_MEETING_STAGE_LABELS[stage]}
        </h2>
        {stage === 'orb-greeting' && greeting ? (
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '13px', color: HQ.gray, maxWidth: 560, lineHeight: 1.6 }}>
            {greeting}
          </p>
        ) : null}
        {sessionOutputs && stage === 'meeting-summary' ? (
          <div className="w-full max-w-xl text-left" style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: HQ.black }}>
            <p className="mb-2 font-medium uppercase tracking-wider text-red-600">Executive Summary™</p>
            <p>{sessionOutputs.executiveSummary}</p>
            <p className="mt-4 mb-2 font-medium uppercase tracking-wider text-red-600">Action Items™</p>
            <ul className="list-disc pl-5">
              {sessionOutputs.actionItems.slice(0, 5).map((a) => (
                <li key={a.actionId}>{a.title}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-2 h-1 w-full max-w-md overflow-hidden rounded-full bg-black/5">
          <div className="h-full bg-red-500/60 transition-all" style={{ width: `${stageProgress}%` }} />
        </div>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button type="button" onClick={onAdvance} className="action-btn primary">
            Continue Session →
          </button>
          {stage === 'founder-decisions' && (
            <button type="button" onClick={onSummarize} className="action-btn">
              Generate Summary
            </button>
          )}
          {stage === 'archive-session' && (
            <button type="button" onClick={onArchive} className="action-btn primary">
              Seal Archive
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`${BASE}/evolution-brief`)}
            className="action-btn"
          >
            View Brief
          </button>
        </div>
      </div>
      <style>{`
        .action-btn {
          font-family: "Futura PT Medium";
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 8px 14px;
          border-radius: 6px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.7);
          cursor: pointer;
        }
        .action-btn.primary {
          border-color: rgba(235,28,36,0.3);
          background: rgba(235,28,36,0.08);
          color: #EB1C24;
        }
      `}</style>
    </section>
  );
}

function EvolutionBriefPanel({
  brief,
}: {
  brief: import('../../../../studio-os-core/genesis').ErExecutiveEvolutionBrief;
}) {
  return (
    <section className="er-holo-panel space-y-4 rounded-2xl border border-white/80 p-6">
      <header>
        <p style={hqLabel}>Executive Evolution Brief™</p>
        <h2 style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '20px' }}>{brief.monthLabel}</h2>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: HQ.gray, marginTop: 8 }}>{brief.executiveSummary}</p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {brief.sections.map((section) => (
          <article key={section.sectionId} className="rounded-xl border border-black/5 bg-white/50 p-4">
            <p style={{ ...hqLabel, color: HQ.red }}>{section.title}</p>
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', marginTop: 6 }}>{section.headline}</p>
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: HQ.gray, marginTop: 8 }}>{section.interpretation}</p>
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', marginTop: 8 }}>{section.recommendation}</p>
            {section.founderDecisionNeeded && (
              <span className="mt-2 inline-block rounded bg-red-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-red-700">
                Founder decision needed
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function MonthlyReviewPanel({
  highlights,
  founderTimeline,
}: {
  highlights: import('../../../../studio-os-core/genesis').ErBriefSection[];
  founderTimeline: import('../../../../studio-os-core/genesis').ErFounderTimelineEntry[];
}) {
  return (
    <section className="er-holo-panel space-y-4 rounded-2xl border border-white/80 p-6">
      <p style={hqLabel}>Monthly Review · Founder Timeline™</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', marginBottom: 8 }}>Monthly Highlights</h3>
          <ul className="space-y-2">
            {highlights.map((h) => (
              <li key={h.sectionId} className="rounded-lg bg-white/50 p-3 text-[11px]">
                <strong>{h.title}</strong> — {h.headline}
              </li>
            ))}
          </ul>
        </div>
        <div className="er-timeline-glow rounded-xl border border-black/5 p-4">
          <h3 style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px', marginBottom: 8 }}>Founder Timeline™</h3>
          <ol className="space-y-3 border-l-2 border-red-500/20 pl-4">
            {founderTimeline.slice(0, 8).map((e) => (
              <li key={e.entryId} className="relative text-[11px]">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-red-500/50" />
                <time style={{ color: HQ.gray, fontSize: '9px' }}>{new Date(e.date).toLocaleDateString()}</time>
                <p style={{ fontFamily: '"Futura PT Medium"' }}>{e.title}</p>
                <p style={{ color: HQ.gray }}>{e.summary}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function GenesisProposalPanel({
  proposals,
}: {
  proposals: ReturnType<typeof useEvolutionRoomState>['view']['genesisProposalQueue'];
}) {
  return (
    <section className="er-holo-panel space-y-3 rounded-2xl border border-white/80 p-6">
      <p style={hqLabel}>Genesis Proposal Queue™</p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: HQ.gray }}>
        Nothing becomes canon automatically. Review evidence before accepting.
      </p>
      {proposals.length === 0 ? (
        <p style={{ fontSize: '12px', color: HQ.gray }}>No proposals queued.</p>
      ) : (
        proposals.map((p) => (
          <article key={p.proposalId} className="rounded-xl border border-black/5 bg-white/50 p-4">
            <div className="flex justify-between gap-2">
              <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '12px' }}>{p.title}</p>
              <span className="text-[9px] uppercase tracking-wider text-gray-500">{p.status}</span>
            </div>
            <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 6 }}>{p.signalSummary}</p>
            <p style={{ fontSize: '10px', marginTop: 8 }}>{p.proposedGenesisChange}</p>
          </article>
        ))
      )}
    </section>
  );
}

function EvolutionCouncilPanel({
  agenda,
  onAccept,
  onDefer,
  onDecide,
}: {
  agenda: ReturnType<typeof useEvolutionRoomState>['view']['councilAgenda'];
  onAccept: (id: string) => void;
  onDefer: (id: string) => void;
  onDecide: (title: string, action: string) => void;
}) {
  return (
    <section className="er-holo-panel space-y-3 rounded-2xl border border-white/80 p-6">
      <p style={hqLabel}>Evolution Council™</p>
      {agenda.map((item) => (
        <article key={item.agendaId} className="rounded-xl border border-black/5 bg-white/50 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '12px' }}>{item.topic}</p>
          <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 6 }}>{item.orbPosition}</p>
          <p style={{ fontSize: '10px', marginTop: 8 }}>{item.recommendation}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="council-btn" onClick={() => onAccept(item.agendaId)}>
              Accept
            </button>
            <button type="button" className="council-btn" onClick={() => onDefer(item.agendaId)}>
              Defer
            </button>
            <button
              type="button"
              className="council-btn primary"
              onClick={() => onDecide(item.topic, item.recommendation)}
            >
              Record Decision
            </button>
          </div>
        </article>
      ))}
      <style>{`
        .council-btn {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid rgba(0,0,0,0.1);
          background: white;
          cursor: pointer;
        }
        .council-btn.primary { border-color: rgba(235,28,36,0.3); color: #EB1C24; }
      `}</style>
    </section>
  );
}

function FutureWallPanel({
  opportunities,
  automations,
  priorities,
}: {
  opportunities: ReturnType<typeof useEvolutionRoomState>['view']['futureOpportunities'];
  automations: ReturnType<typeof useEvolutionRoomState>['view']['automationSuggestions'];
  priorities: ReturnType<typeof useEvolutionRoomState>['view']['strategicPriorities'];
}) {
  return (
    <section className="er-holo-panel space-y-4 rounded-2xl border border-white/80 p-6">
      <p style={hqLabel}>Future Wall™ · Future Opportunities™</p>
      <div className="grid gap-3 md:grid-cols-2">
        {opportunities.map((o) => (
          <article key={o.opportunityId} className="rounded-xl border border-indigo-500/10 bg-white/50 p-4">
            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>{o.title}</p>
            <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{o.description}</p>
            <span className="mt-2 inline-block text-[9px] uppercase text-indigo-600">{o.priority} · {o.category}</span>
          </article>
        ))}
      </div>
      <div>
        <p style={{ ...hqLabel, marginBottom: 8 }}>Automation Suggestions™</p>
        <ul className="space-y-2">
          {automations.map((a) => (
            <li key={a.suggestionId} className="rounded-lg bg-white/50 p-3 text-[10px]">
              {a.title} — saves ~{a.estimatedMinutesSaved} min · {a.riskLevel} risk
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p style={{ ...hqLabel, marginBottom: 8 }}>Strategic Priorities™</p>
        <ul className="space-y-2">
          {priorities.map((p) => (
            <li key={p.priorityId} className="rounded-lg bg-white/50 p-3 text-[10px]">
              {p.title} → {p.targetMonth} ({p.status})
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LegacyWallPanel({
  timeline,
  archived,
}: {
  timeline: ReturnType<typeof useEvolutionRoomState>['view']['legacyTimeline'];
  archived: ReturnType<typeof useEvolutionRoomState>['view']['archivedSessions'];
}) {
  return (
    <section className="er-holo-panel space-y-4 rounded-2xl border border-white/80 p-6">
      <p style={hqLabel}>Legacy Wall™ · Legacy Timeline™</p>
      <ol className="space-y-4 border-l-2 border-amber-700/20 pl-4">
        {timeline.map((e) => (
          <li key={e.entryId} className="relative text-[11px]">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-amber-600/50" />
            <time style={{ color: HQ.gray, fontSize: '9px' }}>{new Date(e.date).toLocaleDateString()}</time>
            <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '14px' }}>{e.title}</p>
            <p style={{ color: HQ.gray }}>{e.narrative}</p>
            <span className="text-[9px] uppercase text-amber-800">{e.category}</span>
          </li>
        ))}
      </ol>
      {archived.length > 0 && (
        <div>
          <p style={{ ...hqLabel, marginTop: 16 }}>Archived Sessions</p>
          {archived.map((a) => (
            <p key={a.archiveId} style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>
              {a.monthLabel} — sealed {new Date(a.sealedAt).toLocaleDateString()}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

function StatsRibbon({
  stats,
  launchStack,
}: {
  stats: ReturnType<typeof useEvolutionRoomState>['view']['stats'];
  launchStack: ReturnType<typeof useEvolutionRoomState>['view']['launchStackProgress'];
}) {
  return (
    <footer
      className="flex flex-wrap gap-4 rounded-xl border border-black/5 bg-white/40 px-4 py-3"
      style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: HQ.gray }}
    >
      <span>Launch Stack {stats.launchStackProgressPercent}%</span>
      <span>{stats.queuedGenesisProposals} Genesis proposals</span>
      <span>{stats.legacyEntryCount} legacy entries</span>
      <span>{stats.futureOpportunityCount} future opportunities</span>
      <span>{launchStack.filter((l) => l.status === 'blocked').length} blocked systems</span>
    </footer>
  );
}
