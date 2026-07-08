import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import type {
  CreativeConceptFuture,
  CreativeUniversalPipelinePhase,
  CreativeUniversalPipelineRecord,
  SceneDeconstructionLayer,
} from './creative-pipeline-types';
import { buildDefaultCreativeConcepts } from './creative-concepts';
import { defaultConceptMergeRecipe, executeConceptMerge } from './concept-merge';
import { deconstructApprovedConcept } from './concept-deconstruction';
import { analyzeConceptAssetReuse } from './concept-reuse';
import { unlockProductionPipelineAfterConceptApproval } from '../studio-builder/approval-pipeline-store';
import { runFutureTournament } from './future-tournament';
import { defaultTournamentLearning, recordTournamentLearning } from './future-tournament-learning';

const STORAGE_KEY = 'studioOsCreativeUniversalPipeline_v2';
const LEGACY_V1_KEY = 'studioOsCreativeUniversalPipeline_v1';
export const CREATIVE_UNIVERSAL_PIPELINE_EVENT = 'studio-os-creative-universal-pipeline';

type Store = { pipelines: CreativeUniversalPipelineRecord[] };

const EMPTY: Store = { pipelines: [] };

function dispatch(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CREATIVE_UNIVERSAL_PIPELINE_EVENT));
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => ({ ...EMPTY }));
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
  dispatch();
}

function migrateV1(raw: unknown): CreativeUniversalPipelineRecord {
  const v1 = raw as CreativeUniversalPipelineRecord & { version?: number };
  const concepts = v1.concepts ?? buildDefaultCreativeConcepts();
  const tournamentResult = runFutureTournament(concepts, defaultTournamentLearning());
  const finalistId = tournamentResult.finalistIds[0] ?? concepts[0]?.id ?? null;
  return {
    version: 2,
    departmentId: v1.departmentId,
    projectId: v1.projectId,
    phase: v1.approvedConceptId ? v1.phase : 'future-tournament',
    founderIntent: v1.founderIntent ?? '',
    concepts,
    activeConceptId: finalistId,
    mergeLabActive: v1.mergeLabActive ?? false,
    activeMergeRecipe: v1.activeMergeRecipe ?? null,
    mergeDraftConceptId: v1.mergeDraftConceptId ?? null,
    approvedConceptId: v1.approvedConceptId ?? null,
    approvedAt: v1.approvedAt ?? null,
    deconstructionLayers: v1.deconstructionLayers ?? [],
    warehouseAssetsAdded: v1.warehouseAssetsAdded ?? 0,
    assetReuseSummary: v1.assetReuseSummary ?? null,
    goldenBuildCertified: v1.goldenBuildCertified ?? false,
    tournamentResult,
    tournamentLearning: defaultTournamentLearning(),
    reviewChamberActive: false,
    history: v1.history ?? [],
    updatedAt: new Date().toISOString(),
  };
}

