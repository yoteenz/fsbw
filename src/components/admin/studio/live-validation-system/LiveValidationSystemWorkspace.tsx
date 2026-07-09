import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LVS_DASHBOARD_VIEW_LABELS,
  LVS_HEALTH_DIMENSION_LABELS,
  type LvsDashboardView,
  type LvsGenesisImprovementProposal,
  type LvsSystemHealthScore,
} from '../../../../studio-os-core/genesis';
import { useLiveValidationSystemState } from '../../../../hooks/useLiveValidationSystemState';

function LvsPanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm ${className}`}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
        {title}
      </h3>
      {children}
    </section>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-300';
  if (score >= 60) return 'text-amber-300';
  return 'text-red-300';
}

/**
 * Live Validation System™ — Phase 2 continuous founder validation workspace.
 */
export function LiveValidationSystemWorkspace() {
  const navigate = useNavigate();
  const { view, stats, activeView, dashboardViews, selectView, acceptProposal, rejectProposal, refresh } =
    useLiveValidationSystemState();
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  const selectedHealth = useMemo(
    () => view.systemHealth.find((h) => h.systemId === selectedSystemId) ?? null,
    [view.systemHealth, selectedSystemId]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400/80">
              Live Validation System™
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Continuous Founder Validation</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Studio OS learns while you operate — passive signals, adaptive reflection, Escape
              Velocity™, and Genesis proposals. You should never feel like you are testing software.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/studio/evolution-room')}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Evolution Room™ →
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/studio/founder-acceptance-testing')}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              FAT Framework →
            </button>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
            >
              Sync Live Validation
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <Stat label="Validation signals" value={stats.signalCount} />
          <Stat label="Escape Velocity" value={stats.escapeVelocityScore} />
          <Stat label="System health avg" value={`${stats.systemHealthAverage}/100`} />
          <Stat label="Diary answer rate" value={`${stats.diaryAnswerRate}%`} />
          <Stat label="Queued proposals" value={stats.queuedProposals} />
          <Stat label="Accepted / rejected" value={`${stats.acceptedProposals} / ${stats.rejectedProposals}`} />
        </div>

        <nav className="flex flex-wrap gap-2">
          {dashboardViews.map((viewId) => (
            <button
              key={viewId}
              type="button"
              onClick={() => selectView(viewId)}
              className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider ${
                activeView === viewId
                  ? 'bg-violet-500/20 text-violet-200'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {LVS_DASHBOARD_VIEW_LABELS[viewId as LvsDashboardView]}
            </button>
          ))}
        </nav>
      </header>

      {activeView === 'overview' && (
        <OverviewView view={view} weeklyReview={view.weeklyReview} />
      )}

      {activeView === 'founder-diary' && (
        <FounderDiaryView prompts={view.diaryPrompts} answers={view.diaryAnswers} pending={view.pendingPrompts} />
      )}

      {activeView === 'escape-velocity' && (
        <EscapeVelocityView events={view.escapeEvents} patterns={view.escapePatterns} />
      )}

      {activeView === 'system-health' && (
        <SystemHealthView
          health={view.systemHealth}
          selected={selectedHealth}
          onSelect={setSelectedSystemId}
        />
      )}

      {activeView === 'adoption-value' && (
        <AdoptionValueView metrics={view.trackingMetrics} summary={view.adoptionSummary} />
      )}

      {activeView === 'genesis-proposals' && (
        <GenesisProposalsView
          proposals={view.genesisProposals}
          history={view.architecturalHistory}
          onAccept={acceptProposal}
          onReject={rejectProposal}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-white/40">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function OverviewView({
  view,
  weeklyReview,
}: {
  view: ReturnType<typeof useLiveValidationSystemState>['view'];
  weeklyReview: ReturnType<typeof useLiveValidationSystemState>['view']['weeklyReview'];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LvsPanel title="Passive Validation Signals">
        <p className="mb-3 text-sm text-white/60">
          {view.stats.signalCount} signals tracked across missions, systems, and workflows.
        </p>
        <ul className="space-y-2 text-sm">
          {view.trackingMetrics.slice(0, 6).map((m) => (
            <li key={m.metricId} className="flex justify-between rounded bg-white/5 px-3 py-2">
              <span>{m.label}</span>
              <span className={scoreColor(m.value)}>{m.value}{m.unit === 'percent' ? '%' : ''}</span>
            </li>
          ))}
        </ul>
      </LvsPanel>

      {weeklyReview && (
        <LvsPanel title="Weekly Executive Review™">
          <p className="text-sm text-white/70">{weeklyReview.summary}</p>
          <div className="mt-3 grid gap-2 text-xs text-white/50 sm:grid-cols-2">
            <p>Improved: {weeklyReview.systemsImproved.join(', ')}</p>
            <p>Friction: {weeklyReview.systemsWithFriction.join(', ')}</p>
            <p>Escapes: {weeklyReview.notableEscapes.join(', ')}</p>
            <p>Proposals: {weeklyReview.proposalsCreated} created</p>
          </div>
        </LvsPanel>
      )}

      <LvsPanel title="Top Escape Patterns">
        <ul className="space-y-2 text-sm">
          {view.escapePatterns.slice(0, 4).map((p) => (
            <li key={p.patternId} className="rounded bg-white/5 p-2">
              <p className="font-medium">{p.destinationCategory} · {p.systemId}</p>
              <p className="text-xs text-white/50">
                Score {p.escapeVelocityScore} · {p.recommendedOutcome}
              </p>
            </li>
          ))}
        </ul>
      </LvsPanel>

      <LvsPanel title="Genesis Proposal Queue">
        <p className="mb-2 text-sm text-white/60">
          Proposals queue for founder review — Genesis is never modified automatically.
        </p>
        <ul className="space-y-2 text-sm">
          {view.genesisProposals.filter((p) => p.status === 'queued').slice(0, 3).map((p) => (
            <li key={p.proposalId} className="rounded bg-white/5 p-2">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-white/50">{p.signalSummary.slice(0, 120)}…</p>
            </li>
          ))}
        </ul>
      </LvsPanel>
    </div>
  );
}

function FounderDiaryView({
  prompts,
  answers,
  pending,
}: {
  prompts: ReturnType<typeof useLiveValidationSystemState>['view']['diaryPrompts'];
  answers: ReturnType<typeof useLiveValidationSystemState>['view']['diaryAnswers'];
  pending: ReturnType<typeof useLiveValidationSystemState>['view']['pendingPrompts'];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LvsPanel title="Pending Reflection">
        {pending.length === 0 ? (
          <p className="text-sm text-white/50">No pending prompts — Orb will ask when insight is valuable.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((p) => (
              <li key={p.promptId} className="rounded bg-violet-500/10 p-3 text-sm">
                <p>{p.question}</p>
                <p className="mt-1 text-xs text-white/40">Trigger: {p.triggerKind}</p>
              </li>
            ))}
          </ul>
        )}
      </LvsPanel>

      <LvsPanel title="Founder Answers">
        <ul className="max-h-[400px] space-y-3 overflow-y-auto text-sm">
          {answers.map((a) => (
            <li key={a.answerId} className="rounded bg-white/5 p-3">
              <p>{a.response}</p>
              <p className="mt-1 text-xs text-white/40">
                {a.sentiments.join(', ')} · {new Date(a.recordedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </LvsPanel>

      <LvsPanel title="Recent Prompts" className="lg:col-span-2">
        <ul className="space-y-2 text-sm text-white/60">
          {prompts.map((p) => (
            <li key={p.promptId}>
              {p.question} {p.answeredAt ? '✓' : p.skipped ? '(skipped)' : '(pending)'}
            </li>
          ))}
        </ul>
      </LvsPanel>
    </div>
  );
}

function EscapeVelocityView({
  events,
  patterns,
}: {
  events: ReturnType<typeof useLiveValidationSystemState>['view']['escapeEvents'];
  patterns: ReturnType<typeof useLiveValidationSystemState>['view']['escapePatterns'];
}) {
  return (
    <div className="space-y-4">
      <LvsPanel title="Escape Events">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="pb-2 pr-3">Destination</th>
                <th className="pb-2 pr-3">System</th>
                <th className="pb-2 pr-3">Classification</th>
                <th className="pb-2 pr-3">Outcome</th>
                <th className="pb-2 pr-3">Urgency</th>
                <th className="pb-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.eventId} className="border-b border-white/5">
                  <td className="py-2 pr-3">{e.destinationLabel}</td>
                  <td className="py-2 pr-3">{e.systemId}</td>
                  <td className="py-2 pr-3">{e.classification}</td>
                  <td className="py-2 pr-3">{e.outcome}</td>
                  <td className="py-2 pr-3">{e.urgency}</td>
                  <td className="py-2">{e.frictionScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LvsPanel>

      <LvsPanel title="Pattern Detection">
        <ul className="grid gap-3 md:grid-cols-2">
          {patterns.map((p) => (
            <li key={p.patternId} className="rounded bg-white/5 p-3 text-sm">
              <p className="font-medium">{p.destinationCategory}</p>
              <p className="text-white/60">
                {p.occurrenceCount} occurrences · EV {p.escapeVelocityScore}
              </p>
              <p className="mt-1 text-xs text-violet-300/80">→ {p.recommendedOutcome}</p>
            </li>
          ))}
        </ul>
      </LvsPanel>
    </div>
  );
}

function SystemHealthView({
  health,
  selected,
  onSelect,
}: {
  health: LvsSystemHealthScore[];
  selected: LvsSystemHealthScore | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <LvsPanel title="System Health Scores">
        <ul className="space-y-2">
          {health.map((h) => (
            <li key={h.systemId}>
              <button
                type="button"
                onClick={() => onSelect(h.systemId)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  selected?.systemId === h.systemId
                    ? 'border-violet-500/40 bg-violet-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="font-medium">{h.officialName}</p>
                <p className={`text-xs ${scoreColor(h.overallHealth)}`}>
                  {h.overallHealth}/100 · {h.trend}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </LvsPanel>

      <div className="lg:col-span-2">
        {selected ? (
          <LvsPanel title={`${selected.officialName} — Health Dimensions`}>
            <p className="mb-3 text-sm text-white/60">{selected.summary}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(selected.dimensions).map(([dim, score]) => (
                <div key={dim} className="rounded bg-white/5 p-3 text-sm">
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    {LVS_HEALTH_DIMENSION_LABELS[dim as keyof typeof LVS_HEALTH_DIMENSION_LABELS] ?? dim}
                  </p>
                  <p className={`font-medium ${scoreColor(score)}`}>{score}</p>
                </div>
              ))}
            </div>
          </LvsPanel>
        ) : (
          <LvsPanel title="System Health Score">
            <p className="text-sm text-white/60">Select a system to review health dimensions.</p>
          </LvsPanel>
        )}
      </div>
    </div>
  );
}

function AdoptionValueView({
  metrics,
  summary,
}: {
  metrics: ReturnType<typeof useLiveValidationSystemState>['view']['trackingMetrics'];
  summary: ReturnType<typeof useLiveValidationSystemState>['view']['adoptionSummary'];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LvsPanel title="Tracked Metrics">
        <ul className="grid gap-2 sm:grid-cols-2">
          {metrics.map((m) => (
            <li key={m.metricId} className="rounded bg-white/5 p-3 text-sm">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className={`font-medium ${scoreColor(m.value)}`}>
                {m.value}{m.unit === 'percent' ? '%' : m.unit === 'minutes' ? ' min' : ''}
              </p>
            </li>
          ))}
        </ul>
      </LvsPanel>

      <LvsPanel title="Adoption & Value by System">
        <ul className="space-y-2 text-sm">
          {summary.map((s) => (
            <li key={s.systemId} className="flex justify-between rounded bg-white/5 px-3 py-2">
              <span>{s.officialName}</span>
              <span className="text-white/60">
                Habit {s.habitScore} · Value {s.valueScore}
              </span>
            </li>
          ))}
        </ul>
      </LvsPanel>
    </div>
  );
}

function GenesisProposalsView({
  proposals,
  history,
  onAccept,
  onReject,
}: {
  proposals: LvsGenesisImprovementProposal[];
  history: ReturnType<typeof useLiveValidationSystemState>['view']['architecturalHistory'];
  onAccept: (id: string, note: string) => void;
  onReject: (id: string, note: string) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LvsPanel title="Genesis Improvement Proposals™">
        <p className="mb-3 text-xs text-white/50">
          Queued for founder review — Genesis is never modified automatically.
        </p>
        <ul className="space-y-4">
          {proposals.map((p) => (
            <li key={p.proposalId} className="rounded border border-white/10 bg-white/5 p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-medium">{p.title}</p>
                <span className="text-xs uppercase tracking-wider text-violet-300/80">{p.status}</span>
              </div>
              <p className="mt-2 text-white/60">{p.signalSummary}</p>
              <p className="mt-2 text-xs text-white/40">{p.proposedGenesisChange}</p>
              {p.status === 'queued' && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onAccept(p.proposalId, 'Accepted for Genesis review')}
                    className="rounded bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200"
                  >
                    Accept for review
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(p.proposalId, 'Not ready for Genesis change')}
                    className="rounded bg-red-500/20 px-3 py-1 text-xs text-red-200"
                  >
                    Reject
                  </button>
                </div>
              )}
              {p.reviewNote && (
                <p className="mt-2 text-xs italic text-white/50">Review: {p.reviewNote}</p>
              )}
            </li>
          ))}
        </ul>
      </LvsPanel>

      <LvsPanel title="Architectural History">
        <ul className="max-h-[520px] space-y-2 overflow-y-auto text-sm">
          {history.map((h) => (
            <li key={h.entryId} className="rounded bg-white/5 p-2">
              <p className="text-xs uppercase tracking-wider text-white/40">{h.action}</p>
              <p>{h.detail}</p>
              <p className="text-xs text-white/40">{new Date(h.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </LvsPanel>
    </div>
  );
}
