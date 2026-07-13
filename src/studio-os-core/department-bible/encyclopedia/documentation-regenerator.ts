import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY } from '../../canonical-studio-world/canonical-department-registry';
import { DEPARTMENT_BIBLE_REGISTRY_VERSION } from '../registry/bible-registry';
import { DEPARTMENT_RELATIONSHIP_GRAPH } from '../relationships/relationship-graph';
import { buildWorldKnowledgeGraph } from '../relationships/world-knowledge-graph';
import { AI_WORKFORCE_DIRECTORY } from '../registry/ai-workforce-directory';
import { buildStudioWorldEncyclopedia } from './studio-world-encyclopedia';
import { validateAllDepartmentBibles } from '../validators/bible-validator';

export const DOCUMENTATION_REGENERATOR_VERSION = 'documentation-regenerator.v1' as const;

export type RegeneratedDocumentation = {
  regeneratorVersion: typeof DOCUMENTATION_REGENERATOR_VERSION;
  regeneratedAt: string;
  bibleRegistryVersion: string;
  relationshipGraphRevision: number;
  knowledgeGraphRevision: number;
  workforceCount: number;
  encyclopediaRevision: number;
  validationSummary: { total: number; passed: number; failed: string[] };
  departmentSummaries: Array<{
    departmentId: CanonicalMainDepartmentId;
    officialName: string;
    mission: string;
    upstream: CanonicalMainDepartmentId[];
    downstream: CanonicalMainDepartmentId[];
    aiWorkerCount: number;
    lifecycleStateCount: number;
    permissionGrantCount: number;
  }>;
};

/**
 * Self-documenting system — regenerates all derived documentation when department canon changes.
 */
export function regenerateDepartmentDocumentation(): RegeneratedDocumentation {
  const knowledgeGraph = buildWorldKnowledgeGraph();
  const encyclopedia = buildStudioWorldEncyclopedia();
  const validation = validateAllDepartmentBibles();
  const passed = validation.filter((v) => v.ok).length;
  const failed = validation.filter((v) => !v.ok).map((v) => v.departmentId);

  const departmentSummaries = CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.map((r) => {
    const node = knowledgeGraph.nodes.find((n) => n.departmentId === r.departmentId)!;
    return {
      departmentId: r.departmentId,
      officialName: node.officialName,
      mission: node.mission,
      upstream: node.dependsOn,
      downstream: node.dependedOnBy,
      aiWorkerCount: node.aiWorkers.length,
      lifecycleStateCount: node.lifecycleStates.length,
      permissionGrantCount: node.permissions.length,
    };
  });

  return {
    regeneratorVersion: DOCUMENTATION_REGENERATOR_VERSION,
    regeneratedAt: new Date().toISOString(),
    bibleRegistryVersion: DEPARTMENT_BIBLE_REGISTRY_VERSION,
    relationshipGraphRevision: DEPARTMENT_RELATIONSHIP_GRAPH.graphRevision,
    knowledgeGraphRevision: knowledgeGraph.graphRevision,
    workforceCount: AI_WORKFORCE_DIRECTORY.workers.length,
    encyclopediaRevision: encyclopedia.encyclopediaRevision,
    validationSummary: { total: validation.length, passed, failed },
    departmentSummaries,
  };
}
