import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ERS_ROOM_PATH_LABELS,
  type ErsHealthReading,
  type ErsRoomPath,
} from '../../../../studio-os-core/genesis';
import { useExecutiveReflectionSuiteState } from '../../../../hooks/useExecutiveReflectionSuiteState';
import { HQ, hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/executive-reflection';

const WING_NAV: { slug: ErsRoomPath; label: string; ring: 'daily' | 'strategic' | 'legacy' }[] = [
  { slug: 'executive-reflection', label: 'Suite Arrival', ring: 'daily' },
  { slug: 'founder-diary', label: 'Founder Diary™', ring: 'daily' },
  { slug: 'evolution-room', label: 'Evolution Room™', ring: 'strategic' },
  { slug: 'evolution-council', label: 'Evolution Council™', ring: 'strategic' },
  { slug: 'quarterly-retreat', label: 'Quarterly Retreat™', ring: 'strategic' },
  { slug: 'launch-stack-health', label: 'Launch Stack Health™', ring: 'strategic' },
  { slug: 'genesis-learning', label: 'Genesis Learning™', ring: 'strategic' },
  { slug: 'boardroom', label: 'The Boardroom™', ring: 'legacy' },
  { slug: 'founders-summit', label: "Founder's Summit™", ring: 'legacy' },
  { slug: 'victory-gallery', label: 'Victory Gallery™', ring: 'legacy' },
  { slug: 'legacy-chamber', label: 'Legacy Chamber™', ring: 'legacy' },
  { slug: 'lessons-library', label: 'Lessons Library™', ring: 'legacy' },
  { slug: 'opportunity-observatory', label: 'Opportunity Observatory™', ring: 'legacy' },
  { slug: 'future-theater', label: 'Future Theater™', ring: 'legacy' },
  { slug: 'innovation-hall', label: 'Innovation Hall™', ring: 'legacy' },
  { slug: 'decision-timeline', label: 'Decision Timeline™', ring: 'legacy' },
  { slug: 'failure-laboratory', label: 'Failure Laboratory™', ring: 'legacy' },
];

/**
 * Executive Reflection Suite™ — Headquarters reflection wing.
 * Immersive executive environment · Orb Presentation Mode™ · no dashboards.
 */
export function ExecutiveReflectionSuiteWorkspace() {
  const navigate = useNavigate();
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, beginSession, archiveSession, prepareSummit, prepareRetreat, refresh } =
    useExecutiveReflectionSuiteState();

  const activeSlug = (roomSlug ?? 'executive-reflection') as ErsRoomPath;

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] overflow-hidden"
      style={{
        background:
          'linear-gradient(165deg, #f8f6f3 0%, #efeae4 30%, #f5f2ee 65%, #faf8f5 100%)',
      }}
    >
      <HqExperienceStyles />
      <SuiteStyles />
      <div className="ers-marble" aria-hidden />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-4 py-3" style={hqGlassPanel}>
        <div>
          <p style={{ ...hqLabel, color: HQ.red, margin: 0 }}>EXECUTIVE REFLECTION SUITE™</p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', margin: '4px 0 0', color: HQ.black }}>
            {ERS_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="ers-btn" onClick={() => navigate('/admin/studio/evolution-room')}>
            Evolution Room →
          </button>
          <button type="button" className="ers-btn primary" onClick={refresh}>
            Refresh Wing
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r border-black/5 bg-white/30 p-3 lg:block" aria-label="Reflection wing">
          {(['daily', 'strategic', 'legacy'] as const).map((ring) => (
            <div key={ring} className="mb-4">
              <p style={{ ...hqLabel, marginBottom: 6 }}>{ring}</p>
              {WING_NAV.filter((r) => r.ring === ring).map((room) => (
                <Link
                  key={room.slug}
                  to={`${BASE}/${room.slug}`}
                  className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: activeSlug === room.slug ? HQ.black : HQ.gray,
                    background: activeSlug === room.slug ? 'rgba(255,255,255,0.85)' : 'transparent',
                    borderLeft: activeSlug === room.slug ? `2px solid ${HQ.red}` : '2px solid transparent',
                  }}
                >
                  {room.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex flex-1 flex-col gap-4 p-4">
          <OrbPresentationHeader
            room={activeSlug}
            summary={view.evolutionBrief?.orbGreeting}
            onBegin={() => beginSession('executive-review')}
            onArchive={archiveSession}
            hasSession={!!view.activeSession}
          />

          {activeSlug === 'executive-reflection' && <ArrivalPanel view={view} health={view.healthReadings} />}
          {activeSlug === 'founder-diary' && <FounderDiaryPanel prompts={view.founderDiaryPrompts} answers={view.founderDiaryAnswers} escapes={view.escapePatterns} />}
          {activeSlug === 'evolution-room' && <EvolutionRoomPanel brief={view.evolutionBrief} progress={view.launchStackProgress} />}
          {activeSlug === 'evolution-council' && <CouncilPanel agenda={view.councilAgenda} />}
          {activeSlug === 'quarterly-retreat' && <RetreatPanel packet={view.retreatPacket} onPrepare={prepareRetreat} />}
          {activeSlug === 'founders-summit' && <SummitPanel capsule={view.summitCapsule} onPrepare={prepareSummit} />}
          {activeSlug === 'victory-gallery' && <VictoryGalleryPanel victories={view.victories} />}
          {activeSlug === 'legacy-chamber' && <LegacyChamberPanel timeline={view.legacyTimeline} />}
          {activeSlug === 'lessons-library' && <LessonsPanel lessons={view.lessons} />}
          {activeSlug === 'opportunity-observatory' && <ObservatoryPanel signals={view.opportunitySignals} />}
          {activeSlug === 'future-theater' && <FutureTheaterPanel scenarios={view.futureScenarios} />}
          {activeSlug === 'boardroom' && <BoardroomPanel packets={view.boardroomPackets} />}
          {activeSlug === 'innovation-hall' && <InnovationHallPanel ideas={view.innovationIdeas} />}
          {activeSlug === 'decision-timeline' && <DecisionTimelinePanel entries={view.decisionTimeline} />}
          {activeSlug === 'failure-laboratory' && <FailureLabPanel studies={view.failureStudies} />}
          {activeSlug === 'genesis-learning' && <GenesisLearningPanel proposals={view.genesisProposals} />}
          {activeSlug === 'launch-stack-health' && (
            <LaunchStackHealthPanel
              progress={view.launchStackProgress}
              withdrawal={view.withdrawalTests}
              replacement={view.replacementTests}
              health={view.healthReadings.filter((h) => h.lens === 'launch-stack' || h.lens === 'system')}
            />
          )}

          {view.activeSession?.outputs && (
            <SessionOutputsPanel outputs={view.activeSession.outputs} />
          )}

          <StatsRibbon stats={view.stats} />
        </main>
      </div>
    </div>
  );
}

function SuiteStyles() {
  return (
    <style>{`
      .ers-marble { position:absolute; inset:0; pointer-events:none; opacity:0.28;
        background-image:url('/assets/marble-half.png'); background-size:480px; }
      @keyframes ers-orb { 0%,100%{box-shadow:0 0 48px rgba(235,28,36,0.12)} 50%{box-shadow:0 0 72px rgba(99,102,241,0.15)} }
      .ers-orb { animation:ers-orb 6s ease-in-out infinite; }
      .ers-holo { background:linear-gradient(105deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78));
        border:1px solid rgba(255,255,255,0.85); box-shadow:0 12px 40px rgba(0,0,0,0.06); border-radius:16px; }
      .ers-btn { font-family:"Futura PT Medium"; font-size:10px; letter-spacing:0.08em; text-transform:uppercase;
        padding:8px 14px; border-radius:6px; border:1px solid rgba(0,0,0,0.1); background:rgba(255,255,255,0.7); cursor:pointer; }
      .ers-btn.primary { border-color:rgba(235,28,36,0.3); background:rgba(235,28,36,0.08); color:#EB1C24; }
    `}</style>
  );
}

function OrbPresentationHeader({
  room,
  summary,
  onBegin,
  onArchive,
  hasSession,
}: {
  room: ErsRoomPath;
  summary?: string;
  onBegin: () => void;
  onArchive: () => void;
  hasSession: boolean;
}) {
  return (
    <section className="ers-holo p-6 text-center">
      <div className="ers-orb mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'radial-gradient(circle,#fff,rgba(235,28,36,0.1))' }}>
        <span style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', letterSpacing: '0.2em', color: HQ.red }}>ORB</span>
      </div>
      <p style={hqLabel}>Orb Presentation Mode™ · {ERS_ROOM_PATH_LABELS[room]}</p>
      {summary && room === 'executive-reflection' ? (
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: HQ.gray, maxWidth: 560, margin: '12px auto 0', lineHeight: 1.6 }}>{summary}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" className="ers-btn primary" onClick={onBegin}>Begin Executive Session</button>
        {hasSession && <button type="button" className="ers-btn" onClick={onArchive}>Archive Session</button>}
      </div>
    </section>
  );
}

function ArrivalPanel({ view, health }: { view: ReturnType<typeof useExecutiveReflectionSuiteState>['view']; health: ErsHealthReading[] }) {
  return (
    <section className="ers-holo p-6">
      <p style={hqLabel}>Executive Reflection Suite™ Arrival</p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '13px', color: HQ.black, marginTop: 8 }}>
        {view.evolutionBrief?.executiveSummary}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {health.map((h) => (
          <HealthRing key={h.lens} reading={h} />
        ))}
      </div>
    </section>
  );
}

function HealthRing({ reading }: { reading: ErsHealthReading }) {
  return (
    <div className="rounded-xl bg-white/50 p-3 text-center">
      <p style={{ ...hqLabel, color: HQ.red }}>{reading.lens.replace('-', ' ')}</p>
      <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '22px', margin: '4px 0' }}>{reading.score}</p>
      <p style={{ fontSize: '10px', color: HQ.gray }}>{reading.summary}</p>
    </div>
  );
}

