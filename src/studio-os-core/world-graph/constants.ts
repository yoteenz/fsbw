import type { WorldEdgeType, WorldLifecycleStage, WorldNodeType } from './types';

export const WORLD_GRAPH_STORAGE_KEY = 'studioOsWorldGraph_v1';

export const WORLD_GRAPH_PUBLIC_PATH = '/studio-os/world-graph/graph.json';

/** Lifecycle promotion order for validation */
export const LIFECYCLE_ORDER: Record<WorldLifecycleStage, number> = {
  spark: 0,
  concept: 1,
  research: 2,
  architecture: 3,
  prototype: 4,
  review: 5,
  approved: 6,
  implemented: 7,
  live: 8,
  versioned: 9,
  deprecated: 10,
  historical: 11,
  legacy: 12,
};

/** Knowledge Graph is first subsystem — maps to knowledge-object node type */
export const KNOWLEDGE_SUBSYSTEM_NODE_TYPE: WorldNodeType = 'knowledge-object';

export const DEFAULT_EDGE_LABELS: Partial<Record<WorldEdgeType, string>> = {
  owns: 'owns',
  implements: 'implements',
  'governed-by': 'governed by',
  'depends-on': 'depends on',
  'required-by': 'required by',
  references: 'references',
  'located-in': 'located in',
  'integrates-with': 'integrates with',
  'spawned-from': 'spawned from',
  supersedes: 'supersedes',
  'deprecated-by': 'deprecated by',
  'inspired-by': 'inspired by',
  'evolved-into': 'evolved into',
  'created-by': 'created by',
  'collaborated-with': 'collaborated with',
  'reused-by': 'reused by',
  'generated-from': 'generated from',
  'published-as': 'published as',
  'projects-to': 'projects to',
};
