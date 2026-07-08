import { finalizeWorldGraph } from './graph';
import {
  ingestBehavioralConstitutionalNodes,
  ingestArchitectureDecisionNodes,
  ingestConstitutionalLawNodes,
  ingestDesignPrincipleNodes,
  ingestEraRoadmapNodes,
  ingestEngineNodes,
  ingestFlagshipNodes,
  ingestFoundationalPhysicsNodes,
  ingestGenomeNodes,
  ingestImplementationStandardNodes,
  ingestMasterSpecMilestones,
  ingestPublicationNodes,
  ingestRouteRegistryNodes,
  type MasterSpecMilestoneInput,
} from './ingestion';
import { validateWorldGraph } from './validator';
import type { WorldGraph, WorldGraphValidationResult } from './types';

export type BuildWorldGraphInput = {
  masterSpecMilestones?: MasterSpecMilestoneInput[];
};

export type BuildWorldGraphResult = {
  graph: WorldGraph;
  validation: WorldGraphValidationResult;
};

/**
 * Build the canonical Studio World Graph™ from all ingestion adapters.
 * Knowledge Graph nodes are ingested as `knowledge-object` type — first subsystem.
 */
export function buildWorldGraph(input: BuildWorldGraphInput = {}): BuildWorldGraphResult {
  const allNodes = [];
  const allEdges = [];

  const sources = [
    ingestDesignPrincipleNodes(),
    ingestFoundationalPhysicsNodes(),
    ingestEngineNodes(),
    ingestGenomeNodes(),
    ingestPublicationNodes(),
    ingestFlagshipNodes(),
    ingestConstitutionalLawNodes(),
    ingestBehavioralConstitutionalNodes(),
    ingestImplementationStandardNodes(),
    ingestEraRoadmapNodes(),
    ingestArchitectureDecisionNodes(),
    ingestRouteRegistryNodes(),
  ];

  if (input.masterSpecMilestones?.length) {
    sources.push(ingestMasterSpecMilestones(input.masterSpecMilestones));
  }

  for (const batch of sources) {
    allNodes.push(...batch.nodes);
    allEdges.push(...batch.edges);
  }

  const graph = finalizeWorldGraph(allNodes, allEdges);
  const validation = validateWorldGraph(graph);

  return { graph, validation };
}

export function assertWorldGraphValid(result: BuildWorldGraphResult): void {
  const errors = result.validation.issues.filter((i) => i.severity === 'error');
  if (errors.length > 0) {
    const msg = errors.map((e) => e.message).join('; ');
    throw new Error(`World Graph™ validation failed: ${msg}`);
  }
}
