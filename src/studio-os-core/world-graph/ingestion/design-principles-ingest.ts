import { DESIGN_PRINCIPLES } from '../../design-principles/principles';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** Register Design Principles™ as Layer 1 governance nodes. */
export function ingestDesignPrincipleNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const rootId = worldNodeId('design-principle', 'design-principles');
  nodes.push({
    id: rootId,
    slug: 'design-principles',
    displayName: 'Design Principles™',
    nodeType: 'design-principle',
    lifecycle: 'live',
    plane: lifecyclePlane('live'),
    version: '1.0.0',
    summary:
      'Layer 1 — philosophy and experience north star. Guides decisions when multiple valid solutions exist.',
    docPaths: [
      'docs/studio-os/governance/STUDIO_WORLD_GOVERNANCE_HIERARCHY.md',
      'knowledge/canon/design-principles/README.md',
    ],
    codePaths: ['src/studio-os-core/design-principles/principles.ts'],
    provenance: { source: 'constitution', sourceRef: 'design-principles', ingestedAt: ts },
    tags: ['canon', 'design-principles', 'layer-1'],
    metadata: { governanceLayer: 1, canonTier: 'design-principle', principleCount: DESIGN_PRINCIPLES.length },
  });

  for (const p of DESIGN_PRINCIPLES) {
    const id = worldNodeId('design-principle', p.id);
    nodes.push({
      id,
      slug: p.id,
      displayName: p.title,
      nodeType: 'design-principle',
      lifecycle: 'live',
      plane: lifecyclePlane('live'),
      version: '1.0.0',
      summary: p.summary,
      docPaths: [`knowledge/canon/design-principles/${p.id}.md`],
      codePaths: ['src/studio-os-core/design-principles/principles.ts'],
      provenance: { source: 'constitution', sourceRef: p.id, ingestedAt: ts },
      metadata: { governanceLayer: 1, principleNumber: p.number, decisionGuide: p.decisionGuide },
      tags: ['design-principle', 'canon', 'layer-1'],
    });

    edges.push({
      id: worldEdgeId('owns', rootId, id),
      type: 'owns',
      from: rootId,
      to: id,
      provenance: { source: 'constitution', sourceRef: p.id, ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
