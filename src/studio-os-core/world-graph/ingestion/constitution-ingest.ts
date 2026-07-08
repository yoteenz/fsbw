import { FOUNDATIONAL_LAWS } from '../../studio-world-constitution/laws';
import { SCENE_ASSEMBLY_IMMUTABILITY_LAW } from '../../scene-stack/assembly-law';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function ingestConstitutionalLawNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const worldGraphLawId = worldNodeId('constitutional-law', 'world-graph-is-truth');
  nodes.push({
    id: worldGraphLawId,
    slug: 'world-graph-is-truth',
    displayName: 'World Graph Is Truth™',
    nodeType: 'constitutional-law',
    lifecycle: 'live',
    plane: lifecyclePlane('live'),
    version: '1.0.0',
    summary:
      'The World Graph™ is the single canonical source of truth. All surfaces are projections.',
    docPaths: ['knowledge/canon/constitution/world-graph-law.md'],
    provenance: { source: 'constitution', ingestedAt: ts },
    tags: ['constitution', 'world-graph'],
  });

  for (const law of FOUNDATIONAL_LAWS) {
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
      codePaths: ['src/studio-os-core/studio-world-constitution/laws.ts'],
      docPaths: ['docs/studio-os/studio-world-constitution.md'],
      provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
      metadata: { lawNumber: law.number },
      tags: ['constitution', 'studio-world'],
    });

    edges.push({
      id: worldEdgeId('governed-by', 'W-ENG-world-graph', id),
      type: 'governed-by',
      from: 'W-ENG-world-graph',
      to: id,
      provenance: { source: 'constitution', sourceRef: law.id, ingestedAt: ts },
    });
  }

  const sceneLawId = worldNodeId('constitutional-law', SCENE_ASSEMBLY_IMMUTABILITY_LAW.id);
  nodes.push({
    id: sceneLawId,
    slug: SCENE_ASSEMBLY_IMMUTABILITY_LAW.id,
    displayName: 'Scene Assembly Immutability Law™',
    nodeType: 'constitutional-law',
    lifecycle: 'live',
    plane: lifecyclePlane('live'),
    version: SCENE_ASSEMBLY_IMMUTABILITY_LAW.version,
    summary: SCENE_ASSEMBLY_IMMUTABILITY_LAW.summary,
    codePaths: ['src/studio-os-core/scene-stack/assembly-law.ts'],
    docPaths: ['docs/studio-os/scene-stack/quality-preservation-law.md'],
    provenance: { source: 'scene-stack', ingestedAt: ts },
    tags: ['scene-stack', 'constitution'],
  });

  edges.push({
    id: worldEdgeId('governed-by', 'W-ENG-scene-stack', sceneLawId),
    type: 'governed-by',
    from: 'W-ENG-scene-stack',
    to: sceneLawId,
    provenance: { source: 'scene-stack', ingestedAt: ts },
  });

  edges.push({
    id: worldEdgeId('depends-on', sceneLawId, worldNodeId('foundational-physics-law', 'scene-integrity')),
    type: 'depends-on',
    from: sceneLawId,
    to: worldNodeId('foundational-physics-law', 'scene-integrity'),
    label: 'physics-basis',
    provenance: { source: 'scene-stack', ingestedAt: ts },
  });

  edges.push({
    id: worldEdgeId('depends-on', worldGraphLawId, worldNodeId('foundational-physics-law', 'world-memory')),
    type: 'depends-on',
    from: worldGraphLawId,
    to: worldNodeId('foundational-physics-law', 'world-memory'),
    label: 'physics-basis',
    provenance: { source: 'constitution', ingestedAt: ts },
  });

  return { nodes, edges };
}
