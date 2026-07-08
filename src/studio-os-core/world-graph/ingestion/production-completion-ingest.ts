import { worldEdgeId, worldNodeId } from '../id';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** ARTICLE-K24 — Production Completion System™ graph relationships */
export function ingestProductionCompletionNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();
  const completionId = worldNodeId('engine', 'production-completion-system');
  const orchestratorId = worldNodeId('engine', 'production-orchestrator');
  const knowledgeId = worldNodeId('knowledge-object', 'K24-production-completion-system');

  edges.push(
    {
      id: worldEdgeId('integrates-with', completionId, orchestratorId),
      type: 'integrates-with',
      from: completionId,
      to: orchestratorId,
      label: 'governs-production-packages',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K24', ingestedAt: ts },
    },
    {
      id: worldEdgeId('governed-by', orchestratorId, completionId),
      type: 'governed-by',
      from: orchestratorId,
      to: completionId,
      label: 'definition-of-done',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K24', ingestedAt: ts },
    },
    {
      id: worldEdgeId('references', completionId, knowledgeId),
      type: 'references',
      from: completionId,
      to: knowledgeId,
      label: 'canon-knowledge',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K24', ingestedAt: ts },
    }
  );

  return { nodes, edges };
}
