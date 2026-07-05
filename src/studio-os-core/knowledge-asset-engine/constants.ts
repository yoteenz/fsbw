import type { KnowledgeAssetTypeId, KnowledgeMaturityStage } from './types';

export const KNOWLEDGE_ASSET_ENGINE_STORAGE_KEY = 'studioOsKnowledgeAssetEngine_v1';
export const KNOWLEDGE_ASSET_ENGINE_VERSION = '1.0.0';
export const KNOWLEDGE_ASSET_ENGINE_ID = 'knowledge-asset-engine';

export const KNOWLEDGE_PHILOSOPHY = [
  'Everything created inside Studio OS is a knowledge asset',
  'Not isolated pages · videos · documents — one unified knowledge model',
  'Living organizational intelligence that evolves · distributes · teaches · generates revenue',
  'Knowledge becomes the most valuable asset inside every company',
] as const;

export const KNOWLEDGE_ASSET_TYPES: { id: KnowledgeAssetTypeId; label: string }[] = [
  { id: 'page', label: 'PAGE' },
  { id: 'video', label: 'VIDEO' },
  { id: 'script', label: 'SCRIPT' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'article', label: 'ARTICLE' },
  { id: 'newsletter', label: 'NEWSLETTER' },
  { id: 'podcast', label: 'PODCAST' },
  { id: 'ebook', label: 'EBOOK' },
  { id: 'course', label: 'COURSE' },
  { id: 'presentation', label: 'PRESENTATION' },
  { id: 'design-system', label: 'DESIGN SYSTEM' },
  { id: 'workflow', label: 'WORKFLOW' },
  { id: 'prompt', label: 'PROMPT' },
  { id: 'automation', label: 'AUTOMATION' },
  { id: 'playbook', label: 'PLAYBOOK' },
  { id: 'meeting', label: 'MEETING' },
  { id: 'simulation', label: 'SIMULATION' },
  { id: 'case-study', label: 'CASE STUDY' },
  { id: 'lesson', label: 'LESSON' },
  { id: 'company-dna', label: 'COMPANY DNA' },
  { id: 'creative-dna', label: 'CREATIVE DNA' },
];

export const MATURITY_STAGES: { stage: KnowledgeMaturityStage; label: string; description: string }[] = [
  { stage: 'draft', label: 'DRAFT', description: 'Early creation · unvalidated' },
  { stage: 'validated', label: 'VALIDATED', description: 'Tested · performance confirmed' },
  { stage: 'institutional', label: 'INSTITUTIONAL', description: 'Embedded in operations' },
  { stage: 'foundational', label: 'FOUNDATIONAL', description: 'Core organizational knowledge' },
  { stage: 'timeless', label: 'TIMELESS', description: 'Evergreen · compounds forever' },
];

export const KNOWLEDGE_ASSET_CONNECTED_SYSTEMS = [
  'Knowledge Graph',
  'Reader Graph',
  'Relationship Engine',
  'Distribution Engine',
  'Newsroom',
  'Strategy Engine',
  'Campaign Engine',
  'Chief of Staff',
  'Studio Intelligence',
  'Organizational Inheritance',
  'Ecosystem Marketplace',
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Operational DNA',
] as const;
