import {
  KNOWLEDGE_CORE_DOMAINS,
  KNOWLEDGE_CORE_ENTRIES,
  KNOWLEDGE_CORE_STATUSES,
  PROMPT_STANDARDS,
  canInfluenceFutureArchitecture,
  type KnowledgeCoreStatus,
} from '../../studio-world-knowledge-core';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldLifecycleStage, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

function slugify(value: string): string {
  return value
    .replace(/™/g, '')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function lifecycleForStatus(status: KnowledgeCoreStatus): WorldLifecycleStage {
  switch (status) {
    case 'Canon':
      return 'live';
    case 'Approved':
      return 'approved';
    case 'Draft':
      return 'architecture';
    case 'Experimental':
      return 'prototype';
    case 'Deprecated':
      return 'deprecated';
    case 'Historical':
      return 'historical';
    case 'Archived':
      return 'legacy';
  }
}

export function ingestKnowledgeCoreNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const knowledgeCoreId = worldNodeId('engine', 'studio-world-knowledge-core');
  const worldGraphId = worldNodeId('engine', 'world-graph');
  const k22LawId = worldNodeId('constitutional-law', 'studio-world-knowledge-core');
  const adrEngineId = worldNodeId('engine', 'architecture-decision-records');
  const adr0001Id = worldNodeId('architectural-decision', 'adr-0001');
  const knowledgeEraId = worldNodeId('era', 'knowledge');
  const constitutionHallId = worldNodeId('room', 'scc-constitution-hall');

  nodes.push({
    id: knowledgeCoreId,
    slug: 'studio-world-knowledge-core',
    displayName: 'Studio World Knowledge Core™',
    nodeType: 'engine',
    lifecycle: 'implemented',
    plane: lifecyclePlane('implemented'),
    version: '1.0.0',
    summary:
      'Canonical internal memory of Studio World — domains, statuses, prompt memory, Architect’s Memory™, and searchable knowledge entries.',
    implementationStatus: 'live',
    codePaths: ['src/studio-os-core/studio-world-knowledge-core/'],
    docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-K22', ingestedAt: ts },
    tags: ['knowledge-core', 'institutional-memory', 'studio-world', 'era-1'],
    metadata: {
      statusCount: KNOWLEDGE_CORE_STATUSES.length,
      domainCount: KNOWLEDGE_CORE_DOMAINS.length,
      entryCount: KNOWLEDGE_CORE_ENTRIES.length,
      promptStandardCount: PROMPT_STANDARDS.length,
    },
  });

  edges.push(
    {
      id: worldEdgeId('integrates-with', knowledgeCoreId, worldGraphId),
      type: 'integrates-with',
      from: knowledgeCoreId,
      to: worldGraphId,
      label: 'canonical memory substrate',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K22', ingestedAt: ts },
    },
    {
      id: worldEdgeId('governed-by', knowledgeCoreId, k22LawId),
      type: 'governed-by',
      from: knowledgeCoreId,
      to: k22LawId,
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K22', ingestedAt: ts },
    },
    {
      id: worldEdgeId('references', knowledgeCoreId, knowledgeEraId),
      type: 'references',
      from: knowledgeCoreId,
      to: knowledgeEraId,
      label: 'era-1-foundation',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K22', ingestedAt: ts },
    },
    {
      id: worldEdgeId('located-in', knowledgeCoreId, constitutionHallId),
      type: 'located-in',
      from: knowledgeCoreId,
      to: constitutionHallId,
      label: 'constitutional memory exhibit',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K22', ingestedAt: ts },
    }
  );

  for (const domain of KNOWLEDGE_CORE_DOMAINS) {
    const id = worldNodeId('knowledge-object', `domain-${slugify(domain)}`);
    nodes.push({
      id,
      slug: `domain-${slugify(domain)}`,
      displayName: domain,
      nodeType: 'knowledge-object',
      lifecycle: 'live',
      plane: lifecyclePlane('live'),
      version: '1.0.0',
      summary: `${domain} Knowledge Core domain — owns its own history and canon status.`,
      codePaths: ['src/studio-os-core/studio-world-knowledge-core/types.ts'],
      docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md'],
      provenance: { source: 'constitution', sourceRef: `domain:${domain}`, ingestedAt: ts },
      metadata: {
        canonicalStatus: 'Canon',
        canInfluenceFutureArchitecture: true,
        knowledgeDomain: domain,
      },
      tags: ['knowledge-domain', 'knowledge-core', slugify(domain)],
    });

    edges.push({
      id: worldEdgeId('owns', knowledgeCoreId, id),
      type: 'owns',
      from: knowledgeCoreId,
      to: id,
      label: 'knowledge-domain',
      provenance: { source: 'constitution', sourceRef: `domain:${domain}`, ingestedAt: ts },
    });
  }

  for (const entry of KNOWLEDGE_CORE_ENTRIES) {
    const lifecycle = lifecycleForStatus(entry.status);
    const id = worldNodeId('knowledge-object', `entry-${entry.id}`);
    const domainId = worldNodeId('knowledge-object', `domain-${slugify(entry.domain)}`);

    nodes.push({
      id,
      slug: `entry-${entry.id.toLowerCase()}`,
      displayName: entry.title,
      nodeType: 'knowledge-object',
      lifecycle,
      plane: lifecyclePlane(lifecycle),
      version: entry.version,
      summary: entry.summary,
      codePaths: ['src/studio-os-core/studio-world-knowledge-core/entries.ts'],
      docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md'],
      provenance: { source: 'constitution', sourceRef: entry.id, ingestedAt: ts },
      metadata: {
        canonicalStatus: entry.status,
        canInfluenceFutureArchitecture: canInfluenceFutureArchitecture(entry.status),
        knowledgeDomain: entry.domain,
        implementationStatus: entry.implementationStatus,
        supersededBy: entry.supersededBy ?? '',
        constitutionArticles: entry.constitutionArticles,
        adrReferences: entry.adrReferences,
      },
      tags: ['knowledge-entry', 'knowledge-core', ...entry.tags],
    });

    edges.push(
      {
        id: worldEdgeId('owns', knowledgeCoreId, id),
        type: 'owns',
        from: knowledgeCoreId,
        to: id,
        label: 'knowledge-entry',
        provenance: { source: 'constitution', sourceRef: entry.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('located-in', id, domainId),
        type: 'located-in',
        from: id,
        to: domainId,
        label: 'domain-history',
        provenance: { source: 'constitution', sourceRef: entry.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('governed-by', id, k22LawId),
        type: 'governed-by',
        from: id,
        to: k22LawId,
        provenance: { source: 'constitution', sourceRef: entry.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('references', id, adr0001Id),
        type: 'references',
        from: id,
        to: adr0001Id,
        label: 'adr-memory-precedent',
        provenance: { source: 'constitution', sourceRef: entry.id, ingestedAt: ts },
      }
    );
  }

  for (const standard of PROMPT_STANDARDS) {
    const lifecycle = lifecycleForStatus(standard.status);
    const id = worldNodeId('knowledge-object', `prompt-standard-${standard.id}`);
    const promptStandardsDomainId = worldNodeId('knowledge-object', 'domain-prompt-standards');

    nodes.push({
      id,
      slug: `prompt-standard-${standard.id}`,
      displayName: `Prompt Standard™ — ${standard.title}`,
      nodeType: 'knowledge-object',
      lifecycle,
      plane: lifecyclePlane(lifecycle),
      version: '1.0.0',
      summary: standard.standard,
      codePaths: ['src/studio-os-core/studio-world-knowledge-core/entries.ts'],
      docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md'],
      provenance: { source: 'constitution', sourceRef: standard.id, ingestedAt: ts },
      metadata: {
        canonicalStatus: standard.status,
        canInfluenceFutureArchitecture: canInfluenceFutureArchitecture(standard.status),
        reason: standard.reason,
        knowledgeDomain: 'Prompt Standards™',
      },
      tags: ['prompt-standard', 'knowledge-core', 'prompt-memory'],
    });

    edges.push(
      {
        id: worldEdgeId('owns', knowledgeCoreId, id),
        type: 'owns',
        from: knowledgeCoreId,
        to: id,
        label: 'prompt-standard',
        provenance: { source: 'constitution', sourceRef: standard.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('located-in', id, promptStandardsDomainId),
        type: 'located-in',
        from: id,
        to: promptStandardsDomainId,
        label: 'prompt-standards-domain',
        provenance: { source: 'constitution', sourceRef: standard.id, ingestedAt: ts },
      }
    );
  }

  edges.push({
    id: worldEdgeId('integrates-with', knowledgeCoreId, adrEngineId),
    type: 'integrates-with',
    from: knowledgeCoreId,
    to: adrEngineId,
    label: 'adr-archive-domain',
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-K22', ingestedAt: ts },
  });

  return { nodes, edges };
}
