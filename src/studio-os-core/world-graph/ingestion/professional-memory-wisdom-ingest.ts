import { LAUNCH_PROFESSIONAL_MEMORIES } from '../../professional-memory-wisdom-engine';
import { worldEdgeId, worldNodeId } from '../id';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** ARTICLE-E04 — Professional Memory™ / Wisdom Engine™ graph relationships */
export function ingestProfessionalMemoryWisdomNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const wisdomEngineId = worldNodeId('engine', 'professional-memory-wisdom-engine');
  const knowledgeId = worldNodeId('knowledge-object', 'E04-professional-memory-wisdom-engine');
  const retentionEngineId = worldNodeId('engine', 'knowledge-retention-engine');
  const professionBrainId = worldNodeId('engine', 'profession-brain');
  const careerWorldsId = worldNodeId('engine', 'career-worlds');
  const simulationEngineId = worldNodeId('engine', 'profession-simulation-engine');
  const orbId = worldNodeId('engine', 'orb-recommendations');

  edges.push(
    {
      id: worldEdgeId('references', wisdomEngineId, knowledgeId),
      type: 'references',
      from: wisdomEngineId,
      to: knowledgeId,
      label: 'canon-knowledge',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', wisdomEngineId, retentionEngineId),
      type: 'integrates-with',
      from: wisdomEngineId,
      to: retentionEngineId,
      label: 'knowledge-becomes-experience-wisdom',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', wisdomEngineId, professionBrainId),
      type: 'integrates-with',
      from: wisdomEngineId,
      to: professionBrainId,
      label: 'canonical-standards-plus-lived-experience',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', wisdomEngineId, careerWorldsId),
      type: 'integrates-with',
      from: wisdomEngineId,
      to: careerWorldsId,
      label: 'career-history-timeline',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', wisdomEngineId, simulationEngineId),
      type: 'integrates-with',
      from: wisdomEngineId,
      to: simulationEngineId,
      label: 'simulation-outcomes-become-wisdom',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
    },
    {
      id: worldEdgeId('projects-to', wisdomEngineId, orbId),
      type: 'projects-to',
      from: wisdomEngineId,
      to: orbId,
      label: 'orb-recalls-meaningful-moments',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
    }
  );

  for (const memory of LAUNCH_PROFESSIONAL_MEMORIES) {
    const memoryId = worldNodeId('professional-memory', memory.id);
    nodes.push({
      id: memoryId,
      slug: memory.id,
      displayName: `${memory.title} Memory™`,
      nodeType: 'professional-memory',
      lifecycle: 'architecture',
      plane: 'canon',
      version: '1.0.0',
      summary: `${memory.title} preserved as lived professional wisdom: ${memory.wisdomExtracted}`,
      tags: ['professional-memory', 'wisdom-engine', memory.memoryClass, memory.profession],
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/professional-memory-wisdom-engine/catalog.ts'],
      docPaths: [
        'docs/studio-os/engine/professional-memory/ARTICLE_E04_PROFESSIONAL_MEMORY_WISDOM_ENGINE.md',
      ],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
      metadata: {
        learnerId: memory.learnerId,
        profession: memory.profession,
        memoryClass: memory.memoryClass,
        impactScore: memory.impactScore,
        masteryDelta: memory.masteryDelta,
        signals: memory.signals,
      },
    });

    edges.push(
      {
        id: worldEdgeId('governed-by', memoryId, wisdomEngineId),
        type: 'governed-by',
        from: memoryId,
        to: wisdomEngineId,
        label: 'professional-timeline-memory',
        provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
      },
      {
        id: worldEdgeId('integrates-with', memoryId, retentionEngineId),
        type: 'integrates-with',
        from: memoryId,
        to: retentionEngineId,
        label: 'knowledge-retention-context',
        provenance: { source: 'constitution', sourceRef: 'ARTICLE-E04', ingestedAt: ts },
      }
    );
  }

  return { nodes, edges };
}