function FounderDiaryPanel({ prompts, answers, escapes }: {
  prompts: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['founderDiaryPrompts'];
  answers: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['founderDiaryAnswers'];
  escapes: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['escapePatterns'];
}) {
  return (
    <section className="ers-holo space-y-4 p-6">
      <p style={hqLabel}>Founder Diary™ · Escape Velocity™</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>Recent Reflections</h3>
          <ul className="mt-2 space-y-2">
            {answers.slice(0, 6).map((a) => (
              <li key={a.answerId} className="rounded-lg bg-white/50 p-3 text-[11px]">{a.response.slice(0, 140)}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>Escape Patterns</h3>
          <ul className="mt-2 space-y-2">
            {escapes.slice(0, 5).map((e) => (
              <li key={e.patternId} className="rounded-lg bg-white/50 p-3 text-[10px]">
                {e.destinationCategory} → {e.recommendedOutcome} ({e.occurrenceCount}×)
              </li>
            ))}
          </ul>
        </div>
      </div>
      {prompts.length > 0 && (
        <p style={{ fontSize: '10px', color: HQ.gray }}>{prompts.filter((p) => !p.answeredAt).length} adaptive prompts pending</p>
      )}
    </section>
  );
}

function EvolutionRoomPanel({ brief, progress }: {
  brief: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['evolutionBrief'];
  progress: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['launchStackProgress'];
}) {
  const navigate = useNavigate();
  return (
    <section className="ers-holo p-6">
      <p style={hqLabel}>Evolution Room™ Chamber</p>
      <p style={{ fontSize: '12px', color: HQ.gray, marginTop: 8 }}>{brief?.executiveSummary}</p>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {progress.slice(0, 6).map((m) => (
          <div key={m.systemId} className="rounded-lg bg-white/50 p-3 text-[10px]">
            <strong>{m.officialName}</strong> — {m.progressPercent}% · {m.status}
          </div>
        ))}
      </div>
      <button type="button" className="ers-btn primary mt-4" onClick={() => navigate('/admin/studio/evolution-room')}>
        Enter Full Evolution Room →
      </button>
    </section>
  );
}

function CouncilPanel({ agenda }: { agenda: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['councilAgenda'] }) {
  return (
    <section className="ers-holo space-y-3 p-6">
      <p style={hqLabel}>Evolution Council™</p>
      {agenda.map((item) => (
        <article key={item.agendaId} className="rounded-xl bg-white/50 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '12px' }}>{item.topic}</p>
          <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 4 }}>{item.orbPosition}</p>
          <p style={{ fontSize: '10px', marginTop: 6 }}>{item.recommendation}</p>
        </article>
      ))}
    </section>
  );
}

function SummitPanel({ capsule, onPrepare }: {
  capsule: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['summitCapsule'];
  onPrepare: () => void;
}) {
  if (!capsule) {
    return (
      <section className="ers-holo p-6 text-center">
        <p style={hqLabel}>Founder's Annual Summit™</p>
        <button type="button" className="ers-btn primary mt-4" onClick={onPrepare}>Prepare Annual Summit</button>
      </section>
    );
  }
  return (
    <section className="ers-holo space-y-4 p-6" style={{ background: 'linear-gradient(165deg,rgba(255,248,240,0.95),rgba(255,255,255,0.85))' }}>
      <p style={{ ...hqLabel, color: '#92704A' }}>{capsule.yearLabel} Annual Summit</p>
      <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '20px' }}>{capsule.yearStory.slice(0, 200)}…</p>
      <ul className="space-y-1 text-[11px]">{capsule.milestones.map((m) => <li key={m}>✦ {m}</li>)}</ul>
      <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', color: HQ.red, marginTop: 16 }}>
        {capsule.nextChapterInvitation}
      </p>
    </section>
  );
}

