import { FOUNDATIONAL_PHYSICS_LAWS } from '../../world-physics/laws';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** Register Foundational Physics™ laws as Tier 1 canon nodes. */
export function ingestFoundationalPhysicsNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const physicsRootId = worldNodeId('foundational-physics-law', 'world-physics');
  nodes.push({
    id: physicsRootId,
    slug: 'world-physics',
    displayName: 'World Physics™',
    nodeType: 'foundational-physics-law',
    lifecycle: 'live',
    plane: lifecyclePlane('live'),
    version: '1.0.0',
    summary:
      'Immutable natural laws — what is fundamentally possible inside Studio World. Comparable to gravity.',
    docPaths: [
      'docs/studio-os/world-physics/STUDIO_WORLD_PHYSICS_ARCHITECTURE.md',
      'knowledge/canon/physics/README.md',
    ],
    codePaths: ['src/studio-os-core/world-physics/laws.ts'],
    provenance: { source: 'constitution', sourceRef: 'world-physics', ingestedAt: ts },
    tags: ['canon', 'physics', 'layer-2'],
    metadata: { governanceLayer: 2, canonTier: 'foundational-physics', lawCount: FOUNDATIONAL_PHYSICS_LAWS.length },
  });

  const worldGraphId = worldNodeId('engine', 'world-graph');
  edges.push({
    id: worldEdgeId('governed-by', worldGraphId, physicsRootId),
    type: 'governed-by',
    from: worldGraphId,
    to: physicsRootId,
    label: 'physics-substrate',
    provenance: { source: 'constitution', sourceRef: 'world-physics', ingestedAt: ts },
  });

  let prevId: string | null = null;
  for (const law of FOUNDATIONAL_PHYSICS_LAWS) {
    const id = worldNodeId('foundational-physics-law', law.id);
    nodes.push({
      id,
      slug: law.id,
      displayName: law.title,
      nodeType: 'foundational-physics-law',
      lifecycle: 'live',
      plane: lifecyclePlane('live'),
      version: '1.0.0',
      summary: law.summary,
      docPaths: [`knowledge/canon/physics/${law.id}.md`],
      codePaths: law.enforcementPaths,
      provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
      metadata: { governanceLayer: 2, canonTier: 'foundational-physics', lawNumber: law.number },
      tags: ['physics', 'canon', 'layer-2'],
    });

    edges.push({
      id: worldEdgeId('owns', physicsRootId, id),
      type: 'owns',
      from: physicsRootId,
      to: id,
      provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
    });

    for (const principleSlug of law.principleBasis ?? []) {
      const principleId = worldNodeId('design-principle', principleSlug);
      edges.push({
        id: worldEdgeId('depends-on', id, principleId),
        type: 'depends-on',
        from: id,
        to: principleId,
        label: 'principle-basis',
        provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
      });
    }

    if (prevId) {
      edges.push({
        id: worldEdgeId('references', id, prevId),
        type: 'references',
        from: id,
        to: prevId,
        label: 'physics-sequence',
        provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
      });
    }
    prevId = id;
  }

  return { nodes, edges };
}
