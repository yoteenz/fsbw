import { getCodexBootstrapArticles, getCodexBootstrapRelationships } from '../../studio-world-codex/bootstrap/seeds';
import { CODEX_COLLECTIONS, CODEX_VOLUMES, THE_INSTITUTE_OF_KNOWLEDGE } from '../../studio-world-codex';
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
  const instituteId = THE_INSTITUTE_OF_KNOWLEDGE.worldGraphNodeId;

  nodes.push({
    id: codexEngineId,
    slug: 'studio-world-codex',
    displayName: 'Studio World Codex™',
    nodeType: 'engine',
    lifecycle: 'architecture',
    plane: lifecyclePlane('architecture'),
    version: '1.4.0',
    summary:
      'Constitutional memory of Studio World — every major feature becomes a Codex Article™ before implementation.',
    implementationStatus: 'spec',
    codePaths: ['src/studio-os-core/studio-world-codex/'],
    docPaths: ['docs/studio-os/codex/CODEX_PLATFORM.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-C01', ingestedAt: ts },
    tags: ['codex', 'constitutional-memory', 'codex-first', 'platform'],
    metadata: {
      articleCount: articles.length,
      collectionCount: CODEX_COLLECTIONS.length,
      volumeCount: CODEX_VOLUMES.length,
      lifecycle: 'idea-to-codex-to-production-to-update',
    },
  });

  nodes.push({
    id: instituteId,
    slug: THE_INSTITUTE_OF_KNOWLEDGE.id,
    displayName: THE_INSTITUTE_OF_KNOWLEDGE.title,
    nodeType: 'organization',
    lifecycle: 'architecture',
    plane: lifecyclePlane('architecture'),
    version: '1.4.0',
    summary: THE_INSTITUTE_OF_KNOWLEDGE.purpose,
    implementationStatus: 'spec',
    codePaths: ['src/studio-os-core/studio-world-codex/institute-of-knowledge.ts'],
    docPaths: ['docs/studio-os/codex/ARTICLE_C03_INSTITUTE_OF_KNOWLEDGE.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-C03', ingestedAt: ts },
    tags: ['institute-of-knowledge', 'publishing', 'research', 'canon-review', 'knowledge-validation'],
    metadata: {
      constitutionalAuthority: THE_INSTITUTE_OF_KNOWLEDGE.constitutionalAuthority,
      publicationTypes: THE_INSTITUTE_OF_KNOWLEDGE.publicationTypes,
      supersedes: THE_INSTITUTE_OF_KNOWLEDGE.supersedes,
    },
  });

  edges.push({
    id: worldEdgeId('governed-by', codexEngineId, instituteId),
    type: 'governed-by',
    from: codexEngineId,
    to: instituteId,
    label: 'official-library-operator',
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-C03', ingestedAt: ts },
  });

  for (const division of THE_INSTITUTE_OF_KNOWLEDGE.divisions) {
    const divisionId = worldNodeId('department', `institute-${division.id}`);
    nodes.push({
      id: divisionId,
      slug: `institute-${division.id}`,
      displayName: division.title,
      nodeType: 'department',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.4.0',
      summary: division.purpose,
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/studio-world-codex/institute-of-knowledge.ts'],
      docPaths: ['docs/studio-os/codex/ARTICLE_C03_INSTITUTE_OF_KNOWLEDGE.md'],
      provenance: { source: 'constitution', sourceRef: `ARTICLE-C03:${division.id}`, ingestedAt: ts },
      tags: ['institute-division', 'institute-of-knowledge', division.id],
      metadata: {
        responsibilities: division.responsibilities,
        governsSystems: division.governsSystems,
      },
    });

    edges.push({
      id: worldEdgeId('owns', instituteId, divisionId),
      type: 'owns',
      from: instituteId,
      to: divisionId,
      label: 'institute-division',
      provenance: { source: 'constitution', sourceRef: `ARTICLE-C03:${division.id}`, ingestedAt: ts },
    });
  }

  for (const collection of CODEX_COLLECTIONS) {
    const collectionId =
      collection.worldGraphNodeId ?? worldNodeId('knowledge-object', `codex-${collection.id}`);

    nodes.push({
      id: collectionId,
      slug: collection.id,
      displayName: collection.title,
      nodeType: 'knowledge-object',
      lifecycle: collection.status === 'Foundational' ? 'approved' : 'architecture',
      plane: lifecyclePlane(collection.status === 'Foundational' ? 'approved' : 'architecture'),
      version: '1.4.0',
      summary: collection.purpose,
      implementationStatus: collection.status === 'Foundational' ? 'live' : 'spec',
      codePaths: ['src/studio-os-core/studio-world-codex/collections.ts'],
      docPaths: ['docs/studio-os/codex/ARTICLE_C02_COMPLETE_STUDIO_WORLD_CODEX.md'],
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C02', ingestedAt: ts },
      tags: ['codex-collection', 'codex', ...collection.tags],
      metadata: {
        governanceLevel: collection.governanceLevel,
        owningSystems: collection.owningSystems,
        status: collection.status,
      },
    });

    edges.push({
      id: worldEdgeId('owns', codexEngineId, collectionId),
      type: 'owns',
      from: codexEngineId,
      to: collectionId,
      label: 'codex-collection',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C02', ingestedAt: ts },
    });
  }

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

  const foundationalCollectionId =
    CODEX_COLLECTIONS.find((collection) => collection.id === 'foundational-collection')?.worldGraphNodeId ??
    worldNodeId('knowledge-object', 'codex-foundational-collection');

  for (const volume of CODEX_VOLUMES) {
    const volumeId = worldNodeId('knowledge-object', volume.id);
    nodes.push({
      id: volumeId,
      slug: volume.id,
      displayName: volume.title,
      nodeType: 'knowledge-object',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.4.0',
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

    edges.push({
      id: worldEdgeId('owns', foundationalCollectionId, volumeId),
      type: 'owns',
      from: foundationalCollectionId,
      to: volumeId,
      label: 'foundational-volume',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C02', ingestedAt: ts },
    });
  }

  const c01 = articles.find((a) => a.articleId === 'ARTICLE-C01');
  const c01NodeId = c01?.worldGraphNodeId ?? worldNodeId('constitutional-law', 'codex-first-principle');

  const articleNodeIds = new Map(
    articles.map((article) => {
      const nodeType = articleNodeType(article);
      return [
        article.articleId,
        article.worldGraphNodeId ??
          worldNodeId(nodeType === 'constitutional-law' ? 'constitutional-law' : 'knowledge-object', articleSlug(article)),
      ] as const;
    })
  );

  for (const rel of relationships) {
    const fromSlug = rel.fromArticleId.toLowerCase().replace(/^article-/, '');
    const toSlug = rel.toArticleId.toLowerCase().replace(/^article-/, '');
    const fromId = articleNodeIds.get(rel.fromArticleId) ?? worldNodeId('knowledge-object', fromSlug);
    const toId = articleNodeIds.get(rel.toArticleId) ?? worldNodeId('knowledge-object', toSlug);
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
