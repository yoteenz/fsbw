import type { NewsroomDepartmentId, NewsroomPipelineStageId, QualityGateLayer } from './types';

export const NDXBOOK_NEWSROOM_STORAGE_KEY = 'studioOsNdxbookNewsroom_v1';
export const NDXBOOK_NEWSROOM_VERSION = '1.0.0';

export const NEWSROOM_PIPELINE_STAGES: { id: NewsroomPipelineStageId; label: string; executive: string }[] = [
  { id: 'idea', label: 'IDEA', executive: 'Chief Content Officer' },
  { id: 'research', label: 'RESEARCH', executive: 'Research AI' },
  { id: 'fact-verification', label: 'FACT CHECK', executive: 'Legal · Research' },
  { id: 'script', label: 'SCRIPT', executive: 'Chief Content Officer' },
  { id: 'storyboard', label: 'STORYBOARD', executive: 'Chief Creative Officer' },
  { id: 'creative-review', label: 'CREATIVE REVIEW', executive: 'Chief Creative Officer' },
  { id: 'host-assignment', label: 'HOST', executive: 'Talent Network' },
  { id: 'voice-generation', label: 'VOICE', executive: 'Voice Lab' },
  { id: 'animation', label: 'ANIMATION', executive: 'Animation Engine' },
  { id: 'thumbnail', label: 'THUMBNAIL', executive: 'Asset Director' },
  { id: 'captions', label: 'CAPTIONS', executive: 'Caption AI' },
  { id: 'quality-assurance', label: 'QA', executive: 'Operations' },
  { id: 'executive-review', label: 'EXEC REVIEW', executive: 'Chief of Staff' },
  { id: 'scheduled', label: 'SCHEDULED', executive: 'Chief Operations Officer' },
  { id: 'published', label: 'PUBLISHED', executive: 'Distribution' },
  { id: 'analytics', label: 'ANALYTICS', executive: 'Analytics Director' },
  { id: 'institutional-knowledge', label: 'INST. KNOWLEDGE', executive: 'Memory Bible' },
];

export const NEWSROOM_DEPARTMENTS: { id: NewsroomDepartmentId; label: string; lead: string }[] = [
  { id: 'research', label: 'RESEARCH', lead: 'Research AI' },
  { id: 'writing', label: 'WRITING', lead: 'Chief Content Officer' },
  { id: 'creative', label: 'CREATIVE', lead: 'Chief Creative Officer' },
  { id: 'voice', label: 'VOICE', lead: 'Voice Lab' },
  { id: 'animation', label: 'ANIMATION', lead: 'Animation Engine' },
  { id: 'publishing', label: 'PUBLISHING', lead: 'Chief Operations Officer' },
  { id: 'analytics', label: 'ANALYTICS', lead: 'Analytics Director' },
  { id: 'experiments', label: 'EXPERIMENTS', lead: 'Labs Director' },
  { id: 'intelligence', label: 'INTELLIGENCE', lead: 'Studio Intelligence' },
  { id: 'legal', label: 'LEGAL', lead: 'Chief Legal Officer' },
  { id: 'brand', label: 'BRAND', lead: 'Brand Director' },
  { id: 'operations', label: 'OPERATIONS', lead: 'Chief Operations Officer' },
];

export const QUALITY_GATE_LAYERS: QualityGateLayer[] = [
  'company-dna',
  'creative-dna',
  'writing-dna',
  'leadership-dna',
  'brand-guidelines',
  'legal',
  'chief-of-staff',
];

export const STAGE_ORDER: NewsroomPipelineStageId[] = NEWSROOM_PIPELINE_STAGES.map((s) => s.id);

export function nextStageId(current: NewsroomPipelineStageId): NewsroomPipelineStageId | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1] ?? null;
}

export function prevStageId(current: NewsroomPipelineStageId): NewsroomPipelineStageId | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return STAGE_ORDER[idx - 1] ?? null;
}
