import { LAUNCH_RETENTION_PROFILES } from '../../knowledge-retention-engine';
import { worldEdgeId, worldNodeId } from '../id';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** ARTICLE-E03 — Knowledge Retention Engine™ graph relationships */
export function ingestKnowledgeRetentionNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const retentionEngineId = worldNodeId('engine', 'knowledge-retention-engine');
  const professionBrainId = worldNodeId('engine', 'profession-brain');
  const atlasId = worldNodeId('engine', 'studio-world-atlas');
  const knowledgeId = worldNodeId('knowledge-object', 'E03-knowledge-retention-engine');

  edges.push(
    {
      id: worldEdgeId('references', retentionEngineId, knowledgeId),
      type: 'references',
      from: retentionEngineId,
      to: knowledgeId,
      label: 'canon-knowledge',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E03', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', retentionEngineId, professionBrainId),
      type: 'integrates-with',
      from: retentionEngineId,
      to: professionBrainId,
      label: 'retention-profiles-from-profession-brains',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E03', ingestedAt: ts },
    },
    {
      id: worldEdgeId('projects-to', retentionEngineId, atlasId),
      type: 'projects-to',
      from: retentionEngineId,
      to: atlasId,
      label: 'professional-memories-in-world',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E03', ingestedAt: ts },
    }
  );

  for (const profile of LAUNCH_RETENTION_PROFILES) {
    const memoryId = worldNodeId('professional-memory', profile.id);
    nodes.push({
      id: memoryId,
      slug: profile.id,
      displayName: `${profile.conceptTitle} Memory™`,
      nodeType: 'professional-memory',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '1.0.0',
      summary:
        `${profile.conceptTitle} retained as a professional memory with confidence, recall, usage, certification, update, and career-goal signals.`,
      tags: ['professional-memory', 'knowledge-retention', profile.domain, profile.brainId],
      implementationStatus: 'live',
      codePaths: ['src/studio-os-core/knowledge-retention-engine/retention-profiles/catalog.ts'],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E03', ingestedAt: ts },
      metadata: {
        brainId: profile.brainId,
        domain: profile.domain,
        difficulty: profile.difficulty,
        confidenceScore: profile.confidenceScore,
        recallScore: profile.recallScore,
        certificationRelevance: profile.certificationRelevance,
      },
    });

    edges.push(
      {
        id: worldEdgeId('governed-by', memoryId, retentionEngineId),
        type: 'governed-by',
        from: memoryId,
        to: retentionEngineId,
        label: 'retention-profile',
        provenance: { source: 'constitution', sourceRef: 'ARTICLE-E03', ingestedAt: ts },
      },
      {
        id: worldEdgeId('depends-on', memoryId, professionBrainId),
        type: 'depends-on',
        from: memoryId,
        to: professionBrainId,
        label: profile.brainId,
        provenance: { source: 'constitution', sourceRef: 'ARTICLE-E03', ingestedAt: ts },
      },
      {
        id: worldEdgeId('refreshes', retentionEngineId, memoryId),
        type: 'refreshes',
        from: retentionEngineId,
        to: memoryId,
        label: 'adaptive-refresher',
        provenance: { source: 'constitution', sourceRef: 'ARTICLE-E03', ingestedAt: ts },
      }
    );
  }

  return { nodes, edges };
}
