/** Knowledge Graph — node and relationship schema (StudioOS Interactive Manual). */

export type KnowledgeGraphNodeType =
  | 'workspace'
  | 'module'
  | 'page'
  | 'tab'
  | 'feature'
  | 'widget'
  | 'button'
  | 'status'
  | 'workflow'
  | 'asset-type'
  | 'database'
  | 'manual-chapter'
  | 'tutorial-step'
  | 'customer-feature';

export type KnowledgeGraphRelationType =
  | 'depends-on'
  | 'creates'
  | 'updates'
  | 'displays'
  | 'publishes-to'
  | 'inherits-from'
  | 'generates'
  | 'requires-approval-from'
  | 'used-by'
  | 'related-to'
  | 'teaches'
  | 'documented-by'
  | 'contains'
  | 'feeds';

export type KnowledgeGraphNode = {
  id: string;
  name: string;
  type: KnowledgeGraphNodeType;
  description: string;
  purpose?: string;
  route?: string;
  targetSelector?: string;
  moduleId?: string;
  parentNodeId?: string;
  childNodeIds?: string[];
  relatedWorkflowIds?: string[];
  relatedManualChapter?: string;
  manualSection?: string;
  manualAnchor?: string;
  versionIntroduced?: string;
  versionUpdated?: string;
  status?: 'live' | 'demo' | 'draft' | 'coming-soon';
  searchKeywords?: string[];
};

export type KnowledgeGraphEdge = {
  id: string;
  fromId: string;
  toId: string;
  type: KnowledgeGraphRelationType;
  label?: string;
};

export type KnowledgeGraphWorkflowMap = {
  id: string;
  title: string;
  subtitle?: string;
  nodeIds: string[];
  moduleIds?: string[];
};

export type KnowledgeGraph = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  workflows: KnowledgeGraphWorkflowMap[];
};

export type KnowledgeGraphSearchHit = {
  id: string;
  nodeId: string;
  label: string;
  snippet: string;
  type: KnowledgeGraphNodeType;
  moduleId?: string;
  route?: string;
  manualChapter?: string;
  workflowId?: string;
  score: number;
};

export type ModuleGraphEntry = {
  moduleNode: KnowledgeGraphNode;
  connected: Array<{ node: KnowledgeGraphNode; relation: KnowledgeGraphRelationType; label?: string }>;
  workflows: KnowledgeGraphWorkflowMap[];
  manualChapter?: string;
};
