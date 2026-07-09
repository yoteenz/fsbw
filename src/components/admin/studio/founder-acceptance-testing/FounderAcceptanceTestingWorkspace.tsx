import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FAT_DASHBOARD_VIEW_LABELS,
  FAT_PASS_THRESHOLD,
  FAT_PIPELINE_STAGE_LABELS,
  FAT_VALIDATION_LEVEL_LABELS,
  FAT_VALIDATION_PIPELINE,
  type FatDashboardView,
  type FatLaunchStackMilestone,
  type FatMetricTrendPoint,
  type FatValidationRecord,
} from '../../../../studio-os-core/genesis';
import { useFounderAcceptanceTestingState } from '../../../../hooks/useFounderAcceptanceTestingState';

function FatPanel({
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

function gateStatusColor(status: string): string {
  if (status === 'graduated' || status === 'accepted') return 'text-emerald-300';
  if (status === 'conditional') return 'text-amber-300';
  if (status === 'retry' || status === 'blocked') return 'text-red-300';
  return 'text-white/40';
}

function scoreColor(score: number): string {
  if (score >= FAT_PASS_THRESHOLD) return 'text-emerald-300';
  if (score >= 60) return 'text-amber-300';
  return 'text-red-300';
}

/**
 * Founder Acceptance Testing™ — internal validation framework workspace.
 */
export function FounderAcceptanceTestingWorkspace() {
  const navigate = useNavigate();
  const { view, stats, activeView, dashboardViews, selectView, refresh } =
    useFounderAcceptanceTestingState();
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);

  const selectedRecord = useMemo(
    () => view.records.find((r) => r.systemId === selectedSystemId) ?? null,
    [view.records, selectedSystemId]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-400/80">
              Founder Acceptance Testing™
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Validation Framework</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Every Launch Stack milestone accumulates measurable founder evidence before becoming
              platform canon. Validation is continuous — not a one-time checklist.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/studio/genesis')}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Genesis →
            </button>
            <button
              type="button"
              onClick={refresh}
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20"
            >
              Sync Validation
            </button>
          </div>
        </div>

        <ValidationPipelineStrip />

        <div className="flex flex-wrap gap-6 text-sm">
          <Stat label="Systems tracked" value={stats.systemCount} />
          <Stat label="Launch Stack complete" value={`${stats.launchStackCompleteCount}/${stats.launchStackTotal}`} />
          <Stat label="Avg founder score" value={`${stats.averageFounderScore}/100`} />
          <Stat label="Graduated" value={stats.graduatedCount} />
          <Stat label="Pending FAT" value={stats.pendingFounderAcceptance} />
          <Stat label="Outstanding issues" value={stats.outstandingIssueCount} />
        </div>

        <nav className="flex flex-wrap gap-2">
          {dashboardViews.map((viewId) => (
            <button
              key={viewId}
              type="button"
              onClick={() => selectView(viewId)}
              className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider ${
                activeView === viewId
                  ? 'bg-rose-500/20 text-rose-200'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {FAT_DASHBOARD_VIEW_LABELS[viewId as FatDashboardView]}
            </button>
          ))}
        </nav>
      </header>

      {activeView === 'validation-dashboard' && (
        <ValidationDashboardView
          records={view.records}
          selectedId={selectedSystemId}
          onSelect={setSelectedSystemId}
          selectedRecord={selectedRecord}
        />
      )}

      {activeView === 'launch-stack-status' && (
        <LaunchStackStatusView milestones={view.launchStack} />
      )}

      {activeView === 'metric-trends' && <MetricTrendsView trends={view.metricTrends} />}

      {activeView === 'genesis-learnings' && (
        <GenesisLearningsView learnings={view.genesisLearnings} />
      )}

      {activeView === 'outstanding-issues' && (
        <OutstandingIssuesView issues={view.outstandingIssues} />
      )}

      {activeView === 'graduated-systems' && (
        <GraduatedSystemsView systems={view.graduatedSystems} />
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

function ValidationPipelineStrip() {
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-wider text-white/40">
      {FAT_VALIDATION_PIPELINE.map((stage, i) => (
        <span key={stage} className="flex items-center gap-1">
          {i > 0 && <span className="text-white/20">↓</span>}
          <span className="rounded bg-white/5 px-2 py-1 text-white/60">{stage}</span>
        </span>
      ))}
    </div>
  );
}

function ValidationDashboardView({
  records,
  selectedId,
  onSelect,
  selectedRecord,
}: {
  records: FatValidationRecord[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  selectedRecord: FatValidationRecord | null;
}) {
  const launchStackRecords = records.filter((r) => r.launchStackMilestone);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <FatPanel title="Validation Registry™" className="lg:col-span-1">
        <ul className="max-h-[480px] space-y-2 overflow-y-auto">
          {launchStackRecords.map((record) => (
            <li key={record.systemId}>
              <button
                type="button"
                onClick={() => onSelect(record.systemId)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedId === record.systemId
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="font-medium">{record.officialName}</p>
                <p className="text-xs text-white/50">
                  {FAT_PIPELINE_STAGE_LABELS[record.pipelineStage]} · Score{' '}
                  <span className={scoreColor(record.founderAcceptanceScore)}>
                    {record.founderAcceptanceScore}
                  </span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      </FatPanel>

      <div className="space-y-4 lg:col-span-2">
        {selectedRecord ? (
          <>
            <FatPanel title={selectedRecord.officialName}>
              <p className="mb-3 text-sm text-white/60">{selectedRecord.purpose}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedRecord.gates.map((gate) => (
                  <div key={gate.level} className="rounded bg-white/5 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wider text-white/40">
                      {FAT_VALIDATION_LEVEL_LABELS[gate.level]}
                    </p>
                    <p className={`font-medium ${gateStatusColor(gate.status)}`}>
                      {gate.status}
                      {gate.score !== undefined ? ` · ${gate.score}` : ''}
                    </p>
                    {gate.blocker && (
                      <p className="mt-1 text-xs text-amber-200/80">{gate.blocker}</p>
                    )}
                  </div>
                ))}
              </div>
            </FatPanel>

            <div className="grid gap-4 md:grid-cols-3">
              <FatPanel title="Withdrawal Test™">
                <p className={`text-sm font-medium ${selectedRecord.withdrawalTest.passed ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {selectedRecord.withdrawalTest.passed ? 'Pass' : 'Pending'} ·{' '}
                  {selectedRecord.withdrawalTest.criteriaMet}/
                  {selectedRecord.withdrawalTest.criteriaTotal}
                </p>
                <p className="mt-2 text-xs text-white/60">
                  {selectedRecord.withdrawalTest.frictionWithoutSystem}
                </p>
              </FatPanel>
              <FatPanel title="Replacement Test™">
                <p className={`text-sm font-medium ${selectedRecord.replacementTest.passed ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {selectedRecord.replacementTest.passed ? 'Pass' : 'Pending'}
                </p>
                <ul className="mt-2 list-inside list-disc text-xs text-white/60">
                  {selectedRecord.replacementTest.replacedTools.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </FatPanel>
              <FatPanel title="Delight Test™">
                <p className={`text-sm font-medium ${selectedRecord.delight.present ? 'text-emerald-300' : 'text-white/40'}`}>
                  {selectedRecord.delight.present ? 'Signal present' : 'Not yet observed'}
                </p>
                {selectedRecord.delight.founderQuote && (
                  <p className="mt-2 text-xs italic text-white/60">
                    "{selectedRecord.delight.founderQuote}"
                  </p>
                )}
              </FatPanel>
            </div>

            <FatPanel title="Evidence Engine™">
              <ul className="space-y-2 text-sm">
                {selectedRecord.evidence.map((e) => (
                  <li key={e.evidenceId} className="rounded bg-white/5 p-2">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-white/50">
                      {e.kind} · {e.level} · {e.source}
                    </p>
                  </li>
                ))}
              </ul>
            </FatPanel>
          </>
        ) : (
          <FatPanel title="Founder Testing Dashboard™">
            <p className="text-sm text-white/60">
              Select a Launch Stack system to review validation gates, tests, and evidence.
            </p>
          </FatPanel>
        )}
      </div>
    </div>
  );
}

function LaunchStackStatusView({ milestones }: { milestones: FatLaunchStackMilestone[] }) {
  return (
    <FatPanel title="Launch Stack Status™">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="pb-2 pr-4">System</th>
              <th className="pb-2 pr-4">Architecture</th>
              <th className="pb-2 pr-4">Implementation</th>
              <th className="pb-2 pr-4">Founder FAT</th>
              <th className="pb-2 pr-4">Genesis Feedback</th>
              <th className="pb-2">Complete</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => (
              <tr key={m.systemId} className="border-b border-white/5">
                <td className="py-3 pr-4">
                  <p className="font-medium">{m.officialName}</p>
                  <p className="text-xs text-white/40">
                    {FAT_PIPELINE_STAGE_LABELS[m.pipelineStage]}
                  </p>
                </td>
                <td className="py-3 pr-4">{m.architecturePass ? '✓' : '—'}</td>
                <td className="py-3 pr-4">{m.implementationPass ? '✓' : '—'}</td>
                <td className={`py-3 pr-4 ${gateStatusColor(m.founderAcceptanceStatus)}`}>
                  {m.founderAcceptanceStatus}
                </td>
                <td className="py-3 pr-4">{m.genesisFeedbackComplete ? '✓' : '—'}</td>
                <td className="py-3">{m.launchStackComplete ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FatPanel>
  );
}

function MetricTrendsView({ trends }: { trends: FatMetricTrendPoint[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {trends.map((trend) => (
        <FatPanel key={trend.metricId} title={trend.label}>
          <p className={`text-2xl font-semibold ${scoreColor(trend.currentScore)}`}>
            {trend.currentScore}
            <span className="ml-2 text-sm text-white/40">
              {trend.delta30d >= 0 ? '+' : ''}
              {trend.delta30d} 30d
            </span>
          </p>
          <div className="mt-3 flex items-end gap-1 h-12">
            {trend.points.map((p) => (
              <div
                key={p.date}
                className="flex-1 rounded-t bg-rose-500/40"
                style={{ height: `${Math.max(8, p.score)}%` }}
                title={`${p.date}: ${p.score}`}
              />
            ))}
          </div>
        </FatPanel>
      ))}
    </div>
  );
}

function GenesisLearningsView({
  learnings,
}: {
  learnings: ReturnType<typeof useFounderAcceptanceTestingState>['view']['genesisLearnings'];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {learnings.map((learning) => (
        <FatPanel key={learning.learningId} title={learning.systemName}>
          <p className="text-sm text-white/70">{learning.summary}</p>
          {learning.assumptionsChanged.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wider text-white/40">Assumptions changed</p>
              <ul className="mt-1 list-inside list-disc text-xs text-white/60">
                {learning.assumptionsChanged.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {learning.genesisUpdates.length > 0 && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wider text-white/40">Genesis updates</p>
              <ul className="mt-1 list-inside list-disc text-xs text-white/60">
                {learning.genesisUpdates.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          )}
        </FatPanel>
      ))}
    </div>
  );
}

function OutstandingIssuesView({
  issues,
}: {
  issues: ReturnType<typeof useFounderAcceptanceTestingState>['view']['outstandingIssues'];
}) {
  if (issues.length === 0) {
    return (
      <FatPanel title="Outstanding Issues™">
        <p className="text-sm text-emerald-300">No outstanding validation issues.</p>
      </FatPanel>
    );
  }

  return (
    <ul className="space-y-3">
      {issues.map((issue) => (
        <li key={issue.issueId}>
          <FatPanel title={`${issue.severity.toUpperCase()} · ${issue.systemId}`}>
            <p className="font-medium">{issue.title}</p>
            <p className="mt-1 text-sm text-white/60">{issue.detail}</p>
            {issue.blocksGraduation && (
              <p className="mt-2 text-xs uppercase tracking-wider text-red-300/80">
                Blocks graduation
              </p>
            )}
          </FatPanel>
        </li>
      ))}
    </ul>
  );
}

function GraduatedSystemsView({
  systems,
}: {
  systems: ReturnType<typeof useFounderAcceptanceTestingState>['view']['graduatedSystems'];
}) {
  if (systems.length === 0) {
    return (
      <FatPanel title="Graduated Systems™">
        <p className="text-sm text-white/60">
          No systems have graduated yet. Build Order™ is the first candidate.
        </p>
      </FatPanel>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {systems.map((sys) => (
        <FatPanel key={sys.systemId} title={sys.officialName}>
          <p className="text-sm">
            Founder score:{' '}
            <span className={scoreColor(sys.founderAcceptanceScore)}>
              {sys.founderAcceptanceScore}/100
            </span>
          </p>
          <p className="mt-1 text-xs text-white/50">
            Graduated {new Date(sys.graduatedAt).toLocaleDateString()} · {sys.evidenceCount}{' '}
            evidence items
          </p>
          <p className="mt-2 text-xs text-white/40">
            Levels: {sys.levelsGraduated.join(', ')}
          </p>
        </FatPanel>
      ))}
    </div>
  );
}
