import { useMemo, useState } from 'react';
import {
  type GenesisCompileTargetId,
  GENESIS_KERNEL_DOCTRINE,
  compileGenesisTargets,
} from '../../../../studio-os-core/genesis';
import { useGenesisState } from '../../../../hooks/useGenesisState';

function GenesisPanel({
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
 * Genesis Foundation Framework™ — canonical source infrastructure workspace.
 * No hardcoded Studio World content — framework and pipelines only.
 */
export function GenesisWorkspace() {
  const {
    stats,
    objects,
    proposals,
    adrs,
    reviews,
    compileManifests,
    pipelineStages,
    frameworkModules,
    compileTargets,
    objectSchemaTypes,
    refresh,
  } = useGenesisState();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'registry' | 'pipelines' | 'schemas' | 'compiler'
  >('overview');
  const [lastCompileMessage, setLastCompileMessage] = useState<string | null>(null);

  const latestManifest = compileManifests[compileManifests.length - 1];

  const pipelineSummary = useMemo(
    () =>
      pipelineStages.map((stage) => ({
        stage,
        count: objects.filter((o) => o.pipelineStage === stage).length,
      })),
    [objects, pipelineStages]
  );

  const handleCompile = () => {
    const manifest = compileGenesisTargets();
    setLastCompileMessage(
      `Compiled ${manifest.sourceObjectCount} objects into ${manifest.targets.length} targets (${manifest.compileId})`
    );
    refresh();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 text-white">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400/80">
              Genesis Foundation Framework™
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Genesis Kernel</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              {GENESIS_KERNEL_DOCTRINE.posture} Framework v{stats.frameworkVersion} — infrastructure
              only, no canonical content.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
          >
            Sync Registry
          </button>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-white/40">Objects</span>
            <p className="font-medium">{stats.objectCount}</p>
          </div>
          <div>
            <span className="text-white/40">Canonical</span>
            <p className="font-medium">{stats.canonicalCount}</p>
          </div>
          <div>
            <span className="text-white/40">Proposals</span>
            <p className="font-medium">{stats.proposalCount}</p>
          </div>
          <div>
            <span className="text-white/40">ADRs</span>
            <p className="font-medium">{stats.adrCount}</p>
          </div>
          <div>
            <span className="text-white/40">Review queue</span>
            <p className="font-medium">{stats.reviewQueue}</p>
          </div>
          <div>
            <span className="text-white/40">Relationships</span>
            <p className="font-medium">{stats.relationshipCount}</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {(
            [
              ['overview', 'Overview'],
              ['registry', 'Genesis Registry™'],
              ['pipelines', 'Pipelines'],
              ['schemas', 'Canonical Object Model™'],
              ['compiler', 'Compilation Pipeline™'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider ${
                activeTab === id
                  ? 'bg-violet-500/20 text-violet-200'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <GenesisPanel title="Kernel Doctrine">
            <p className="text-sm text-violet-200/90">{GENESIS_KERNEL_DOCTRINE.rule}</p>
            <p className="mt-2 text-sm text-white/60">Charter: {GENESIS_KERNEL_DOCTRINE.charterPath}</p>
          </GenesisPanel>
          <GenesisPanel title="Framework Modules">
            <ul className="flex flex-wrap gap-2 text-xs text-white/70">
              {frameworkModules.map((mod) => (
                <li key={mod} className="rounded bg-white/5 px-2 py-1">
                  /{mod}
                </li>
              ))}
            </ul>
          </GenesisPanel>
          <GenesisPanel title="Lifecycle Pipeline">
            <ol className="space-y-1 text-sm text-white/70">
              {pipelineStages.map((stage) => (
                <li key={stage}>
                  {stage}{' '}
                  <span className="text-white/40">
                    ({pipelineSummary.find((p) => p.stage === stage)?.count ?? 0})
                  </span>
                </li>
              ))}
            </ol>
          </GenesisPanel>
          <GenesisPanel title="Object Schema Types">
            <p className="text-sm text-white/60">{objectSchemaTypes.length} canonical object types registered.</p>
          </GenesisPanel>
        </div>
      )}

      {activeTab === 'registry' && (
        <GenesisPanel title="Genesis Registry™">
          {objects.length === 0 ? (
            <p className="text-sm text-white/50">
              Registry empty — submit a proposal to create the first Genesis object.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {objects.map((obj) => (
                <li key={obj.objectId} className="rounded bg-white/5 px-3 py-2">
                  <span className="font-medium text-violet-200">{obj.title}</span>
                  <span className="ml-2 text-white/40">{obj.objectId}</span>
                  <span className="ml-2 text-xs text-white/30">{obj.pipelineStage}</span>
                </li>
              ))}
            </ul>
          )}
        </GenesisPanel>
      )}

      {activeTab === 'pipelines' && (
        <div className="grid gap-4 md:grid-cols-2">
          <GenesisPanel title="Proposal Pipeline™">
            {proposals.length === 0 ? (
              <p className="text-sm text-white/50">No proposals yet.</p>
            ) : (
              <ul className="space-y-2 text-sm text-white/70">
                {proposals.map((p) => (
                  <li key={p.proposalId}>
                    {p.title} — {p.status} ({p.pipelineStage})
                  </li>
                ))}
              </ul>
            )}
          </GenesisPanel>
          <GenesisPanel title="ADR Pipeline™">
            {adrs.length === 0 ? (
              <p className="text-sm text-white/50">No ADRs yet.</p>
            ) : (
              <ul className="space-y-2 text-sm text-white/70">
                {adrs.map((a) => (
                  <li key={a.adrId}>
                    {a.title} — {a.status}
                  </li>
                ))}
              </ul>
            )}
          </GenesisPanel>
          <GenesisPanel title="Review Pipeline™">
            {reviews.length === 0 ? (
              <p className="text-sm text-white/50">Review queue empty.</p>
            ) : (
              <ul className="space-y-2 text-sm text-white/70">
                {reviews.map((r) => (
                  <li key={r.sessionId}>
                    {r.objectId} — {r.stage} ({r.status})
                  </li>
                ))}
              </ul>
            )}
          </GenesisPanel>
        </div>
      )}

      {activeTab === 'schemas' && (
        <GenesisPanel title="Canonical Object Model™">
          <ul className="grid gap-2 md:grid-cols-2 text-sm">
            {objectSchemaTypes.map((type) => (
              <li key={type} className="rounded bg-white/5 px-3 py-2 text-white/70">
                {type}
              </li>
            ))}
          </ul>
        </GenesisPanel>
      )}

      {activeTab === 'compiler' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCompile}
              className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-500/20"
            >
              Run Compilation Pipeline™
            </button>
            {lastCompileMessage && (
              <p className="text-sm text-white/60">{lastCompileMessage}</p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {compileTargets.map((target) => (
              <GenesisPanel key={target.id} title={target.title}>
                <p className="mb-2 text-sm text-white/60">{target.purpose}</p>
                <p className="text-xs text-white/40">{target.outputRoot}</p>
              </GenesisPanel>
            ))}
          </div>
          {latestManifest && (
            <GenesisPanel title="Latest Compile Manifest">
              <p className="text-sm text-white/70">
                {latestManifest.compileId} · {latestManifest.sourceObjectCount} sources ·{' '}
                {latestManifest.generatedAt}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-white/50">
                {latestManifest.targets.map((t) => (
                  <li key={t.targetId}>
                    {(t.targetId as GenesisCompileTargetId)} — {t.objectCount} objects
                  </li>
                ))}
              </ul>
            </GenesisPanel>
          )}
        </div>
      )}
    </div>
  );
}
