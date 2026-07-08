import { CURRENT_STUDIO_WORLD_ERA } from '../era-evaluation';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

const ERAS: Array<{
  slug: string;
  name: string;
  summary: string;
  order: number;
  systems: string[];
}> = [
  {
    slug: 'knowledge',
    name: 'ERA 1 — Knowledge™',
    summary:
      'Memory first. Studio World understands itself. World Graph™, genomes, constitutional law, scene graphs, asset registry.',
    order: 1,
    systems: [
      'World Graph™',
      'Knowledge Core™',
      'Studio World Bible™',
      'Knowledge Library™',
      'Blueprint Registry™',
      'Architecture Decisions™',
      'Constitutional Laws™',
      'Dependency Graph™',
      'Scene Graph™',
      'Asset Registry™',
      'Company Genome™',
      'Founder Genome™',
      'Industry Genome™',
    ],
  },
  {
    slug: 'world',
    name: 'ERA 2 — World™',
    summary:
      'Living civilization. The graph drives places, relationships, and history. Atlas, HQ, departments, marketplace, timelines.',
    order: 2,
    systems: [
      'Studio World Atlas™',
      'Headquarters',
      'Departments',
      'Wings',
      'Rooms',
      'Museum',
      'Warehouse',
      'Marketplace',
      'Archives',
      'Innovation Districts',
      'Organizations',
      'Collaboration Network',
      'Living Scene Graphs',
      'Historical Timeline',
      'Future Simulations',
    ],
  },
  {
    slug: 'intelligence',
    name: 'ERA 3 — Intelligence™',
    summary:
      'Reasoning over the graph. Proactive assistance — Orb Intelligence™, planners, auditors, recommenders.',
    order: 3,
    systems: [
      'Orb Intelligence™',
      'Creative Planning™',
      'Architecture Auditor™',
      'Experience Intelligence Engine™',
      'Build Sequencer™',
      'Cost Optimizer™',
      'Asset Reuse Advisor™',
      'Collaboration Matcher™',
      'Marketplace Intelligence™',
      'Future Merge™',
      'Parallel Futures™',
      'Risk Analysis™',
      'Organization Health™',
      'Opportunity Discovery™',
      'Recommendation Engine™',
    ],
  },
];

/** Register Three Eras Roadmap™ as civilization architecture nodes. */
export function ingestEraRoadmapNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const threeErasLawId = worldNodeId('constitutional-law', 'three-eras-roadmap');
  nodes.push({
    id: threeErasLawId,
    slug: 'three-eras-roadmap',
    displayName: 'Three Eras Roadmap™',
    nodeType: 'constitutional-law',
    lifecycle: 'live',
    plane: lifecyclePlane('live'),
    version: '1.0.0',
    summary:
      'Studio World evolves Knowledge™ → World™ → Intelligence™. Current era: Knowledge™. Implementation gate before code ships.',
    docPaths: [
      'knowledge/canon/constitution/three-eras-roadmap.md',
      'docs/studio-os/world-graph/STUDIO_WORLD_THREE_ERAS_ROADMAP.md',
    ],
    provenance: { source: 'constitution', sourceRef: 'three-eras-roadmap', ingestedAt: ts },
    tags: ['constitution', 'architecture', 'era-roadmap'],
    metadata: { currentEra: CURRENT_STUDIO_WORLD_ERA, eraCount: 3 },
  });

  const worldGraphId = worldNodeId('engine', 'world-graph');
  edges.push({
    id: worldEdgeId('governed-by', worldGraphId, threeErasLawId),
    type: 'governed-by',
    from: worldGraphId,
    to: threeErasLawId,
    provenance: { source: 'constitution', sourceRef: 'three-eras-roadmap', ingestedAt: ts },
  });

  const eraIds: string[] = [];

  for (const era of ERAS) {
    const id = worldNodeId('era', era.slug);
    eraIds.push(id);
    const lifecycle = era.slug === CURRENT_STUDIO_WORLD_ERA ? 'live' : 'architecture';

    nodes.push({
      id,
      slug: era.slug,
      displayName: era.name,
      nodeType: 'era',
      lifecycle,
      plane: lifecyclePlane(lifecycle),
      version: '1.0.0',
      summary: era.summary,
      docPaths: ['docs/studio-os/world-graph/STUDIO_WORLD_THREE_ERAS_ROADMAP.md'],
      provenance: { source: 'bootstrap', sourceRef: era.slug, ingestedAt: ts },
      tags: ['era', 'architecture'],
      metadata: {
        eraOrder: era.order,
        isCurrentEra: era.slug === CURRENT_STUDIO_WORLD_ERA,
        plannedSystems: era.systems,
      },
    });

    edges.push({
      id: worldEdgeId('references', id, threeErasLawId),
      type: 'references',
      from: id,
      to: threeErasLawId,
      label: 'governed-by',
      provenance: { source: 'bootstrap', sourceRef: era.slug, ingestedAt: ts },
    });
  }

  // Knowledge → World → Intelligence evolution chain
  for (let i = 0; i < eraIds.length - 1; i++) {
    edges.push({
      id: worldEdgeId('evolved-into', eraIds[i], eraIds[i + 1]),
      type: 'evolved-into',
      from: eraIds[i],
      to: eraIds[i + 1],
      label: 'era-sequence',
      provenance: { source: 'bootstrap', ingestedAt: ts },
    });
    edges.push({
      id: worldEdgeId('depends-on', eraIds[i + 1], eraIds[i]),
      type: 'depends-on',
      from: eraIds[i + 1],
      to: eraIds[i],
      label: 'requires-era-foundation',
      provenance: { source: 'bootstrap', ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
