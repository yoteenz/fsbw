/** Innovation Lineage™ — permanent living innovation graph */

export const INNOVATION_LINEAGE_VERSION = '1.0.0';
export const INNOVATION_LINEAGE_STORAGE_KEY = 'studioOsInnovationLineage_v1';
export const STUDIO_OS_INNOVATION_LINEAGE_UPDATED = 'studio-os-innovation-lineage-updated';

export const INNOVATION_LINEAGE_ACCENT = '#e8a84c';

export const LINEAGE_RELATION_TYPES = [
  'original-creator',
  'inspired-by',
  'forked-from',
  'merged-with',
  'enhanced-by',
  'automation-added-by',
  'marketplace-contributor',
  'current-maintainer',
  'company-using',
] as const;

export const LINEAGE_RELATION_LABELS: Record<(typeof LINEAGE_RELATION_TYPES)[number], string> = {
  'original-creator': 'Original Creator™',
  'inspired-by': 'Inspired By™',
  'forked-from': 'Forked From™',
  'merged-with': 'Merged With™',
  'enhanced-by': 'Enhanced By™',
  'automation-added-by': 'Automation Added By™',
  'marketplace-contributor': 'Marketplace Contributor™',
  'current-maintainer': 'Current Maintainer™',
  'company-using': 'Company Using It™',
};

export const CONTRIBUTION_TIMELINE_DOMAINS = [
  'architecture',
  'creative-direction',
  'storytelling',
  'automation',
  'programming',
  'ui-design',
  'lighting',
  'environment',
  'brand-strategy',
  'operations',
  'customer-experience',
  'ai-logic',
  'genome-design',
] as const;

export const CONTRIBUTION_TIMELINE_LABELS: Record<(typeof CONTRIBUTION_TIMELINE_DOMAINS)[number], string> = {
  architecture: 'Architecture',
  'creative-direction': 'Creative Direction',
  storytelling: 'Storytelling',
  automation: 'Automation',
  programming: 'Programming',
  'ui-design': 'UI Design',
  lighting: 'Lighting',
  environment: 'Environment',
  'brand-strategy': 'Brand Strategy',
  operations: 'Operations',
  'customer-experience': 'Customer Experience',
  'ai-logic': 'AI Logic',
  'genome-design': 'Genome Design',
};

export const FORK_ACTIONS = ['fork', 'improve', 'customize', 'merge', 'republish'] as const;

export const FORK_ACTION_LABELS: Record<(typeof FORK_ACTIONS)[number], string> = {
  fork: 'Fork™',
  improve: 'Improve™',
  customize: 'Customize™',
  merge: 'Merge™',
  republish: 'Republish™',
};

export const INNOVATION_ASSET_KINDS = [
  'blueprint',
  'headquarters',
  'department',
  'workflow',
  'ai-system',
  'workspace',
  'asset',
  'expedition',
  'marketplace-product',
  'innovation',
] as const;

export const INNOVATION_ASSET_KIND_LABELS: Record<(typeof INNOVATION_ASSET_KINDS)[number], string> = {
  blueprint: 'Blueprint™',
  headquarters: 'Headquarters™',
  department: 'Department™',
  workflow: 'Workflow™',
  'ai-system': 'AI System™',
  workspace: 'Workspace™',
  asset: 'Asset™',
  expedition: 'Expedition™',
  'marketplace-product': 'Marketplace Product™',
  innovation: 'Innovation™',
};
