import { useState } from 'react';
import { useBusinessSimulationLabState } from '../../../../hooks/useBusinessSimulationLabState';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';
import {
  LAB_SIMULATION_LABELS,
  LAB_SIMULATION_TYPES,
  SIMULATION_LAB_PHILOSOPHY,
  listSuggestedLabSimulations,
} from '../../../../studio-os-core/business-simulation-lab';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';

type LabTab = 'overview' | 'run' | 'reports' | 'library';

const TABS: { id: LabTab; label: string }[] = [
  { id: 'overview', label: 'LAB OVERVIEW' },
  { id: 'run', label: 'RUN SIMULATION' },
  { id: 'reports', label: 'SIMULATION REPORTS' },
  { id: 'library', label: 'SCENARIO LIBRARY' },
];

const ACCENT = '#0284C7';

export function BusinessSimulationLabWorkspace() {
  const [tab, setTab] = useState<LabTab>('overview');
  const [query, setQuery] = useState('');
  const { profile, lastReport, refresh, runSimulation, resolveDecision } = useBusinessSimulationLabState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        BUSINESS SIMULATION LAB™ LOADING — STRATEGIC SANDBOX INITIALIZING
      </p>
    );
  }

  const suggestions = listSuggestedLabSimulations(profile);
  const activeReport = lastReport ?? profile.reports[0] ?? null;

  const handleRun = () => {
    const q = query.trim();
    if (!q) return;
    runSimulation(q);
    setTab('reports');
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 104 · BUSINESS SIMULATION LAB"
        title={profile.companyName.toUpperCase()}
        subtitle="Practice tomorrow before living it — test strategies safely before implementing."
        progressPct={profile.labReadinessScore}
        stats={[
          { label: 'READINESS', value: `${profile.labReadinessScore}%` },
          { label: 'SIMULATIONS', value: String(profile.totalSimulationsRun) },
          { label: 'PENDING', value: String(profile.scenariosPendingDecision) },
          { label: 'TYPES', value: String(LAB_SIMULATION_TYPES.length) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.labReadinessScore} size={56} label="LAB" accent={ACCENT} />
        <div>
          {SIMULATION_LAB_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveFocusPanel title={`${LAB_SIMULATION_TYPES.length} STRATEGIC SIMULATION TYPES`}>
        {LAB_SIMULATION_TYPES.slice(0, 7).map((type) => (
          <p key={type} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {LAB_SIMULATION_LABELS[type]}
          </p>
        ))}
        <p className="text-[6px] font-futura" style={{ color: ACCENT }}>
          + {LAB_SIMULATION_TYPES.length - 7} more — virtually any strategic initiative
        </p>
      </ExecutiveFocusPanel>
      <button
        type="button"
        onClick={refresh}
        className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        REFRESH LAB
      </button>
    </ExecutivePageShell>
  );

  const renderRun = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RUN STRATEGIC SIMULATION · SANDBOX ONLY">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "Simulate a 20% marketing campaign increase next quarter"'
          className="w-full min-h-[48px] p-2 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        <button
          type="button"
          onClick={handleRun}
          className="px-2 py-1 text-[6px] font-futura uppercase border mb-3"
          style={{ borderColor: ACCENT, color: ACCENT, background: 'rgba(2,132,199,0.06)' }}
        >
          GENERATE SIMULATION REPORT →
        </button>
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              runSimulation(s);
              setTab('reports');
            }}
            className="block w-full text-left mb-1 px-2 py-1 text-[6px] font-futura border"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
          >
            {s}
          </button>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderReport = (report: NonNullable<typeof activeReport> | null) => {
    if (!report) {
      return (
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          No simulation reports yet — run a strategic simulation to generate an executive report.
        </p>
      );
    }

    return (
      <ExecutiveSecondaryCard key={report.id} title={report.scenarioTitle.toUpperCase()}>
        <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
          {LAB_SIMULATION_LABELS[report.simulationType]} · Confidence {report.confidenceScore}% · Sandbox
        </p>
        <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          <span style={{ color: '#6366F1' }}>Executive Summary:</span> {report.executiveSummary.slice(0, 160)}
        </p>
        {report.predictedOutcomes.map((o) => (
          <p key={o} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            · {o.slice(0, 120)}
          </p>
        ))}
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          <span style={{ color: '#D97706' }}>Revenue:</span> {report.revenueImpact.slice(0, 100)}
        </p>
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          <span style={{ color: '#0891B2' }}>Customer:</span> {report.customerImpact.slice(0, 100)}
        </p>
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          <span style={{ color: '#16A34A' }}>Operational:</span> {report.operationalImpact.slice(0, 100)}
        </p>
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          <span style={{ color: '#B45309' }}>Council Review:</span> {report.councilReview.summary.slice(0, 120)}
        </p>
        {report.alternativeStrategies.slice(0, 2).map((alt) => (
          <p key={alt} className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Alt: {alt}
          </p>
        ))}
      </ExecutiveSecondaryCard>
    );
  };

  const renderReports = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`SIMULATION REPORTS · ${profile.reports.length} COMPLETED`}>
        {profile.reports.length === 0 ? renderReport(null) : profile.reports.map((r) => renderReport(r))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderLibrary = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`SCENARIO LIBRARY · TRACK DECISIONS & LESSONS`}>
        {profile.scenarioLibrary.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Completed simulations appear here with decision tracking and lessons learned.
          </p>
        ) : (
          profile.scenarioLibrary.map((entry) => (
            <ExecutiveSecondaryCard key={entry.id} title={entry.scenario.toUpperCase()}>
              <p className="text-[6px] font-futura mb-1" style={{ color: ACCENT }}>
                {new Date(entry.date).toLocaleDateString()} · {entry.decision.toUpperCase()} · {entry.confidenceScore}%
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Outcome: {entry.outcome.slice(0, 120)}
              </p>
              {entry.decision === 'pending' && (
                <div className="flex gap-1 flex-wrap">
                  {(['approved', 'deferred', 'rejected'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => resolveDecision(entry.id, d)}
                      className="px-2 py-0.5 text-[5px] font-futura uppercase border"
                      style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
              {entry.lessonsLearned.length > 0 && (
                <p className="text-[6px] font-futura mt-1" style={{ color: '#16A34A' }}>
                  Lesson: {entry.lessonsLearned[0]}
                </p>
              )}
            </ExecutiveSecondaryCard>
          ))
        )}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'run':
        return renderRun();
      case 'reports':
        return renderReports();
      case 'library':
        return renderLibrary();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="business-simulation-lab" className="mb-2" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(2,132,199,0.06)' : 'white',
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
