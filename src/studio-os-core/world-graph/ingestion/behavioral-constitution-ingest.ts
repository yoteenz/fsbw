import { BEHAVIORAL_CONSTITUTIONAL_LAWS } from '../../studio-world-constitution/behavioral-laws';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** Register Behavioral Constitutional Laws™ as Tier 2 canon nodes. */
export function ingestBehavioralConstitutionalNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const constitutionRootId = worldNodeId('constitutional-law', 'behavioral-constitution');
  nodes.push({
    id: constitutionRootId,
    slug: 'behavioral-constitution',
    displayName: 'Behavioral Constitutional Laws™',
    nodeType: 'constitutional-law',
    lifecycle: 'live',
    plane: lifecyclePlane('live'),
    version: '1.0.0',
    summary: 'Process governance — what Studio World may do. Subordinate to World Physics™.',
    docPaths: ['knowledge/canon/constitution/behavioral-laws.md'],
    codePaths: ['src/studio-os-core/studio-world-constitution/behavioral-laws.ts'],
    provenance: { source: 'constitution', sourceRef: 'behavioral-constitution', ingestedAt: ts },
    tags: ['canon', 'constitution', 'tier-2'],
    metadata: { canonTier: 'constitutional-law', lawCount: BEHAVIORAL_CONSTITUTIONAL_LAWS.length },
  });

  for (const law of BEHAVIORAL_CONSTITUTIONAL_LAWS) {
    const id = worldNodeId('constitutional-law', law.id);
    nodes.push({
      id,
      slug: law.id,
      displayName: law.title,
      nodeType: 'constitutional-law',
      lifecycle: 'live',
      plane: lifecyclePlane('live'),
      version: '1.0.0',
      summary: law.summary,
      docPaths: ['knowledge/canon/constitution/behavioral-laws.md'],
      codePaths: ['src/studio-os-core/studio-world-constitution/behavioral-laws.ts'],
      provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
      metadata: { canonTier: 'constitutional-law', lawNumber: law.number, enforcement: law.enforcement },
      tags: ['constitution', 'canon', 'tier-2'],
    });

    edges.push({
      id: worldEdgeId('owns', constitutionRootId, id),
      type: 'owns',
      from: constitutionRootId,
      to: id,
      provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
    });

    for (const physicsSlug of law.physicsBasis) {
      const physicsId = worldNodeId('foundational-physics-law', physicsSlug);
      edges.push({
        id: worldEdgeId('depends-on', id, physicsId),
        type: 'depends-on',
        from: id,
        to: physicsId,
        label: 'physics-basis',
        provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
      });
    }
  }

  return { nodes, edges };
}
