import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PLATFORM_MATURITY_STAGE_LABELS,
  type PlatformMaturityStage,
  type SubsystemMaturityRecord,
  type DailyBriefingLine,
  type PlatformReadinessReport,
  type CanonicalTerminologyEntry,
  type HeadquartersZone,
} from '../../../../studio-os-core/headquarters-principles';
import { useHeadquartersPrinciplesState } from '../../../../hooks/useHeadquartersPrinciplesState';

function HqPanel({
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

/**
 * Headquarters Principles™ — constitutional platform governance workspace.
 * Enforces ARTICLE-C04 terminology, maturity tracking, and expansion gates.
 */
export function HeadquartersPrinciplesWorkspace() {
  const navigate = useNavigate();
  const {
    stats,
    subsystems,
    readinessReports,
    dailyBriefing,
    zones,
    terminology,
    expansion,
    refresh,
  } = useHeadquartersPrinciplesState();

  const [activeTab, setActiveTab] = useState<
    'briefing' | 'maturity' | 'readiness' | 'terminology' | 'zones'
  >('briefing');
  const [stageFilter, setStageFilter] = useState<PlatformMaturityStage | null>(null);

  const filteredSubsystems = useMemo(
    () =>
      stageFilter
        ? subsystems.filter((s: SubsystemMaturityRecord) => s.currentStage === stageFilter)
        : subsystems,
    [subsystems, stageFilter]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-400/80">
              Headquarters Principles™
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Company Headquarters™ Governance</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Studio OS is operational headquarters — not an admin dashboard. Every subsystem proves
              value internally before becoming a platform product.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20"
          >
            Sync Registry
          </button>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-white/40">Subsystems</span>
            <p className="font-medium">{stats.subsystemCount}</p>
          </div>
          <div>
            <span className="text-white/40">Avg readiness</span>
            <p className="font-medium">{stats.averageReadiness}%</p>
          </div>
          <div>
            <span className="text-white/40">Expansion eligible</span>
            <p className="font-medium">{stats.expansionEligible}</p>
          </div>
          <div>
            <span className="text-white/40">Blocked</span>
            <p className="font-medium">{stats.expansionBlocked}</p>
          </div>
          <div>
            <span className="text-white/40">HQ zones</span>
            <p className="font-medium">{stats.zoneCount}</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {(
            [
              ['briefing', 'Daily Briefing™'],
              ['maturity', 'Platform Maturity'],
              ['readiness', 'Readiness Scores'],
              ['terminology', 'Constitutional Terms'],
              ['zones', 'Headquarters Zones'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider ${
                activeTab === id
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'briefing' && (
        <div className="grid gap-4 md:grid-cols-2">
          <HqPanel title="Daily Briefing™">
            <ul className="space-y-3">
              {dailyBriefing.map((line: DailyBriefingLine) => (
                <li key={`${line.kind}-${line.title}`} className="text-sm">
                  <p className="font-medium text-sky-200/90">{line.title}</p>
                  <p className="text-white/60">{line.detail}</p>
                  {line.routePath && (
                    <button
                      type="button"
                      onClick={() => navigate(line.routePath!)}
                      className="mt-1 text-xs uppercase tracking-wider text-sky-300/80 hover:underline"
                    >
                      Enter →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </HqPanel>
          <HqPanel title="Proof Before Expansion™">
            <p className="mb-3 text-sm text-white/60">
              {expansion.eligibleCount} subsystems meet constitutional readiness.{' '}
              {expansion.blockedCount} remain internal until proof is complete.
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              {expansion.blocked.slice(0, 5).map((s: SubsystemMaturityRecord) => (
                <li key={s.subsystemId}>
                  {s.title} — {s.expansionBlockers[0] ?? 'proof in progress'}
                </li>
              ))}
            </ul>
          </HqPanel>
        </div>
      )}

      {activeTab === 'maturity' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStageFilter(null)}
              className={`rounded px-2 py-1 text-xs ${!stageFilter ? 'bg-sky-500/20' : 'bg-white/5'}`}
            >
              All stages
            </button>
            {(Object.keys(PLATFORM_MATURITY_STAGE_LABELS) as PlatformMaturityStage[]).map(
              (stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={`rounded px-2 py-1 text-xs ${stageFilter === stage ? 'bg-sky-500/20' : 'bg-white/5'}`}
                >
                  {PLATFORM_MATURITY_STAGE_LABELS[stage]}
                </button>
              )
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSubsystems.map((sub: SubsystemMaturityRecord) => (
              <HqPanel key={sub.subsystemId} title={sub.title}>
                <p className="mb-2 text-sm text-white/60">{sub.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-white/40">
                  <span>{PLATFORM_MATURITY_STAGE_LABELS[sub.currentStage]}</span>
                  <span>Readiness {sub.platformReadiness}%</span>
                  <span>{sub.expansionEligible ? 'Eligible' : 'Blocked'}</span>
                </div>
                {!sub.expansionEligible && sub.expansionBlockers[0] && (
                  <p className="mt-2 text-xs text-amber-300/80">{sub.expansionBlockers[0]}</p>
                )}
              </HqPanel>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'readiness' && (
        <div className="grid gap-4 md:grid-cols-2">
          {readinessReports.map((report: PlatformReadinessReport) => (
            <HqPanel key={report.subsystemId} title={report.title}>
              <p className="text-2xl font-semibold text-sky-200">{report.readinessScore}%</p>
              <p className="mt-1 text-sm text-white/60">
                {PLATFORM_MATURITY_STAGE_LABELS[report.currentStage]}
                {report.topGap ? ` · improve ${report.topGap.toLowerCase()}` : ''}
              </p>
            </HqPanel>
          ))}
        </div>
      )}

      {activeTab === 'terminology' && (
        <HqPanel title="Constitutional Terminology">
          <ul className="space-y-3">
            {terminology.map((entry: CanonicalTerminologyEntry) => (
              <li key={entry.legacyTerm} className="text-sm">
                <span className="text-white/40 line-through">{entry.legacyTerm}</span>
                <span className="mx-2 text-white/30">→</span>
                <span className="font-medium text-sky-200">{entry.constitutionalTerm}</span>
                <p className="mt-1 text-white/50">{entry.description}</p>
              </li>
            ))}
          </ul>
        </HqPanel>
      )}

      {activeTab === 'zones' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone: HeadquartersZone) => (
            <HqPanel key={zone.id} title={zone.title}>
              <p className="mb-2 text-sm text-white/60">{zone.purpose}</p>
              <button
                type="button"
                onClick={() => navigate(zone.routePath)}
                className="text-xs uppercase tracking-wider text-sky-300/80 hover:underline"
              >
                Enter zone →
              </button>
            </HqPanel>
          ))}
        </div>
      )}
    </div>
  );
}
