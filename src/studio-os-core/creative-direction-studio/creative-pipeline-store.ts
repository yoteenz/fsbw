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

const STORAGE_KEY = 'studioOsCreativeUniversalPipeline_v1';
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

function pipelineKey(departmentId: string, projectId: string): string {
  return `${departmentId}::${projectId}`;
}

function createPipeline(departmentId: string, projectId: string, founderIntent = ''): CreativeUniversalPipelineRecord {
  const concepts = buildDefaultCreativeConcepts(founderIntent);
  const now = new Date().toISOString();
  return {
    version: 1,
    departmentId,
    projectId,
    phase: concepts.length ? 'parallel-futures' : 'founder-intent',
    founderIntent,
    concepts,
    activeConceptId: concepts[0]?.id ?? null,
    mergeLabActive: false,
    activeMergeRecipe: null,
    mergeDraftConceptId: null,
    approvedConceptId: null,
    approvedAt: null,
    deconstructionLayers: [],
    warehouseAssetsAdded: 0,
    assetReuseSummary: null,
    goldenBuildCertified: false,
    history: [
      {
        at: now,
        label: 'Story Table™',
        detail: `${concepts.length} complete Scene Stack™ concepts generated — nothing deconstructed yet`,
      },
    ],
    updatedAt: now,
  };
}

export function getCreativeUniversalPipeline(
  departmentId: string,
  projectId: string
): CreativeUniversalPipelineRecord {
  const store = readStore();
  const existing = store.pipelines.find(
    (p) => p.departmentId === departmentId && p.projectId === projectId
  );
  if (existing) return existing;

  const created = createPipeline(departmentId, projectId);
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

export function setFounderIntent(
  departmentId: string,
  projectId: string,
  intent: string
): CreativeUniversalPipelineRecord {
  const concepts = buildDefaultCreativeConcepts(intent);
  return updatePipeline(
    departmentId,
    projectId,
    {
      founderIntent: intent,
      concepts,
      activeConceptId: concepts[0]?.id ?? null,
      phase: 'parallel-futures',
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
  const recipe = defaultConceptMergeRecipe(pipeline.concepts.filter((c) => !c.isMerged));
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
    phase: 'parallel-futures',
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
    },
    {
      label: 'Concept Approval™',
      detail: `${concept.tagline} approved — Scene Deconstruction™ begins`,
    }
  );

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

export function listDeconstructionLayers(
  departmentId: string,
  projectId: string
): SceneDeconstructionLayer[] {
  return getCreativeUniversalPipeline(departmentId, projectId).deconstructionLayers;
}

export { pipelineKey };
