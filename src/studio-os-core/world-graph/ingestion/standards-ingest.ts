import { IMPLEMENTATION_STANDARDS } from '../../implementation-standards/standards';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

function resolveLawNodeId(lawSlug: string): string {
  const behavioralIds = new Set([
    'documentation-first',
    'no-orphan-objects',
    'canon-promotion',
    'immutability-of-history',
    'agent-memory-subordination',
    'scene-assembly-rules',
    'knowledge-review',
    'repository-governance',
    'approval-workflow',
  ]);
  const aliases: Record<string, string> = {
    'agent-memory': 'agent-memory-subordination',
    'scene-assembly': 'scene-assembly-rules',
  };
  const slug = aliases[lawSlug] ?? lawSlug;
  if (behavioralIds.has(slug)) {
    return worldNodeId('constitutional-law', slug);
  }
  if (slug === 'world-graph-is-truth') {
    return worldNodeId('constitutional-law', 'world-graph-is-truth');
  }
  return worldNodeId('foundational-physics-law', slug);
}

/** Register Implementation Standards™ as Layer 4 governance nodes. */
export function ingestImplementationStandardNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const standardsRootId = worldNodeId('implementation-standard', 'implementation-standards');
  nodes.push({
    id: standardsRootId,
    slug: 'implementation-standards',
    displayName: 'Implementation Standards™',
    nodeType: 'implementation-standard',
    lifecycle: 'live',
    plane: lifecyclePlane('live'),
    version: '1.0.0',
    summary:
      'Engineering patterns, CI gates, and conventions — evolve continuously; implement Physics and Constitution.',
    docPaths: [
      'knowledge/canon/implementation-standards/README.md',
      'docs/studio-os/canon/STUDIO_WORLD_CANON_HIERARCHY.md',
    ],
    codePaths: ['src/studio-os-core/implementation-standards/standards.ts'],
    provenance: { source: 'constitution', sourceRef: 'implementation-standards', ingestedAt: ts },
    tags: ['canon', 'standards', 'layer-4'],
    metadata: { governanceLayer: 4, canonTier: 'implementation-standard', standardCount: IMPLEMENTATION_STANDARDS.length },
  });

  for (const std of IMPLEMENTATION_STANDARDS) {
    const id = worldNodeId('implementation-standard', std.id);
    nodes.push({
      id,
      slug: std.id,
      displayName: std.title,
      nodeType: 'implementation-standard',
      lifecycle: 'live',
      plane: lifecyclePlane('live'),
      version: '1.0.0',
      summary: std.summary,
      docPaths: std.docPaths,
      codePaths: std.codePaths,
      provenance: { source: 'constitution', sourceRef: std.id, ingestedAt: ts },
      metadata: { governanceLayer: 4, canonTier: 'implementation-standard' },
      tags: ['standards', 'canon', 'layer-4'],
    });

    edges.push({
      id: worldEdgeId('owns', standardsRootId, id),
      type: 'owns',
      from: standardsRootId,
      to: id,
      provenance: { source: 'constitution', sourceRef: std.id, ingestedAt: ts },
    });

    for (const lawSlug of std.implementsLaws) {
      const lawId = resolveLawNodeId(lawSlug);
      edges.push({
        id: worldEdgeId('implements', id, lawId),
        type: 'implements',
        from: id,
        to: lawId,
        label: 'implements-canon',
        provenance: { source: 'constitution', sourceRef: std.id, ingestedAt: ts },
      });
    }
  }

  return { nodes, edges };
}