function RetreatPanel({ packet, onPrepare }: {
  packet: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['retreatPacket'];
  onPrepare: () => void;
}) {
  if (!packet) {
    return (
      <section className="ers-holo p-6 text-center">
        <button type="button" className="ers-btn primary" onClick={onPrepare}>Generate Quarterly Retreat</button>
      </section>
    );
  }
  return (
    <section className="ers-holo space-y-3 p-6">
      <p style={hqLabel}>{packet.quarterLabel} Strategy Retreat</p>
      <p style={{ fontSize: '12px' }}><strong>Theme:</strong> {packet.strategicTheme}</p>
      <p style={{ fontSize: '11px' }}><strong>Bets:</strong> {packet.strategicBets.join(' · ')}</p>
      <p style={{ fontSize: '11px', color: HQ.gray }}><strong>Stopped:</strong> {packet.stoppedItems.join(' · ')}</p>
    </section>
  );
}

function VictoryGalleryPanel({ victories }: { victories: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['victories'] }) {
  return (
    <section className="ers-holo grid gap-4 p-6 md:grid-cols-2">
      {victories.map((v) => (
        <article key={v.artifactId} className="rounded-xl border border-amber-200/40 bg-white/60 p-4">
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '16px' }}>{v.title}</p>
          <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 6 }}>{v.narrative}</p>
          <span className="mt-2 inline-block text-[9px] uppercase text-amber-800">{v.category}</span>
        </article>
      ))}
    </section>
  );
}

