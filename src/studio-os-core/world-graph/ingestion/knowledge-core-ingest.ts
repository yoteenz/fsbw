import { getAllKnowledgeEntries } from '../../studio-world-knowledge-core/engine';
import { KNOWLEDGE_CORE_DOMAINS, KNOWLEDGE_CORE_STATUSES } from '../../studio-world-knowledge-core/types';
import {
  PROMPT_STANDARDS,
  ARCHITECTS_MEMORY_PRINCIPLES,
  CONVERSATION_ARCHIVE_RECORDS,
  KNOWLEDGE_EXTRACTION_REPORTS,
  canInfluenceFutureArchitecture,
} from '../../studio-world-knowledge-core/entries';
import type { KnowledgeCoreStatus } from '../../studio-world-knowledge-core/types';
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
  const k23LawId = worldNodeId('constitutional-law', 'studio-world-memory-system');
  const adrEngineId = worldNodeId('engine', 'architecture-decision-records');
  const adr0001Id = worldNodeId('architectural-decision', 'adr-0001');
  const knowledgeEraId = worldNodeId('era', 'knowledge');
  const constitutionHallId = worldNodeId('room', 'scc-constitution-hall');
  const memorySystemId = worldNodeId('engine', 'studio-world-memory-system');

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
      entryCount: getAllKnowledgeEntries().length,
      promptStandardCount: PROMPT_STANDARDS.length,
    },
  });

  nodes.push({
    id: memorySystemId,
    slug: 'studio-world-memory-system',
    displayName: 'Studio World Memory System™',
    nodeType: 'engine',
    lifecycle: 'implemented',
    plane: lifecyclePlane('implemented'),
    version: '1.0.0',
    summary:
      'Four-layer institutional memory: Conversation Archive™, Knowledge Ingestion™, Architect Review™, and approved Knowledge Core™.',
    implementationStatus: 'live',
    codePaths: ['src/studio-os-core/studio-world-knowledge-core/'],
    docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K23_MEMORY_SYSTEM.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-K23', ingestedAt: ts },
    tags: ['memory-system', 'conversation-archive', 'knowledge-ingestion', 'architect-review'],
    metadata: {
      archiveCount: CONVERSATION_ARCHIVE_RECORDS.length,
      extractionReportCount: KNOWLEDGE_EXTRACTION_REPORTS.length,
      architectMemoryPrincipleCount: ARCHITECTS_MEMORY_PRINCIPLES.length,
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
      id: worldEdgeId('governed-by', memorySystemId, k23LawId),
      type: 'governed-by',
      from: memorySystemId,
      to: k23LawId,
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K23', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', memorySystemId, knowledgeCoreId),
      type: 'integrates-with',
      from: memorySystemId,
      to: knowledgeCoreId,
      label: 'canon-promotion-gate',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K23', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', memorySystemId, worldGraphId),
      type: 'integrates-with',
      from: memorySystemId,
      to: worldGraphId,
      label: 'memory-graph',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-K23', ingestedAt: ts },
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

  for (const entry of getAllKnowledgeEntries()) {
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

  const architectsMemoryDomainId = worldNodeId('knowledge-object', 'domain-architects-memory');
  for (const principle of ARCHITECTS_MEMORY_PRINCIPLES) {
    const lifecycle = lifecycleForStatus(principle.status);
    const id = worldNodeId('knowledge-object', `architects-memory-principle-${principle.id}`);

    nodes.push({
      id,
      slug: `architects-memory-principle-${principle.id}`,
      displayName: `Architect’s Memory™ — ${principle.title}`,
      nodeType: 'knowledge-object',
      lifecycle,
      plane: lifecyclePlane(lifecycle),
      version: '1.0.0',
      summary: principle.principle,
      codePaths: ['src/studio-os-core/studio-world-knowledge-core/entries.ts'],
      docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K23_MEMORY_SYSTEM.md'],
      provenance: { source: 'constitution', sourceRef: principle.id, ingestedAt: ts },
      metadata: {
        canonicalStatus: principle.status,
        canInfluenceFutureArchitecture: canInfluenceFutureArchitecture(principle.status),
        knowledgeDomain: 'Architect’s Memory™',
        source: principle.source,
      },
      tags: ['architects-memory', 'memory-principle', 'knowledge-core'],
    });

    edges.push(
      {
        id: worldEdgeId('owns', knowledgeCoreId, id),
        type: 'owns',
        from: knowledgeCoreId,
        to: id,
        label: 'architects-memory-principle',
        provenance: { source: 'constitution', sourceRef: principle.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('located-in', id, architectsMemoryDomainId),
        type: 'located-in',
        from: id,
        to: architectsMemoryDomainId,
        label: 'architects-memory-domain',
        provenance: { source: 'constitution', sourceRef: principle.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('spawned-from', id, memorySystemId),
        type: 'spawned-from',
        from: id,
        to: memorySystemId,
        label: 'article-k23-expansion',
        provenance: { source: 'constitution', sourceRef: principle.id, ingestedAt: ts },
      }
    );
  }

  for (const archive of CONVERSATION_ARCHIVE_RECORDS) {
    const id = worldNodeId('conversation-archive', archive.id);
    const extractionId = worldNodeId('knowledge-extraction', archive.relatedExtractionReportId);

    nodes.push({
      id,
      slug: archive.id.toLowerCase(),
      displayName: archive.title,
      nodeType: 'conversation-archive',
      lifecycle: 'historical',
      plane: lifecyclePlane('historical'),
      version: '1.0.0',
      summary: archive.summaryForIndex,
      docPaths: [archive.transcriptPath],
      provenance: { source: 'manual', sourceRef: archive.id, ingestedAt: ts },
      metadata: {
        archiveDate: archive.date,
        preservedExactly: archive.preservedExactly,
        relatedExtractionReportId: archive.relatedExtractionReportId,
      },
      tags: ['conversation-archive', 'memory-system', 'historical-record'],
    });

    edges.push(
      {
        id: worldEdgeId('owns', memorySystemId, id),
        type: 'owns',
        from: memorySystemId,
        to: id,
        label: 'conversation-archive',
        provenance: { source: 'manual', sourceRef: archive.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('generated-from', extractionId, id),
        type: 'generated-from',
        from: extractionId,
        to: id,
        label: 'extracted-from-conversation',
        provenance: { source: 'manual', sourceRef: archive.id, ingestedAt: ts },
      }
    );
  }

  for (const report of KNOWLEDGE_EXTRACTION_REPORTS) {
    const id = worldNodeId('knowledge-extraction', report.id);
    const conversationId = worldNodeId('conversation-archive', report.sourceConversationId);
    const approvalId = worldNodeId('founder-approval', `${report.id}-founder-review`);

    nodes.push(
      {
        id,
        slug: report.id.toLowerCase(),
        displayName: report.title,
        nodeType: 'knowledge-extraction',
        lifecycle: 'review',
        plane: lifecyclePlane('review'),
        version: '1.0.0',
        summary: report.conversationSummary,
        docPaths: [report.reportPath],
        provenance: { source: 'manual', sourceRef: report.id, ingestedAt: ts },
        metadata: {
          status: report.status,
          sourceConversationId: report.sourceConversationId,
          itemsAwaitingApproval: report.itemsAwaitingApproval,
        },
        tags: ['knowledge-extraction-report', 'awaiting-founder-review', 'memory-system'],
      },
      {
        id: approvalId,
        slug: `${report.id.toLowerCase()}-founder-review`,
        displayName: `Founder Review™ — ${report.title}`,
        nodeType: 'founder-approval',
        lifecycle: 'review',
        plane: lifecyclePlane('review'),
        version: '1.0.0',
        summary:
          'Pending Architect Review™. Extracted knowledge cannot enter Knowledge Core until approved, modified, rejected, merged, or delayed by the founder.',
        docPaths: [report.reportPath],
        provenance: { source: 'manual', sourceRef: `${report.id}:founder-review`, ingestedAt: ts },
        metadata: {
          reviewStatus: 'Awaiting Founder Review',
          allowedActions: ['Approve', 'Modify', 'Reject', 'Merge', 'Delay'],
        },
        tags: ['founder-approval', 'architect-review', 'memory-system'],
      }
    );

    edges.push(
      {
        id: worldEdgeId('owns', memorySystemId, id),
        type: 'owns',
        from: memorySystemId,
        to: id,
        label: 'knowledge-extraction',
        provenance: { source: 'manual', sourceRef: report.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('generated-from', id, conversationId),
        type: 'generated-from',
        from: id,
        to: conversationId,
        label: 'source-conversation',
        provenance: { source: 'manual', sourceRef: report.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('governed-by', id, k23LawId),
        type: 'governed-by',
        from: id,
        to: k23LawId,
        label: 'no-auto-canon',
        provenance: { source: 'manual', sourceRef: report.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('generated-from', approvalId, id),
        type: 'generated-from',
        from: approvalId,
        to: id,
        label: 'review-of-extraction',
        provenance: { source: 'manual', sourceRef: report.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('references', approvalId, knowledgeCoreId),
        type: 'references',
        from: approvalId,
        to: knowledgeCoreId,
        label: 'promotion-target-after-approval',
        provenance: { source: 'manual', sourceRef: report.id, ingestedAt: ts },
      },
      {
        id: worldEdgeId('references', id, adr0001Id),
        type: 'references',
        from: id,
        to: adr0001Id,
        label: 'potential-adr-lineage',
        provenance: { source: 'manual', sourceRef: report.id, ingestedAt: ts },
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