function loadPipelineFromStorage(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord | null {
  const store = readStore();
  const hit = store.pipelines.find((p) => p.departmentId === departmentId && p.projectId === projectId);
  if (hit) return hit;

  const legacy = readStudioOsJson(LEGACY_V1_KEY, () => ({ pipelines: [] as CreativeUniversalPipelineRecord[] }));
  const legacyHit = legacy.pipelines?.find(
    (p) => p.departmentId === departmentId && p.projectId === projectId
  );
  if (!legacyHit) return null;

  const migrated = migrateV1(legacyHit);
  store.pipelines.push(migrated);
  writeStore(store);
  return migrated;
}

function createPipeline(departmentId: string, projectId: string, founderIntent = ''): CreativeUniversalPipelineRecord {
  const concepts = buildDefaultCreativeConcepts(founderIntent);
  const learning = defaultTournamentLearning();
  const tournamentResult = runFutureTournament(concepts, learning);
  const now = new Date().toISOString();
  const activeConceptId = tournamentResult.finalistIds[0] ?? concepts[0]?.id ?? null;

  return {
    version: 2,
    departmentId,
    projectId,
    phase: 'future-tournament',
    founderIntent,
    concepts,
    activeConceptId,
    mergeLabActive: false,
    activeMergeRecipe: null,
    mergeDraftConceptId: null,
    approvedConceptId: null,
    approvedAt: null,
    deconstructionLayers: [],
    warehouseAssetsAdded: 0,
    assetReuseSummary: null,
    goldenBuildCertified: false,
    tournamentResult,
    tournamentLearning: learning,
    reviewChamberActive: false,
    history: [
      {
        at: now,
        label: 'Future Tournament™',
        detail: `${concepts.length} concepts judged · ${tournamentResult.finalistIds.length} finalists advance to Review Chamber™`,
      },
    ],
    updatedAt: now,
  };
}

export function getCreativeUniversalPipeline(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  const existing = loadPipelineFromStorage(departmentId, projectId);
  if (existing) {
    if (!existing.tournamentResult && existing.concepts.length) {
      const tournamentResult = runFutureTournament(existing.concepts, existing.tournamentLearning);
      return updatePipeline(departmentId, projectId, {
        tournamentResult,
        phase: existing.approvedConceptId ? existing.phase : 'future-tournament',
        activeConceptId: tournamentResult.finalistIds[0] ?? existing.activeConceptId,
      });
    }
    return existing;
  }

  const created = createPipeline(departmentId, projectId);
  const store = readStore();
  store.pipelines.push(created);
  writeStore(store);
  return created;
}

function updatePipeline(
  departmentId: string,
  projectId: string,
  patch: Partial<CreativeUniversalPipelineRecord>,
  historyEntry?: { label: string; detail: string }
): CreativeUniversalPipelineRecord {
  const store = readStore();
  const idx = store.pipelines.findIndex(
    (p) => p.departmentId === departmentId && p.projectId === projectId
  );
  const base = idx >= 0 ? store.pipelines[idx]! : createPipeline(departmentId, projectId);
  const now = new Date().toISOString();
  const next: CreativeUniversalPipelineRecord = {
    ...base,
    ...patch,
    version: 2,
    updatedAt: now,
    history: historyEntry
      ? [{ at: now, label: historyEntry.label, detail: historyEntry.detail }, ...base.history].slice(0, 24)
      : base.history,
  };
  if (idx >= 0) store.pipelines[idx] = next;
  else store.pipelines.push(next);
  writeStore(store);
  return next;
}

export function runFutureTournamentInStore(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  const tournamentResult = runFutureTournament(pipeline.concepts, pipeline.tournamentLearning);
  return updatePipeline(
    departmentId,
    projectId,
    {
      tournamentResult,
      phase: 'future-tournament',
      activeConceptId: tournamentResult.finalistIds[0] ?? pipeline.activeConceptId,
      reviewChamberActive: false,
    },
    {
      label: 'Future Tournament™',
      detail: `${tournamentResult.rounds.length} head-to-head rounds · finalists: ${tournamentResult.finalistIds.length}`,
    }
  );
}

export function enterReviewChamber(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  const activeConceptId = pipeline.tournamentResult?.finalistIds[0] ?? pipeline.activeConceptId;
  return updatePipeline(
    departmentId,
    projectId,
    { reviewChamberActive: true, phase: 'future-tournament', activeConceptId },
    { label: 'Review Chamber™', detail: 'Executive presentation room — finalist holographic environments' }
  );
}

export function exitReviewChamber(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  return updatePipeline(departmentId, projectId, { reviewChamberActive: false });
}

export function recordFounderTournamentDecision(
  departmentId: string,
  projectId: string,
  action: import('./future-tournament-types').TournamentLearningRecord['founderOverrides'][0]['action'],
  detail?: string,
  conceptId?: string
): CreativeUniversalPipelineRecord {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  const concept = conceptId ? pipeline.concepts.find((c) => c.id === conceptId) : undefined;
  const learning = recordTournamentLearning(
    pipeline.tournamentLearning,
    action,
    detail,
    conceptId,
    concept?.archetype
  );
  return updatePipeline(departmentId, projectId, { tournamentLearning: learning });
}

export function setFounderIntent(
  departmentId: string,
  projectId: string,
  intent: string
): CreativeUniversalPipelineRecord {
  const concepts = buildDefaultCreativeConcepts(intent);
  const tournamentResult = runFutureTournament(concepts, defaultTournamentLearning());
  return updatePipeline(
    departmentId,
    projectId,
    {
      founderIntent: intent,
      concepts,
      activeConceptId: tournamentResult.finalistIds[0] ?? concepts[0]?.id ?? null,
      phase: 'future-tournament',
      tournamentResult,
    },
    { label: 'Founder Intent™', detail: intent.slice(0, 120) }
  );
}

export function selectCreativeConcept(
  departmentId: string,
  projectId: string,
  conceptId: string
): CreativeUniversalPipelineRecord {
  return updatePipeline(
    departmentId,
    projectId,
    { activeConceptId: conceptId, phase: 'concept-approval' },
    { label: 'Parallel Futures™', detail: `Selected concept ${conceptId}` }
  );
}

export function enterConceptMergeLab(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  const pool =
    pipeline.tournamentResult?.finalistIds.length ?
      pipeline.concepts.filter(
        (c) => pipeline.tournamentResult!.finalistIds.includes(c.id) || !c.isMerged
      )
    : pipeline.concepts.filter((c) => !c.isMerged);
  const recipe = defaultConceptMergeRecipe(pool);
  const merged = executeConceptMerge(recipe, pipeline.concepts);
  return updatePipeline(
    departmentId,
    projectId,
    {
      phase: 'future-merge',
      mergeLabActive: true,
      activeMergeRecipe: recipe,
      mergeDraftConceptId: merged.id,
      concepts: [...pipeline.concepts, merged],
      activeConceptId: merged.id,
    },
    { label: 'Future Merge™', detail: 'Merge Lab™ opened — combine strongest concept layers' }
  );
}

export function exitConceptMergeLab(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  return updatePipeline(departmentId, projectId, {
    mergeLabActive: false,
    phase: 'future-tournament',
  });
}

export function runConceptMerge(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  const recipe = pipeline.activeMergeRecipe ?? defaultConceptMergeRecipe(pipeline.concepts);
  const merged = executeConceptMerge(recipe, pipeline.concepts);
  const concepts = [...pipeline.concepts.filter((c) => c.id !== pipeline.mergeDraftConceptId), merged];
  return updatePipeline(
    departmentId,
    projectId,
    {
      concepts,
      mergeDraftConceptId: merged.id,
      activeConceptId: merged.id,
      phase: 'concept-approval',
    },
    {
      label: 'Future Merge™',
      detail: `${recipe.ingredients.length} ingredients → ${merged.tagline}`,
    }
  );
}

export function approveCreativeConcept(
  departmentId: string,
  projectId: string,
  conceptId?: string
): CreativeUniversalPipelineRecord {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  const id = conceptId ?? pipeline.activeConceptId;
  const concept = pipeline.concepts.find((c) => c.id === id);
  if (!concept) return pipeline;

  const reuse = analyzeConceptAssetReuse(projectId, concept);
  const layers = deconstructApprovedConcept(concept, projectId);
  const warehouseAssetsAdded = layers.filter((l) => l.reusable || l.generateRequired).length;
  const now = new Date().toISOString();

  const result = updatePipeline(
    departmentId,
    projectId,
    {
      approvedConceptId: concept.id,
      approvedAt: now,
      phase: 'scene-deconstruction',
      deconstructionLayers: layers,
      warehouseAssetsAdded,
      assetReuseSummary: reuse.summary,
      reviewChamberActive: false,
    },
    {
      label: 'Concept Approval™',
      detail: `${concept.tagline} approved — Scene Deconstruction™ begins`,
    }
  );

  recordFounderTournamentDecision(departmentId, projectId, 'pick-finalist', concept.tagline, concept.id);
  unlockProductionPipelineAfterConceptApproval(departmentId, projectId);
  return result;
}

export function advanceCreativePipelinePhase(
  departmentId: string,
  projectId: string,
  targetPhase: CreativeUniversalPipelinePhase
): CreativeUniversalPipelineRecord {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  const patch: Partial<CreativeUniversalPipelineRecord> = { phase: targetPhase };

  if (targetPhase === 'warehouse' && pipeline.deconstructionLayers.length) {
    patch.warehouseAssetsAdded = pipeline.deconstructionLayers.length;
  }
  if (targetPhase === 'golden-build') {
    patch.goldenBuildCertified = true;
  }

  return updatePipeline(departmentId, projectId, patch, {
    label: 'Pipeline',
    detail: `Advanced to ${targetPhase}`,
  });
}

export function isConceptApprovedForProduction(
  departmentId: string,
  projectId: string
): boolean {
  const pipeline = getCreativeUniversalPipeline(departmentId, projectId);
  return Boolean(pipeline.approvedConceptId);
}

export function getActiveCreativeConcept(
  pipeline: CreativeUniversalPipelineRecord
): CreativeConceptFuture | undefined {
  return pipeline.concepts.find((c) => c.id === pipeline.activeConceptId) ?? pipeline.concepts[0];
}

export function getApprovedCreativeConcept(
  pipeline: CreativeUniversalPipelineRecord
): CreativeConceptFuture | undefined {
  if (!pipeline.approvedConceptId) return undefined;
  return pipeline.concepts.find((c) => c.id === pipeline.approvedConceptId);
}

export function getTournamentFinalistConcepts(
  pipeline: CreativeUniversalPipelineRecord
): CreativeConceptFuture[] {
  if (!pipeline.tournamentResult) return pipeline.concepts.filter((c) => !c.isMerged).slice(0, 2);
  return pipeline.concepts.filter((c) => pipeline.tournamentResult!.finalistIds.includes(c.id));
}

export function listDeconstructionLayers(
  departmentId: string,
  projectId: string
): SceneDeconstructionLayer[] {
  return getCreativeUniversalPipeline(departmentId, projectId).deconstructionLayers;
}

export function pipelineKey(departmentId: string, projectId: string): string {
  return `${departmentId}::${projectId}`;
}