function LegacyChamberPanel({ timeline }: { timeline: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['legacyTimeline'] }) {
  return (
    <section className="ers-holo p-6">
      <p style={hqLabel}>Legacy Chamber™</p>
      <ol className="mt-4 space-y-4 border-l-2 border-amber-800/20 pl-4">
        {timeline.map((e) => (
          <li key={e.entryId} className="text-[11px]">
            <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '15px' }}>{e.title}</p>
            <p style={{ color: HQ.gray }}>{e.narrative}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function LessonsPanel({ lessons }: { lessons: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['lessons'] }) {
  return (
    <section className="ers-holo space-y-3 p-6">
      <p style={hqLabel}>Lessons Learned Library™</p>
      {lessons.map((l) => (
        <article key={l.lessonId} className="rounded-xl bg-white/50 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '12px' }}>{l.title}</p>
          <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 4 }}>{l.recommendation}</p>
        </article>
      ))}
    </section>
  );
}

function ObservatoryPanel({ signals }: { signals: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['opportunitySignals'] }) {
  return (
    <section className="ers-holo grid gap-3 p-6 md:grid-cols-2">
      {signals.map((s) => (
        <article key={s.signalId} className="rounded-xl bg-indigo-50/40 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>{s.title}</p>
          <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{s.description}</p>
          <span className="text-[9px] uppercase text-indigo-700">{s.priority} · {Math.round(s.confidence * 100)}%</span>
        </article>
      ))}
    </section>
  );
}

function FutureTheaterPanel({ scenarios }: { scenarios: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['futureScenarios'] }) {
  return (
    <section className="ers-holo space-y-4 p-6">
      <p style={hqLabel}>Future Vision Theater™</p>
      {scenarios.map((s) => (
        <article key={s.scenarioId} className="rounded-xl bg-black/5 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '12px' }}>{s.title}</p>
          <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 6 }}>{s.narrative}</p>
          <p style={{ fontSize: '10px', marginTop: 8 }}>{s.recommendations.join(' · ')}</p>
        </article>
      ))}
    </section>
  );
}

