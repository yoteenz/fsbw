import type { KnowledgeGraphEdge, KnowledgeGraphNode, KnowledgeGraphWorkflowMap } from '../../studio-interactive-manual/knowledge-graph/schema';

/** Intelligence stack graph seed — edges and workflows merged into Knowledge Graph at build time. */
export const DOCUMENTATION_SYNC_GRAPH_NODES: KnowledgeGraphNode[] = [];

export const DOCUMENTATION_SYNC_GRAPH_EDGES: KnowledgeGraphEdge[] = [
  { id: 'doc-edge-blueprint-brain', fromId: 'business-discovery-blueprint', toId: 'profession-brain', type: 'feeds', label: 'SEEDS EXPERTISE' },
  { id: 'doc-edge-brain-genome', fromId: 'profession-brain', toId: 'organization-genome', type: 'related-to', label: 'IDENTITY ALIGNMENT' },
  { id: 'doc-edge-brain-institute', fromId: 'profession-brain', toId: 'studio-institute', type: 'feeds', label: 'GENERATES COURSES' },
  { id: 'doc-edge-brain-foundation', fromId: 'profession-brain', toId: 'studio-foundation-models', type: 'feeds', label: 'TRAINING SOURCE' },
  { id: 'doc-edge-memory-fabric', fromId: 'memory-engine', toId: 'studio-intelligence-architecture', type: 'feeds', label: 'KNOWLEDGE FABRIC' },
  { id: 'doc-edge-vault-timeline', fromId: 'legacy-vault', toId: 'executive-timeline', type: 'related-to', label: 'PRESERVES JOURNEY' },
  { id: 'doc-edge-sia-orchestrator', fromId: 'studio-intelligence-architecture', toId: 'model-orchestrator', type: 'depends-on', label: 'MODEL GATEWAY' },
  { id: 'doc-edge-orchestrator-foundation', fromId: 'model-orchestrator', toId: 'studio-foundation-models', type: 'related-to', label: 'LONG-TERM ROADMAP' },
  { id: 'doc-edge-trust-orchestrator', fromId: 'professional-trust-framework', toId: 'model-orchestrator', type: 'requires-approval-from', label: 'SCOPE VALIDATION' },
  { id: 'doc-edge-manual-brain', fromId: 'organization-operating-manual', toId: 'profession-brain', type: 'updates', label: 'LIVE SYNC' },
  { id: 'doc-edge-manual-legacy', fromId: 'organization-operating-manual', toId: 'legacy-network', type: 'updates', label: 'SYNC CHAIN' },
  { id: 'doc-edge-legacy-sia', fromId: 'legacy-network', toId: 'studio-intelligence-architecture', type: 'feeds', label: 'SYNC CHAIN' },
  { id: 'doc-edge-dock-sia', fromId: 'command-dock', toId: 'studio-intelligence-architecture', type: 'depends-on', label: 'ALL AI REQUESTS' },
  { id: 'doc-edge-mc-dock', fromId: 'mission-control', toId: 'command-dock', type: 'contains', label: 'HEADQUARTERS' },
  { id: 'doc-edge-consciousness-sia', fromId: 'organizational-consciousness', toId: 'studio-intelligence-architecture', type: 'related-to', label: 'UNIFIED INTELLIGENCE' },
  { id: 'doc-edge-succession-vault', fromId: 'succession-mode', toId: 'legacy-vault', type: 'related-to', label: 'CONTINUITY' },
  { id: 'doc-edge-commerce-institute', fromId: 'knowledge-commerce', toId: 'studio-institute', type: 'related-to', label: 'SELL EXPERTISE' },
];

export const DOCUMENTATION_SYNC_GRAPH_WORKFLOWS: KnowledgeGraphWorkflowMap[] = [
  {
    id: 'doc-wf-getting-started',
    title: 'GETTING STARTED WITH STUDIO OS',
    subtitle: 'Progressive onboarding — organization to consciousness',
    nodeIds: [
      'business-discovery-blueprint',
      'profession-brain',
      'mission-control',
      'command-dock',
      'executive-council',
      'studio-institute',
      'knowledge-commerce',
      'studio-intelligence-architecture',
      'organizational-consciousness',
    ],
    moduleIds: [
      'business-discovery-blueprint',
      'profession-brain',
      'mission-control',
      'command-dock',
      'executive-council',
      'studio-institute',
      'knowledge-commerce',
      'studio-intelligence-architecture',
      'organizational-consciousness',
    ],
  },
  {
    id: 'doc-wf-intelligence-stack',
    title: 'STUDIO INTELLIGENCE STACK',
    subtitle: 'M120–M124 sync chain — manual to foundation models',
    nodeIds: [
      'organization-operating-manual',
      'legacy-network',
      'studio-intelligence-architecture',
      'model-orchestrator',
      'studio-foundation-models',
    ],
    moduleIds: [
      'organization-operating-manual',
      'legacy-network',
      'studio-intelligence-architecture',
      'model-orchestrator',
      'studio-foundation-models',
    ],
  },
  {
    id: 'doc-wf-hybrid-ai',
    title: 'HYBRID AI WORKFLOW',
    subtitle: 'Trust → Intelligence → Orchestrator → Profession Model',
    nodeIds: ['professional-trust-framework', 'studio-intelligence-architecture', 'model-orchestrator', 'studio-foundation-models', 'profession-brain'],
    moduleIds: ['professional-trust-framework', 'studio-intelligence-architecture', 'model-orchestrator', 'studio-foundation-models', 'profession-brain'],
  },
  {
    id: 'doc-wf-legacy-preservation',
    title: 'PRESERVE EXPERTISE · BUILD LEGACY',
    subtitle: 'Brain → Vault → Succession → Network',
    nodeIds: ['profession-brain', 'legacy-vault', 'succession-mode', 'legacy-network', 'executive-timeline'],
    moduleIds: ['profession-brain', 'legacy-vault', 'succession-mode', 'legacy-network', 'executive-timeline'],
  },
];
