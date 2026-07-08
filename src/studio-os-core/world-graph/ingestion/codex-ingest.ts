import { getCodexBootstrapArticles, getCodexBootstrapRelationships } from '../../studio-world-codex/bootstrap/seeds';
import { CODEX_VOLUMES } from '../../studio-world-codex';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';
import type { CodexArticleRecord } from '../../studio-world-codex/types';
import type { WorldEdgeType } from '../types';

function now(): string {
  return new Date().toISOString();
}

function mapCodexRelationshipToEdgeType(type: string): WorldEdgeType {
  switch (type) {
    case 'depends-on':
      return 'depends-on';
    case 'supersedes':
      return 'supersedes';
    case 'supports':
    case 'extends':
      return 'references';
    case 'contradicts':
      return 'affected-by';
    case 'referenced-by':
    case 'related-to':
    default:
      return 'references';
  }
}

function articleNodeType(article: CodexArticleRecord): WorldNode['nodeType'] {
  if (article.status === 'Canonical' && article.volume === 'volume-ii-constitution') {
    return 'constitutional-law';
  }
  return 'knowledge-object';
}

function articleSlug(article: CodexArticleRecord): string {
  return article.articleId.toLowerCase().replace(/^article-/, '');
}

/** Studio World Codex™ — dynamic article graph from bootstrap/store schema */
export function ingestCodexNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const articles = getCodexBootstrapArticles();
  const relationships = getCodexBootstrapRelationships();

  const codexEngineId = worldNodeId('engine', 'studio-world-codex');
  const knowledgeCoreId = worldNodeId('engine', 'studio-world-knowledge-core');
  const worldGraphId = worldNodeId('engine', 'world-graph');
  const memorySystemId = worldNodeId('engine', 'studio-world-memory-system');
  const productionCompletionId = worldNodeId('engine', 'production-completion-system');
  const constitutionHallId = worldNodeId('room', 'scc-constitution-hall');

  nodes.push({
    id: codexEngineId,
    slug: 'studio-world-codex',
    displayName: 'Studio World Codex™',
    nodeType: 'engine',
    lifecycle: 'architecture',
    plane: lifecyclePlane('architecture'),
    version: '1.1.0',
    summary:
      'Constitutional memory of Studio World — every major feature becomes a Codex Article™ before implementation.',
    implementationStatus: 'spec',
    codePaths: ['src/studio-os-core/studio-world-codex/'],
    docPaths: ['docs/studio-os/codex/CODEX_PLATFORM.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    tags: ['codex', 'constitutional-memory', 'codex-first', 'platform'],
    metadata: {
      articleCount: articles.length,
      volumeCount: CODEX_VOLUMES.length,
      lifecycle: 'idea-to-codex-to-production-to-update',
    },
  });

  for (const article of articles) {
    const nodeType = articleNodeType(article);
    const nodeId =
      article.worldGraphNodeId ?? worldNodeId(nodeType === 'constitutional-law' ? 'constitutional-law' : 'knowledge-object', articleSlug(article));

    nodes.push({
      id: nodeId,
      slug: articleSlug(article),
      displayName: article.title,
      nodeType,
      lifecycle: article.status === 'Canonical' ? 'approved' : 'architecture',
      plane: lifecyclePlane(article.status === 'Canonical' ? 'approved' : 'architecture'),
      version: article.revisionHistory.at(-1)?.version ?? '0.1.0',
      summary: article.philosophy || article.summary,
      implementationStatus: 'spec',
      codePaths: article.codePaths ?? ['src/studio-os-core/studio-world-codex/'],
      docPaths: article.docPaths ?? ['docs/studio-os/codex/'],
      provenance: { source: 'constitution', sourceRef: article.articleId, ingestedAt: ts },
      tags: [...article.tags, 'codex-article', article.volume],
      metadata: {
        articleId: article.articleId,
        status: article.status,
        category: article.category,
        volume: article.volume,
      },
    });

    edges.push({
      id: worldEdgeId('owns', codexEngineId, nodeId),
      type: 'owns',
      from: codexEngineId,
      to: nodeId,
      label: 'codex-article',
      provenance: { source: 'constitution', sourceRef: article.articleId, ingestedAt: ts },
    });

    for (const system of article.relatedSystems) {
      const systemSlug = system.replace(/™/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
      edges.push({
        id: worldEdgeId('integrates-with', nodeId, worldNodeId('engine', systemSlug)),
        type: 'integrates-with',
        from: nodeId,
        to: worldNodeId('engine', systemSlug),
        label: 'codex-system-reference',
        provenance: { source: 'constitution', sourceRef: article.articleId, ingestedAt: ts },
      });
    }
  }

  for (const volume of CODEX_VOLUMES) {
    const volumeId = worldNodeId('knowledge-object', volume.id);
    nodes.push({
      id: volumeId,
      slug: volume.id,
      displayName: volume.title,
      nodeType: 'knowledge-object',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.1.0',
      summary: volume.purpose,
      implementationStatus: 'spec',
      codePaths: [`src/studio-os-core/studio-world-codex/${volume.modulePath}/`],
      docPaths: ['docs/studio-os/codex/CODEX_PLATFORM.md'],
      provenance: { source: 'constitution', sourceRef: volume.id, ingestedAt: ts },
      tags: ['codex-volume', 'codex', volume.id],
      metadata: {
        order: volume.order,
        owns: volume.owns,
        modulePath: volume.modulePath,
      },
    });

    edges.push({
      id: worldEdgeId('owns', codexEngineId, volumeId),
      type: 'owns',
      from: codexEngineId,
      to: volumeId,
      label: 'codex-volume',
      provenance: { source: 'constitution', sourceRef: volume.id, ingestedAt: ts },
    });
  }

  const c01 = articles.find((a) => a.articleId === 'ARTICLE-C01');
  const c01NodeId = c01?.worldGraphNodeId ?? worldNodeId('constitutional-law', 'codex-first-principle');

  for (const rel of relationships) {
    const fromSlug = rel.fromArticleId.toLowerCase().replace(/^article-/, '');
    const toSlug = rel.toArticleId.toLowerCase().replace(/^article-/, '');
    const fromId = worldNodeId('knowledge-object', fromSlug);
    const toId = worldNodeId('knowledge-object', toSlug);
    edges.push({
      id: worldEdgeId(mapCodexRelationshipToEdgeType(rel.type), fromId, toId),
      type: mapCodexRelationshipToEdgeType(rel.type),
      from: fromId,
      to: toId,
      label: rel.label ?? rel.type,
      provenance: { source: 'constitution', sourceRef: rel.id, ingestedAt: ts },
    });
  }

  edges.push(
    {
      id: worldEdgeId('governed-by', codexEngineId, c01NodeId),
      type: 'governed-by',
      from: codexEngineId,
      to: c01NodeId,
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
      id: worldEdgeId('required-by', c01NodeId, productionCompletionId),
      type: 'required-by',
      from: c01NodeId,
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
