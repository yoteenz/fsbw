import type { WorldGraph, WorldGraphProjectionKind } from './types';

/** Projections are views over the graph — never write back to canon */
export type WorldGraphProjection = {
  kind: WorldGraphProjectionKind;
  title: string;
  description: string;
  nodeFilter?: (graph: WorldGraph) => string[];
};

export const WORLD_GRAPH_PROJECTIONS: WorldGraphProjection[] = [
  {
    kind: 'bible',
    title: 'Studio World Bible™',
    description: 'Curated narrative publication generated from canon nodes.',
  },
  {
    kind: 'knowledge-library',
    title: 'Knowledge Library™',
    description: 'Immersive walkable exploration of knowledge relationships in Archives.',
  },
  {
    kind: 'atlas',
    title: 'Studio World Atlas™',
    description: 'Spatial visualization of located-in and integrates-with edges.',
  },
  {
    kind: 'archivist',
    title: 'Orb Archivist™',
    description: 'Relationship-first query interface into the World Graph.',
  },
  {
    kind: 'dependency-map',
    title: 'Dependency Maps™',
    description: 'depends-on / required-by edge visualization.',
  },
  {
    kind: 'timeline',
    title: 'Historical Timelines™',
    description: 'historical-event and supersedes chains over time.',
  },
  {
    kind: 'museum',
    title: 'Museum Exhibits™',
    description: 'legacy and historical plane nodes as exhibits.',
  },
  {
    kind: 'engineering-docs',
    title: 'Engineering Docs™',
    description: 'engine, milestone, implementation-sprint nodes with code paths.',
  },
  {
    kind: 'search',
    title: 'Unified Search™',
    description: 'Full-graph search index — all projections query the same graph.',
  },
];

export function listProjectionKinds(): WorldGraphProjectionKind[] {
  return WORLD_GRAPH_PROJECTIONS.map((p) => p.kind);
}