function BoardroomPanel({ packets }: { packets: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['boardroomPackets'] }) {
  return (
    <section className="ers-holo space-y-4 p-6">
      <p style={hqLabel}>The Boardroom™ — Constitutional Decisions</p>
      {packets.map((p) => (
        <article key={p.packetId} className="rounded-xl border border-black/10 bg-white/70 p-5">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '13px' }}>{p.title}</p>
          <p style={{ fontSize: '10px', color: HQ.gray, marginTop: 4 }}>{p.decisionClass}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2 text-[10px]">
            <div><strong>Risks:</strong> {p.risks.join('; ')}</div>
            <div><strong>Benefits:</strong> {p.benefits.join('; ')}</div>
          </div>
          <p style={{ fontSize: '10px', marginTop: 8, fontStyle: 'italic' }}>Dissent: {p.dissentingArgument}</p>
        </article>
      ))}
    </section>
  );
}

function InnovationHallPanel({ ideas }: { ideas: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['innovationIdeas'] }) {
  return (
    <section className="ers-holo grid gap-3 p-6 md:grid-cols-2">
      {ideas.map((i) => (
        <article key={i.ideaId} className="rounded-xl bg-white/50 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '11px' }}>{i.title}</p>
          <p style={{ fontSize: '10px', color: HQ.gray }}>{i.opportunity}</p>
        </article>
      ))}
    </section>
  );
}

