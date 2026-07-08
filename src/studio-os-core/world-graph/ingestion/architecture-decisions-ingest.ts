import { ACCEPTED_ARCHITECTURE_DECISION_RECORDS } from '../../architecture-decision-records';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

const CONSTITUTION_HALL_ROOM_ID = worldNodeId('room', 'scc-constitution-hall');
const WORLD_GRAPH_ID = worldNodeId('engine', 'world-graph');
const ADR_ENGINE_ID = worldNodeId('engine', 'architecture-decision-records');
const WORLD_MEMORY_PHYSICS_ID = worldNodeId('foundational-physics-law', 'world-memory');
const IMMUTABILITY_LAW_ID = worldNodeId('constitutional-law', 'immutability-of-history');
const KNOWLEDGE_REVIEW_LAW_ID = worldNodeId('constitutional-law', 'knowledge-review');
const DOCUMENTATION_FIRST_LAW_ID = worldNodeId('constitutional-law', 'documentation-first');
const ADR_LAW_ID = worldNodeId('constitutional-law', 'architecture-decision-records');

function adrSlug(adrNumber: string): string {
  return adrNumber.toLowerCase();
}

export function ingestArchitectureDecisionNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  nodes.push({
    id: ADR_ENGINE_ID,
    slug: 'architecture-decision-records',
    displayName: 'Architecture Decision Records™',
    nodeType: 'engine',
    lifecycle: 'implemented',
    plane: lifecyclePlane('implemented'),
    version: '1.0.0',
    summary:
      'Permanent constitutional history system preserving why Studio World architectural decisions exist.',
    implementationStatus: 'live',
    codePaths: ['src/studio-os-core/architecture-decision-records/'],
    docPaths: ['docs/studio-os/architecture-decision-records/ARTICLE_K21_ARCHITECTURE_DECISION_RECORDS.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-K21', ingestedAt: ts },
    tags: ['adr', 'constitution', 'studio-world', 'institutional-memory'],
  });

  for (const adr of ACCEPTED_ARCHITECTURE_DECISION_RECORDS) {
    const id = worldNodeId('architectural-decision', adrSlug(adr.adrNumber));

    nodes.push({
      id,
      slug: adrSlug(adr.adrNumber),
      displayName: `${adr.adrNumber} — ${adr.title}`,
      nodeType: 'architectural-decision',
      lifecycle: adr.reviewStage === 'Implemented' ? 'implemented' : 'approved',
      plane: lifecyclePlane(adr.reviewStage === 'Implemented' ? 'implemented' : 'approved'),
      version: '1.0.0',
      summary: adr.decisionSummary,
      codePaths: ['src/studio-os-core/architecture-decision-records/records.ts'],
      docPaths: ['docs/studio-os/architecture-decision-records/ARTICLE_K21_ARCHITECTURE_DECISION_RECORDS.md'],
      provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      metadata: {
        status: adr.status,
        reviewStage: adr.reviewStage,
        dateApproved: adr.dateApproved,
        author: adr.author,
        journalTitle: adr.journal.title,
      },
      tags: ['adr', 'architecture-decision', 'constitutional-history'],
    });

    edges.push(
      {
        id: worldEdgeId('implements', ADR_ENGINE_ID, id),
        type: 'implements',
        from: ADR_ENGINE_ID,
        to: id,
        label: 'accepted decision',
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      },
      {
        id: worldEdgeId('located-in', id, CONSTITUTION_HALL_ROOM_ID),
        type: 'located-in',
        from: id,
        to: CONSTITUTION_HALL_ROOM_ID,
        label: 'preserved exhibit',
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      },
      {
        id: worldEdgeId('governed-by', id, DOCUMENTATION_FIRST_LAW_ID),
        type: 'governed-by',
        from: id,
        to: DOCUMENTATION_FIRST_LAW_ID,
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      },
      {
        id: worldEdgeId('governed-by', id, KNOWLEDGE_REVIEW_LAW_ID),
        type: 'governed-by',
        from: id,
        to: KNOWLEDGE_REVIEW_LAW_ID,
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      },
      {
        id: worldEdgeId('governed-by', id, ADR_LAW_ID),
        type: 'governed-by',
        from: id,
        to: ADR_LAW_ID,
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      },
      {
        id: worldEdgeId('depends-on', id, WORLD_MEMORY_PHYSICS_ID),
        type: 'depends-on',
        from: id,
        to: WORLD_MEMORY_PHYSICS_ID,
        label: 'physics-basis',
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      },
      {
        id: worldEdgeId('depends-on', id, IMMUTABILITY_LAW_ID),
        type: 'depends-on',
        from: id,
        to: IMMUTABILITY_LAW_ID,
        label: 'history-remains-intact',
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      },
      {
        id: worldEdgeId('integrates-with', ADR_ENGINE_ID, WORLD_GRAPH_ID),
        type: 'integrates-with',
        from: ADR_ENGINE_ID,
        to: WORLD_GRAPH_ID,
        label: 'decision graph',
        provenance: { source: 'constitution', sourceRef: adr.adrNumber, ingestedAt: ts },
      }
    );
  }

  return { nodes, edges };
}
