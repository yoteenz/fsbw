/**
 * Studio World Graph™ — canonical civilization model.
 * The graph is truth; Bible, Atlas, Archives, Orb are projections.
 */

export const WORLD_GRAPH_VERSION = 'world-graph.v1';

/** Universal lifecycle — nothing disappears, history is permanent. */
export const WORLD_LIFECYCLE_STAGES = [
  'spark',
  'concept',
  'research',
  'architecture',
  'prototype',
  'review',
  'approved',
  'implemented',
  'live',
  'versioned',
  'deprecated',
  'historical',
  'legacy',
] as const;

export type WorldLifecycleStage = (typeof WORLD_LIFECYCLE_STAGES)[number];

export type WorldPlane = 'canon' | 'working' | 'historical';

/** Node domains — civilization-wide, not documentation-only. */
export const WORLD_NODE_TYPES = [
  'knowledge-object',
  'architectural-decision',
  'constitutional-law',
  'foundational-physics-law',
  'implementation-standard',
  'blueprint',
  'master-scene-blueprint',
  'scene-graph',
  'scene-stack-layer',
  'company',
  'organization',
  'founder',
  'headquarters',
  'flagship',
  'district',
  'wing',
  'room',
  'department',
  'engine',
  'ai-agent',
  'orb-personality',
  'marketplace-product',
  'marketplace-transaction',
  'asset',
  'asset-pack',
  'environment-shell',
  'lighting-preset',
  'furniture-collection',
  'material',
  'camera',
  'animation',
  'innovation-lineage',
  'innovation-constellation',
  'innovation-expedition',
  'collaboration',
  'reputation',
  'company-genome',
  'founder-genome',
  'industry-genome',
  'historical-event',
  'future-simulation',
  'golden-build',
  'warehouse-object',
  'publication',
  'implementation-sprint',
  'milestone',
  'era',
] as const;

export type WorldNodeType = (typeof WORLD_NODE_TYPES)[number];

export const WORLD_EDGE_TYPES = [
  'owns',
  'implements',
  'governed-by',
  'depends-on',
  'required-by',
  'references',
  'located-in',
  'integrates-with',
  'spawned-from',
  'supersedes',
  'deprecated-by',
  'inspired-by',
  'evolved-into',
  'created-by',
  'collaborated-with',
  'reused-by',
  'generated-from',
  'published-as',
  'projects-to',
] as const;

export type WorldEdgeType = (typeof WORLD_EDGE_TYPES)[number];

export type WorldNodeProvenance = {
  source: 'bootstrap' | 'route-registry' | 'master-spec' | 'scene-stack' | 'constitution' | 'manual' | 'ingestion';
  sourceRef?: string;
  ingestedAt: string;
};

export type WorldNode = {
  /** Stable World Graph ID — e.g. W-FLG-studio-archives */
  id: string;
  slug: string;
  displayName: string;
  nodeType: WorldNodeType;
  lifecycle: WorldLifecycleStage;
  plane: WorldPlane;
  version: string;
  summary?: string;
  aliases?: string[];
  tags?: string[];
  /** Implementation projection metadata */
  implementationStatus?: 'spec' | 'prototype' | 'live' | 'deprecated';
  routes?: { worldPath?: string; legacyPath?: string };
  codePaths?: string[];
  docPaths?: string[];
  provenance: WorldNodeProvenance;
  metadata?: Record<string, string | number | boolean | string[]>;
};

export type WorldEdge = {
  id: string;
  type: WorldEdgeType;
  from: string;
  to: string;
  label?: string;
  provenance: WorldNodeProvenance;
};

export type WorldGraph = {
  graphId: string;
  version: string;
  compiledAt: string;
  nodeCount: number;
  edgeCount: number;
  nodes: WorldNode[];
  edges: WorldEdge[];
  /** Projections are views — never authoritative */
  canonicalRule: 'world-graph-is-truth';
};

export type WorldGraphValidationIssue = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type WorldGraphValidationResult = {
  ok: boolean;
  issues: WorldGraphValidationIssue[];
  stats: {
    nodes: number;
    edges: number;
    orphans: number;
    danglingEdges: number;
  };
};

export type WorldGraphQueryFilter = {
  nodeType?: WorldNodeType | WorldNodeType[];
  lifecycle?: WorldLifecycleStage | WorldLifecycleStage[];
  plane?: WorldPlane;
  tag?: string;
  search?: string;
};

export type WorldGraphProjectionKind =
  | 'bible'
  | 'knowledge-library'
  | 'atlas'
  | 'archivist'
  | 'dependency-map'
  | 'timeline'
  | 'museum'
  | 'engineering-docs'
  | 'search';
