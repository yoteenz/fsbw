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
    summary: 'Layer 3 — process governance. What Studio World may do. Subordinate to Physics and Design Principles.',
    docPaths: ['knowledge/canon/constitution/behavioral-laws.md'],
    codePaths: ['src/studio-os-core/studio-world-constitution/behavioral-laws.ts'],
    provenance: { source: 'constitution', sourceRef: 'behavioral-constitution', ingestedAt: ts },
    tags: ['canon', 'constitution', 'layer-3'],
    metadata: { governanceLayer: 3, canonTier: 'constitutional-law', lawCount: BEHAVIORAL_CONSTITUTIONAL_LAWS.length },
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
      metadata: { governanceLayer: 3, canonTier: 'constitutional-law', lawNumber: law.number, enforcement: law.enforcement },
      tags: ['constitution', 'canon', 'layer-3'],
    });

    edges.push({
      id: worldEdgeId('owns', constitutionRootId, id),
      type: 'owns',
      from: constitutionRootId,
      to: id,
      provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
    });

    for (const principleSlug of law.principleBasis) {
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