function DecisionTimelinePanel({ entries }: { entries: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['decisionTimeline'] }) {
  return (
    <section className="ers-holo p-6">
      <ol className="space-y-3 border-l-2 border-red-500/20 pl-4">
        {entries.map((e) => (
          <li key={e.entryId} className="text-[11px]">
            <time style={{ fontSize: '9px', color: HQ.gray }}>{new Date(e.decidedAt).toLocaleDateString()}</time>
            <p style={{ fontFamily: '"Futura PT Medium"' }}>{e.title}</p>
            <p style={{ color: HQ.gray }}>{e.rationale}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function FailureLabPanel({ studies }: { studies: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['failureStudies'] }) {
  return (
    <section className="ers-holo space-y-3 p-6">
      <p style={hqLabel}>Failure Laboratory™ — shame-free analysis</p>
      {studies.map((f) => (
        <article key={f.studyId} className="rounded-xl bg-white/50 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '12px' }}>{f.title}</p>
          <p style={{ fontSize: '11px', color: HQ.gray, marginTop: 4 }}>Assumption: {f.assumption}</p>
          <p style={{ fontSize: '10px', marginTop: 6 }}>Lesson: {f.lessonExtracted}</p>
        </article>
      ))}
    </section>
  );
}

function GenesisLearningPanel({ proposals }: { proposals: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['genesisProposals'] }) {
  return (
    <section className="ers-holo space-y-3 p-6">
      <p style={hqLabel}>Genesis Learning Loop™ — proposals only, never auto-canon</p>
      {proposals.map((p) => (
        <article key={p.proposalId} className="rounded-xl bg-white/50 p-4">
          <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '12px' }}>{p.title}</p>
          <p style={{ fontSize: '10px', color: HQ.gray }}>{p.proposedGenesisChange}</p>
        </article>
      ))}
    </section>
  );
}

function LaunchStackHealthPanel({ progress, withdrawal, replacement, health }: {
  progress: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['launchStackProgress'];
  withdrawal: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['withdrawalTests'];
  replacement: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['replacementTests'];
  health: ErsHealthReading[];
}) {
  return (
    <section className="ers-holo space-y-4 p-6">
      <div className="grid gap-3 sm:grid-cols-2">{health.map((h) => <HealthRing key={h.lens} reading={h} />)}</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <p style={hqLabel}>Launch Stack</p>
          {progress.map((m) => (
            <p key={m.systemId} className="text-[10px]">{m.officialName}: {m.progressPercent}%</p>
          ))}
        </div>
        <div>
          <p style={hqLabel}>Withdrawal Test™</p>
          {withdrawal.map((w) => (
            <p key={w.systemId} className="text-[10px]">{w.officialName}: {w.indispensable ? 'indispensable' : 'optional'} ({w.score}%)</p>
          ))}
        </div>
        <div>
          <p style={hqLabel}>Replacement Test™</p>
          {replacement.map((r) => (
            <p key={r.systemId} className="text-[10px]">{r.officialName}: {r.replaced ? 'replaced' : 'pending'}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

function SessionOutputsPanel({ outputs }: { outputs: NonNullable<ReturnType<typeof useExecutiveReflectionSuiteState>['view']['activeSession']>['outputs'] }) {
  if (!outputs) return null;
  return (
    <section className="ers-holo p-6">
      <p style={hqLabel}>Session Outputs™</p>
      <p style={{ fontSize: '12px', marginTop: 8 }}>{outputs.executiveSummary}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 text-[10px]">
        <OutputList title="Strategic Priorities" items={outputs.strategicPriorities} />
        <OutputList title="Mission Recommendations" items={outputs.missionRecommendations} />
        <OutputList title="Genesis Proposals" items={outputs.genesisImprovementProposals} />
        <OutputList title="Future Opportunities" items={outputs.futureOpportunities} />
      </div>
    </section>
  );
}

function OutputList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p style={{ ...hqLabel, color: HQ.red }}>{title}</p>
      <ul className="mt-1 list-disc pl-4">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}

function StatsRibbon({ stats }: { stats: ReturnType<typeof useExecutiveReflectionSuiteState>['view']['stats'] }) {
  return (
    <footer className="flex flex-wrap gap-4 rounded-xl border border-black/5 bg-white/40 px-4 py-3 text-[10px] text-gray-500">
      <span>Executive health {stats.executiveHealthScore}</span>
      <span>Delight {stats.delightScore}%</span>
      <span>Launch Stack {stats.launchStackHealth}%</span>
      <span>{stats.victoryCount} victories</span>
      <span>{stats.lessonCount} lessons</span>
      <span>{stats.opportunityCount} opportunities</span>
    </footer>
  );
}
