import { useMemo, useState } from 'react';
import {
  type GenesisCompileTargetId,
  GENESIS_KERNEL_DOCTRINE,
  compileGenesisTargets,
} from '../../../../studio-os-core/genesis';
import { useGenesisState } from '../../../../hooks/useGenesisState';
import { useConstitutionState } from '../../../../hooks/useConstitutionState';
import { useObjectModelState } from '../../../../hooks/useObjectModelState';
import { useInteractionModelState } from '../../../../hooks/useInteractionModelState';
import { useDecisionEngineState } from '../../../../hooks/useDecisionEngineState';
import { useCoreSystemsState } from '../../../../hooks/useCoreSystemsState';

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

  const {
    stats: constitutionStats,
    articles: constitutionArticles,
    amendments: constitutionAmendments,
    openAmendments,
    reviews: constitutionReviews,
    relationships: constitutionRelationships,
    historicalArchive,
    amendmentStages,
    refresh: refreshConstitution,
  } = useConstitutionState();

  const {
    stats: objectModelStats,
    objects: canonicalObjects,
    objectTypes: canonicalObjectTypes,
    relationships: objectModelRelationships,
    historicalArchive: objectModelHistory,
    validation: objectModelValidation,
    coreRelationshipTypes,
    refresh: refreshObjectModel,
  } = useObjectModelState();

  const {
    stats: interactionModelStats,
    interactions: studioInteractions,
    events: studioEvents,
    workflows: studioWorkflows,
    commands: studioCommands,
    auditLog: interactionAuditLog,
    interactionTypes: canonicalInteractionTypes,
    eventCategoryCoverage,
    validation: interactionModelValidation,
    refresh: refreshInteractionModel,
  } = useInteractionModelState();

  const {
    stats: decisionEngineStats,
    decisions: studioDecisions,
    recommendations: studioRecommendations,
    priorities: studioPriorities,
    strategies: studioStrategies,
    auditLog: decisionAuditLog,
    history: decisionHistory,
    decisionTypes: canonicalDecisionTypes,
    validation: decisionEngineValidation,
    refresh: refreshDecisionEngine,
  } = useDecisionEngineState();

  const {
    stats: coreSystemsStats,
    systems: coreSystems,
    dependencies: coreSystemDependencies,
    capabilities: coreSystemCapabilities,
    boundaries: coreSystemBoundaries,
    contracts: coreSystemContracts,
    expansionHooks: coreSystemExpansionHooks,
    canonicalCoverage: coreSystemCanonicalCoverage,
    circularDependencies: coreSystemCircularDeps,
    lifecycleSummary: coreSystemLifecycleSummary,
    validation: coreSystemsValidation,
    canonicalSystems,
    refresh: refreshCoreSystems,
  } = useCoreSystemsState();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'registry'
    | 'pipelines'
    | 'schemas'
    | 'compiler'
    | 'constitution'
    | 'object-model'
    | 'interaction-model'
    | 'decision-engine'
    | 'core-systems'
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
            onClick={() => {
              refresh();
              refreshConstitution();
              refreshObjectModel();
              refreshInteractionModel();
              refreshDecisionEngine();
              refreshCoreSystems();
            }}
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
              ['constitution', 'Constitution™'],
              ['object-model', 'Object Model™'],
              ['interaction-model', 'Interactions™'],
              ['decision-engine', 'Decisions™'],
              ['core-systems', 'Core Systems™'],
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

      {activeTab === 'constitution' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-white/40">Articles</span>
              <p className="font-medium">{constitutionStats.articleCount}</p>
            </div>
            <div>
              <span className="text-white/40">Canonical</span>
              <p className="font-medium">{constitutionStats.canonicalCount}</p>
            </div>
            <div>
              <span className="text-white/40">Amendments</span>
              <p className="font-medium">{constitutionStats.amendmentCount}</p>
            </div>
            <div>
              <span className="text-white/40">Open amendments</span>
              <p className="font-medium">{constitutionStats.openAmendments}</p>
            </div>
            <div>
              <span className="text-white/40">Relationships</span>
              <p className="font-medium">{constitutionStats.relationshipCount}</p>
            </div>
            <div>
              <span className="text-white/40">Historical</span>
              <p className="font-medium">{constitutionStats.historicalEntries}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <GenesisPanel title="Constitution Registry™">
              {constitutionArticles.length === 0 ? (
                <p className="text-sm text-white/50">
                  Registry empty — ingest articles via{' '}
                  <code className="text-violet-300">registerConstitutionArticle()</code> or batch
                  payload loader. No engineering changes required.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {constitutionArticles.map((article) => (
                    <li key={article.articleId} className="rounded bg-white/5 px-3 py-2">
                      <span className="font-medium text-violet-200">{article.officialName}</span>
                      <span className="ml-2 text-white/40">{article.articleId}</span>
                      <span className="ml-2 text-xs text-white/30">{article.canonicalStatus}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Amendment Workflow™">
              <ol className="mb-3 space-y-1 text-sm text-white/70">
                {amendmentStages.map((stage) => (
                  <li key={stage}>{stage}</li>
                ))}
              </ol>
              {constitutionAmendments.length === 0 ? (
                <p className="text-sm text-white/50">No amendments yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {openAmendments.slice(0, 5).map((a) => (
                    <li key={a.amendmentId}>
                      {a.title} — {a.stage} ({a.status})
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Constitution Relationship Graph™">
              {constitutionRelationships.length === 0 ? (
                <p className="text-sm text-white/50">No relationships yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {constitutionRelationships.slice(0, 8).map((rel) => (
                    <li key={rel.id}>
                      {rel.fromArticleId} → {rel.type} → {rel.toArticleId}
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Historical Archive™">
              {historicalArchive.length === 0 ? (
                <p className="text-sm text-white/50">No archived revisions yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {historicalArchive.slice(0, 5).map((entry) => (
                    <li key={entry.historyId}>
                      {entry.articleId} — {entry.reason}
                    </li>
                  ))}
                </ul>
              )}
              {constitutionReviews.length > 0 && (
                <p className="mt-3 text-xs text-white/40">
                  {constitutionReviews.length} review session(s) pending
                </p>
              )}
            </GenesisPanel>
          </div>
        </div>
      )}

      {activeTab === 'object-model' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-white/40">Objects</span>
              <p className="font-medium">{objectModelStats.objectCount}</p>
            </div>
            <div>
              <span className="text-white/40">Canonical</span>
              <p className="font-medium">{objectModelStats.canonicalCount}</p>
            </div>
            <div>
              <span className="text-white/40">Types in use</span>
              <p className="font-medium">{objectModelStats.typeCount}</p>
            </div>
            <div>
              <span className="text-white/40">Relationships</span>
              <p className="font-medium">{objectModelStats.relationshipCount}</p>
            </div>
            <div>
              <span className="text-white/40">Validation</span>
              <p className="font-medium">{objectModelValidation.valid ? 'PASS' : 'ISSUES'}</p>
            </div>
            <div>
              <span className="text-white/40">Historical</span>
              <p className="font-medium">{objectModelStats.historicalEntryCount}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <GenesisPanel title="Canonical Object Registry™">
              {canonicalObjects.length === 0 ? (
                <p className="text-sm text-white/50">
                  Registry empty — register via{' '}
                  <code className="text-violet-300">registerCanonicalObject()</code> or batch
                  ingest. {canonicalObjectTypes.length} object types available.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {canonicalObjects.map((obj) => (
                    <li key={obj.objectId} className="rounded bg-white/5 px-3 py-2">
                      <span className="font-medium text-violet-200">{obj.officialName}</span>
                      <span className="ml-2 text-white/40">{obj.objectId}</span>
                      <span className="ml-2 text-xs text-white/30">{obj.objectType}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Relationship Engine™">
              <p className="mb-2 text-xs text-white/40">
                {coreRelationshipTypes.length} core verbs · extensible via string type
              </p>
              {objectModelRelationships.length === 0 ? (
                <p className="text-sm text-white/50">No relationships yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {objectModelRelationships.slice(0, 8).map((rel) => (
                    <li key={rel.id}>
                      {rel.fromObjectId} → {rel.type} → {rel.toObjectId}
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Object Types™">
              <p className="mb-2 text-sm text-white/60">
                {canonicalObjectTypes.length} canonical types across kernel, civilization, people,
                work, experience, economy, and contracts families.
              </p>
              <ul className="flex flex-wrap gap-1 text-xs text-white/50">
                {canonicalObjectTypes.slice(0, 24).map((t) => (
                  <li key={t.id} className="rounded bg-white/5 px-2 py-0.5">
                    {t.id}
                  </li>
                ))}
                {canonicalObjectTypes.length > 24 && (
                  <li className="text-white/30">+{canonicalObjectTypes.length - 24} more</li>
                )}
              </ul>
            </GenesisPanel>

            <GenesisPanel title="Validation & History">
              {!objectModelValidation.valid && (
                <ul className="mb-3 space-y-1 text-xs text-amber-200/80">
                  {objectModelValidation.issues.slice(0, 5).map((issue, i) => (
                    <li key={`${issue.code}-${i}`}>{issue.message}</li>
                  ))}
                </ul>
              )}
              {objectModelHistory.length === 0 ? (
                <p className="text-sm text-white/50">No archived revisions yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {objectModelHistory.slice(0, 5).map((entry) => (
                    <li key={entry.historyId}>
                      {entry.objectId} — {entry.reason}
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>
          </div>
        </div>
      )}

      {activeTab === 'interaction-model' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-white/40">Interactions</span>
              <p className="font-medium">{interactionModelStats.interactionCount}</p>
            </div>
            <div>
              <span className="text-white/40">Pending</span>
              <p className="font-medium">{interactionModelStats.pendingInteractionCount}</p>
            </div>
            <div>
              <span className="text-white/40">Events</span>
              <p className="font-medium">{interactionModelStats.eventCount}</p>
            </div>
            <div>
              <span className="text-white/40">Workflows</span>
              <p className="font-medium">{interactionModelStats.workflowCount}</p>
            </div>
            <div>
              <span className="text-white/40">Commands</span>
              <p className="font-medium">{interactionModelStats.commandCount}</p>
            </div>
            <div>
              <span className="text-white/40">Audit entries</span>
              <p className="font-medium">{interactionModelStats.auditEntryCount}</p>
            </div>
            <div>
              <span className="text-white/40">Validation</span>
              <p className="font-medium">{interactionModelValidation.valid ? 'PASS' : 'ISSUES'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <GenesisPanel title="Interaction Registry™">
              {studioInteractions.length === 0 ? (
                <p className="text-sm text-white/50">
                  Registry empty — submit via{' '}
                  <code className="text-violet-300">submitStudioInteraction()</code> or batch
                  ingest. {canonicalInteractionTypes.length} interaction types available.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {studioInteractions.map((interaction) => (
                    <li key={interaction.interactionId} className="rounded bg-white/5 px-3 py-2">
                      <span className="font-medium text-violet-200">{interaction.officialName}</span>
                      <span className="ml-2 text-white/40">{interaction.interactionId}</span>
                      <span className="ml-2 text-xs text-white/30">{interaction.interactionType}</span>
                      <span className="ml-2 text-xs text-white/30">{interaction.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Event Bus™">
              <p className="mb-2 text-xs text-white/40">
                {eventCategoryCoverage.length} event categories · domain, system, user, ai, knowledge,
                marketplace, company, mission, learning
              </p>
              {studioEvents.length === 0 ? (
                <p className="text-sm text-white/50">No events emitted yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {studioEvents.slice(0, 8).map((event) => (
                    <li key={event.eventId}>
                      {event.officialName} — {event.category} ({event.eventType})
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Workflow Composer™">
              {studioWorkflows.length === 0 ? (
                <p className="text-sm text-white/50">
                  No workflows composed yet — use{' '}
                  <code className="text-violet-300">composeStudioWorkflow()</code>.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {studioWorkflows.map((workflow) => (
                    <li key={workflow.workflowId}>
                      {workflow.officialName} — {workflow.status} ({workflow.steps.length} steps)
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Command Registry™">
              {studioCommands.length === 0 ? (
                <p className="text-sm text-white/50">No commands issued yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {studioCommands.slice(0, 8).map((command) => (
                    <li key={command.commandId}>
                      {command.officialName} — {command.commandType} ({command.status})
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Interaction Types™">
              <p className="mb-2 text-sm text-white/60">
                {canonicalInteractionTypes.length} canonical interaction primitives.
              </p>
              <ul className="flex flex-wrap gap-1 text-xs text-white/50">
                {canonicalInteractionTypes.slice(0, 28).map((t) => (
                  <li key={t.id} className="rounded bg-white/5 px-2 py-0.5">
                    {t.id}
                  </li>
                ))}
              </ul>
            </GenesisPanel>

            <GenesisPanel title="Audit Engine™">
              {!interactionModelValidation.valid && (
                <ul className="mb-3 space-y-1 text-xs text-amber-200/80">
                  {interactionModelValidation.issues.slice(0, 5).map((issue, i) => (
                    <li key={`${issue.code}-${i}`}>{issue.message}</li>
                  ))}
                </ul>
              )}
              {interactionAuditLog.length === 0 ? (
                <p className="text-sm text-white/50">No audit entries yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {interactionAuditLog.slice(0, 8).map((entry) => (
                    <li key={entry.auditId}>
                      {entry.action} — {entry.level}
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>
          </div>
        </div>
      )}

      {activeTab === 'decision-engine' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-white/40">Decisions</span>
              <p className="font-medium">{decisionEngineStats.decisionCount}</p>
            </div>
            <div>
              <span className="text-white/40">Pending</span>
              <p className="font-medium">{decisionEngineStats.pendingDecisionCount}</p>
            </div>
            <div>
              <span className="text-white/40">Recommendations</span>
              <p className="font-medium">{decisionEngineStats.recommendationCount}</p>
            </div>
            <div>
              <span className="text-white/40">Priorities</span>
              <p className="font-medium">{decisionEngineStats.priorityCount}</p>
            </div>
            <div>
              <span className="text-white/40">Strategies</span>
              <p className="font-medium">{decisionEngineStats.strategyCount}</p>
            </div>
            <div>
              <span className="text-white/40">Pending review</span>
              <p className="font-medium">{decisionEngineStats.pendingReviewCount}</p>
            </div>
            <div>
              <span className="text-white/40">Validation</span>
              <p className="font-medium">{decisionEngineValidation.valid ? 'PASS' : 'ISSUES'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <GenesisPanel title="Decision Registry™">
              {studioDecisions.length === 0 ? (
                <p className="text-sm text-white/50">
                  Registry empty — submit via{' '}
                  <code className="text-violet-300">submitStudioDecision()</code> or batch
                  ingest. {canonicalDecisionTypes.length} decision types available.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {studioDecisions.map((decision) => (
                    <li key={decision.decisionId} className="rounded bg-white/5 px-3 py-2">
                      <span className="font-medium text-violet-200">{decision.officialName}</span>
                      <span className="ml-2 text-white/40">{decision.decisionId}</span>
                      <span className="ml-2 text-xs text-white/30">{decision.decisionType}</span>
                      <span className="ml-2 text-xs text-white/30">{decision.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Recommendation Engine™">
              {studioRecommendations.length === 0 ? (
                <p className="text-sm text-white/50">
                  No recommendations yet — use{' '}
                  <code className="text-violet-300">issueStudioRecommendation()</code>.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {studioRecommendations.slice(0, 8).map((rec) => (
                    <li key={rec.recommendationId}>
                      {rec.officialName} — {rec.status} ({rec.confidence.level})
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Priority Engine™">
              {studioPriorities.length === 0 ? (
                <p className="text-sm text-white/50">No priority rankings yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {studioPriorities.map((pri) => (
                    <li key={pri.priorityId}>
                      {pri.level} — {pri.rankedItems.length} items ranked
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Context & Evidence">
              <p className="mb-2 text-sm text-white/60">
                Context Engine™, Evidence Model™, Confidence Model™ — every decision carries
                intent, context, evidence, and declared confidence.
              </p>
              {studioStrategies.length === 0 ? (
                <p className="text-sm text-white/50">No strategies registered yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {studioStrategies.map((str) => (
                    <li key={str.strategyId}>
                      {str.officialName} — {str.status}
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Decision Types™">
              <p className="mb-2 text-sm text-white/60">
                {canonicalDecisionTypes.length} canonical decision primitives.
              </p>
              <ul className="flex flex-wrap gap-1 text-xs text-white/50">
                {canonicalDecisionTypes.slice(0, 22).map((t) => (
                  <li key={t.id} className="rounded bg-white/5 px-2 py-0.5">
                    {t.id}
                  </li>
                ))}
              </ul>
            </GenesisPanel>

            <GenesisPanel title="Decision Audit & History">
              {!decisionEngineValidation.valid && (
                <ul className="mb-3 space-y-1 text-xs text-amber-200/80">
                  {decisionEngineValidation.issues.slice(0, 5).map((issue, i) => (
                    <li key={`${issue.code}-${i}`}>{issue.message}</li>
                  ))}
                </ul>
              )}
              {decisionAuditLog.length === 0 && decisionHistory.length === 0 ? (
                <p className="text-sm text-white/50">No audit or history entries yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {decisionAuditLog.slice(0, 4).map((entry) => (
                    <li key={entry.auditId}>
                      {entry.action} — {entry.level}
                    </li>
                  ))}
                  {decisionHistory.slice(0, 4).map((entry) => (
                    <li key={entry.historyId}>
                      {entry.decisionId} — {entry.summary}
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>
          </div>
        </div>
      )}

      {activeTab === 'core-systems' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-white/40">Systems</span>
              <p className="font-medium">{coreSystemsStats.systemCount}</p>
            </div>
            <div>
              <span className="text-white/40">Active</span>
              <p className="font-medium">{coreSystemsStats.activeSystemCount}</p>
            </div>
            <div>
              <span className="text-white/40">Dependencies</span>
              <p className="font-medium">{coreSystemsStats.dependencyCount}</p>
            </div>
            <div>
              <span className="text-white/40">Capabilities</span>
              <p className="font-medium">{coreSystemsStats.capabilityCount}</p>
            </div>
            <div>
              <span className="text-white/40">Boundaries</span>
              <p className="font-medium">{coreSystemsStats.boundaryCount}</p>
            </div>
            <div>
              <span className="text-white/40">Contracts</span>
              <p className="font-medium">{coreSystemsStats.contractCount}</p>
            </div>
            <div>
              <span className="text-white/40">Validation</span>
              <p className="font-medium">{coreSystemsValidation.valid ? 'PASS' : 'ISSUES'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <GenesisPanel title="System Registry™">
              {coreSystems.length === 0 ? (
                <p className="text-sm text-white/50">
                  Registry empty — register via{' '}
                  <code className="text-violet-300">registerCoreSystem()</code> or batch
                  ingest. {canonicalSystems.length} canonical system IDs defined in blueprint.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {coreSystems.map((system) => (
                    <li key={system.systemId} className="rounded bg-white/5 px-3 py-2">
                      <span className="font-medium text-violet-200">{system.officialName}</span>
                      <span className="ml-2 text-white/40">{system.systemId}</span>
                      <span className="ml-2 text-xs text-white/30">{system.domain}</span>
                      <span className="ml-2 text-xs text-white/30">{system.lifecycleState}</span>
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Dependency Registry™">
              {coreSystemDependencies.length === 0 ? (
                <p className="text-sm text-white/50">
                  No dependencies registered — use{' '}
                  <code className="text-violet-300">registerSystemDependency()</code>.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {coreSystemDependencies.slice(0, 8).map((dep) => (
                    <li key={dep.dependencyId}>
                      {dep.fromSystemId} → {dep.relationType} → {dep.toSystemId}
                    </li>
                  ))}
                </ul>
              )}
              {coreSystemCircularDeps.length > 0 && (
                <p className="mt-2 text-xs text-amber-200/80">
                  {coreSystemCircularDeps.length} circular dependency cycle(s) detected
                </p>
              )}
            </GenesisPanel>

            <GenesisPanel title="Capability Registry™">
              {coreSystemCapabilities.length === 0 ? (
                <p className="text-sm text-white/50">No capabilities registered yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {coreSystemCapabilities.slice(0, 8).map((cap) => (
                    <li key={cap.capabilityId}>
                      {cap.systemId} — {cap.capabilityKey}
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Boundary Definitions™">
              {coreSystemBoundaries.length === 0 ? (
                <p className="text-sm text-white/50">
                  No boundaries defined — use{' '}
                  <code className="text-violet-300">defineSystemBoundary()</code>.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {coreSystemBoundaries.slice(0, 6).map((bnd) => (
                    <li key={bnd.boundaryId}>
                      {bnd.systemId} — owns {bnd.owns.length} object(s)
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Integration Contracts™">
              {coreSystemContracts.length === 0 ? (
                <p className="text-sm text-white/50">
                  No contracts registered — use{' '}
                  <code className="text-violet-300">registerIntegrationContract()</code>.
                </p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {coreSystemContracts.slice(0, 6).map((ctr) => (
                    <li key={ctr.contractId}>
                      {ctr.providerSystemId} → {ctr.interfaceName} → {ctr.consumerSystemId} (
                      {ctr.status})
                    </li>
                  ))}
                </ul>
              )}
            </GenesisPanel>

            <GenesisPanel title="Expansion Hooks & Lifecycle">
              {coreSystemExpansionHooks.length === 0 ? (
                <p className="text-sm text-white/50">No expansion hooks registered yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/70">
                  {coreSystemExpansionHooks.slice(0, 4).map((hook) => (
                    <li key={hook.hookId}>
                      {hook.systemId} — {hook.hookName} ({hook.hookType})
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-white/40">Lifecycle summary</p>
              <ul className="mt-1 flex flex-wrap gap-2 text-xs text-white/50">
                {coreSystemLifecycleSummary.map((entry) => (
                  <li key={entry.state} className="rounded bg-white/5 px-2 py-0.5">
                    {entry.state}: {entry.count}
                  </li>
                ))}
              </ul>
            </GenesisPanel>

            <GenesisPanel title="Canonical System Coverage">
              <p className="mb-2 text-sm text-white/60">
                {coreSystemCanonicalCoverage.filter((c) => c.registered).length} of{' '}
                {coreSystemCanonicalCoverage.length} blueprint systems registered.
              </p>
              <ul className="flex flex-wrap gap-1 text-xs text-white/50">
                {coreSystemCanonicalCoverage.slice(0, 26).map((item) => (
                  <li
                    key={item.systemId}
                    className={`rounded px-2 py-0.5 ${
                      item.registered ? 'bg-violet-500/20 text-violet-200' : 'bg-white/5'
                    }`}
                  >
                    {item.systemId}
                  </li>
                ))}
              </ul>
              {!coreSystemsValidation.valid && (
                <ul className="mt-3 space-y-1 text-xs text-amber-200/80">
                  {coreSystemsValidation.issues.slice(0, 5).map((issue, i) => (
                    <li key={`${issue.code}-${i}`}>{issue.message}</li>
                  ))}
                </ul>
              )}
            </GenesisPanel>
          </div>
        </div>
      )}
    </div>
  );
}
