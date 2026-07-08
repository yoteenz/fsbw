import { CODEX_FIRST_PRINCIPLE_ARTICLE, CODEX_VOLUMES } from '../../studio-world-codex';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** ARTICLE-C01 — Studio World Codex™ graph relationships */
export function ingestCodexNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const codexEngineId = worldNodeId('engine', 'studio-world-codex');
  const c01LawId = worldNodeId('constitutional-law', 'codex-first-principle');
  const knowledgeCoreId = worldNodeId('engine', 'studio-world-knowledge-core');
  const worldGraphId = worldNodeId('engine', 'world-graph');
  const memorySystemId = worldNodeId('engine', 'studio-world-memory-system');
  const productionCompletionId = worldNodeId('engine', 'production-completion-system');
  const constitutionHallId = worldNodeId('room', 'scc-constitution-hall');

  nodes.push(
    {
      id: codexEngineId,
      slug: 'studio-world-codex',
      displayName: 'Studio World Codex™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary:
        'Constitutional memory of Studio World — every major feature becomes a Codex Article™ before implementation.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/studio-world-codex/'],
      docPaths: ['docs/studio-os/codex/ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md'],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
      tags: ['codex', 'constitutional-memory', 'codex-first', 'article-c01'],
      metadata: {
        articleCount: 1,
        volumeCount: CODEX_VOLUMES.length,
        lifecycle: 'idea-to-codex-to-production-to-update',
      },
    },
    {
      id: c01LawId,
      slug: 'codex-first-principle',
      displayName: CODEX_FIRST_PRINCIPLE_ARTICLE.title,
      nodeType: 'constitutional-law',
      lifecycle: 'approved',
      plane: lifecyclePlane('approved'),
      version: '1.0.0',
      summary: CODEX_FIRST_PRINCIPLE_ARTICLE.corePhilosophy,
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/studio-world-codex/'],
      docPaths: ['docs/studio-os/codex/ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md'],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
      tags: ['codex-first', 'constitution', 'major-feature-gate'],
      metadata: {
        articleId: CODEX_FIRST_PRINCIPLE_ARTICLE.articleId,
        canonicalStatus: CODEX_FIRST_PRINCIPLE_ARTICLE.canonicalStatus,
        category: CODEX_FIRST_PRINCIPLE_ARTICLE.category,
      },
    }
  );

  for (const volume of CODEX_VOLUMES) {
    const volumeId = worldNodeId('knowledge-object', volume.id);
    nodes.push({
      id: volumeId,
      slug: volume.id,
      displayName: volume.title,
      nodeType: 'knowledge-object',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary: volume.purpose,
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/studio-world-codex/volumes.ts'],
      docPaths: ['docs/studio-os/codex/ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md'],
      provenance: { source: 'constitution', sourceRef: `ARTICLE-C01:${volume.id}`, ingestedAt: ts },
      tags: ['codex-volume', 'codex', volume.id],
      metadata: {
        order: volume.order,
        owns: volume.owns,
      },
    });

    edges.push({
      id: worldEdgeId('owns', codexEngineId, volumeId),
      type: 'owns',
      from: codexEngineId,
      to: volumeId,
      label: 'codex-volume',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    });
  }

  edges.push(
    {
      id: worldEdgeId('governed-by', codexEngineId, c01LawId),
      type: 'governed-by',
      from: codexEngineId,
      to: c01LawId,
      label: 'codex-first-gate',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', codexEngineId, knowledgeCoreId),
      type: 'integrates-with',
      from: codexEngineId,
      to: knowledgeCoreId,
      label: 'searchable-institutional-memory',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', codexEngineId, memorySystemId),
      type: 'integrates-with',
      from: codexEngineId,
      to: memorySystemId,
      label: 'codex-update-loop',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', codexEngineId, worldGraphId),
      type: 'integrates-with',
      from: codexEngineId,
      to: worldGraphId,
      label: 'canonical-relationship-map',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    },
    {
      id: worldEdgeId('required-by', c01LawId, productionCompletionId),
      type: 'required-by',
      from: c01LawId,
      to: productionCompletionId,
      label: 'architecture-checkpoint',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    },
    {
      id: worldEdgeId('located-in', codexEngineId, constitutionHallId),
      type: 'located-in',
      from: codexEngineId,
      to: constitutionHallId,
      label: 'future-codex-review-room',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    }
  );

  return { nodes, edges };
}
