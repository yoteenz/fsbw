import type { MasterContentLifecycleStageId } from './types';

export type MasterContentLifecycleStage = {
  id: MasterContentLifecycleStageId;
  order: number;
  label: string;
  shortLabel: string;
  description: string;
  /** Product surfaces that own this stage */
  owners: string[];
};

/** Canonical 17-stage Studio OS content lifecycle — permanent operating philosophy. */
export const MASTER_CONTENT_LIFECYCLE: MasterContentLifecycleStage[] = [
  {
    id: 'concept-opportunity',
    order: 1,
    label: 'CONCEPT / OPPORTUNITY',
    shortLabel: 'OPPORTUNITY',
    description: 'Identify opportunities worth producing — no content created yet.',
    owners: ['Strategy Engine™', 'Innovation Lab™', 'Mission Control'],
  },
  {
    id: 'campaign-assignment',
    order: 2,
    label: 'CAMPAIGN ASSIGNMENT',
    shortLabel: 'CAMPAIGN',
    description: 'Attach the opportunity to a campaign so Studio OS understands WHY content exists.',
    owners: ['Campaign Engine™'],
  },
  {
    id: 'research-knowledge',
    order: 3,
    label: 'RESEARCH & KNOWLEDGE GATHERING',
    shortLabel: 'RESEARCH',
    description: 'Sources, statistics, knowledge assets, and competitive context before generation.',
    owners: ['Campaign Engine™', 'Knowledge Hub', 'Profession Brain™'],
  },
  {
    id: 'storyboard-script',
    order: 4,
    label: 'STORYBOARD + SCRIPT',
    shortLabel: 'STORYBOARD',
    description: 'Outline, hook, visual direction, and script approved before production.',
    owners: ['Newsroom™', 'Production Builder', 'Campaign Workspace'],
  },
  {
    id: 'talent-selection',
    order: 5,
    label: 'TALENT SELECTION & AVAILABILITY',
    shortLabel: 'TALENT',
    description: 'Who appears, availability, wardrobe, equipment, and talent confirmations.',
    owners: ['Talent Network', 'Casting', 'Newsroom™'],
  },
  {
    id: 'production-planning',
    order: 6,
    label: 'PRODUCTION PLANNING',
    shortLabel: 'PLANNING',
    description: 'Timeline, locations, props, dependencies, and production checklist.',
    owners: ['Work Orchestration Engine', 'Production Studio', 'Campaign Engine™'],
  },
  {
    id: 'master-content-creation',
    order: 7,
    label: 'MASTER CONTENT CREATION™',
    shortLabel: 'MASTER ASSET',
    description: 'Create the Master Content Asset™ — single source of truth (Page 001, episode, article, video, …).',
    owners: ['Newsroom™', 'Publishing Studio™', 'NDXBook Registry'],
  },
  {
    id: 'internal-editing',
    order: 8,
    label: 'INTERNAL EDITING',
    shortLabel: 'EDITING',
    description: 'Grammar, brand voice, accessibility, SEO, legal, formatting, and fact accuracy.',
    owners: ['Newsroom Editor', 'Campaign Deliverables Manager™'],
  },
  {
    id: 'concierge-review-board',
    order: 9,
    label: 'CONCIERGE REVIEW BOARD™',
    shortLabel: 'REVIEW BOARD',
    description: 'Multidisciplinary concierge review — PASS · WARNING · FAIL per expertise area.',
    owners: ['Concierge Approval Flow', 'Studio Intelligence™'],
  },
  {
    id: 'founder-approval',
    order: 10,
    label: 'FOUNDER APPROVAL',
    shortLabel: 'FOUNDER',
    description: 'Configurable founder approval when campaign policy requires it.',
    owners: ['Concierge Approval Flow', 'Mission Control'],
  },
  {
    id: 'content-expansion',
    order: 11,
    label: 'CONTENT EXPANSION ENGINE™',
    shortLabel: 'EXPANSION',
    description: 'Generate platform-specific derivatives linked to the Master Content Asset™.',
    owners: ['Content Expansion Engine™', 'Distribution Engine', 'Campaign Engine™'],
  },
  {
    id: 'multi-platform-review',
    order: 12,
    label: 'MULTI-PLATFORM ASSET REVIEW',
    shortLabel: 'DERIVATIVES',
    description: 'Each derivative receives its own review — master approval does not auto-approve derivatives.',
    owners: ['Campaign Deliverables Manager™', 'Publishing Studio™'],
  },
  {
    id: 'scheduling',
    order: 13,
    label: 'SCHEDULING',
    shortLabel: 'SCHEDULE',
    description: 'Approved assets enter Campaign Engine scheduling — sequenced, time-zoned, recurring.',
    owners: ['Campaign Engine™', 'Publishing Queue', 'Distribution Network'],
  },
  {
    id: 'publishing',
    order: 14,
    label: 'PUBLISHING',
    shortLabel: 'PUBLISH',
    description: 'Only approved assets may publish — immediate, scheduled, staged, or platform-specific.',
    owners: ['Publishing Studio™', 'Social Publishing', 'Distribution Network'],
  },
  {
    id: 'performance-evaluation',
    order: 15,
    label: 'PERFORMANCE EVALUATION',
    shortLabel: 'PERFORMANCE',
    description: 'Performance Concierge™ evaluates reach, engagement, retention, and campaign outcomes.',
    owners: ['Studio Intelligence™', 'Analytics', 'Mission Control'],
  },
  {
    id: 'studio-intelligence-learning',
    order: 16,
    label: 'STUDIO INTELLIGENCE™ LEARNING',
    shortLabel: 'LEARNING',
    description: 'Update knowledge graph, audience memory, and recommendation engine from results.',
    owners: ['Studio Intelligence™', 'Memory Engine™', 'Knowledge Graph™'],
  },
  {
    id: 'knowledge-library',
    order: 17,
    label: 'KNOWLEDGE LIBRARY™',
    shortLabel: 'LIBRARY',
    description: 'Archive master asset, derivatives, performance, research, and lessons learned.',
    owners: ['Knowledge Library™', 'Memory Bible', 'Profession Brain™'],
  },
];

export function getLifecycleStage(id: MasterContentLifecycleStageId): MasterContentLifecycleStage {
  const stage = MASTER_CONTENT_LIFECYCLE.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown lifecycle stage: ${id}`);
  return stage;
}

export function lifecycleStageIndex(id: MasterContentLifecycleStageId): number {
  return getLifecycleStage(id).order;
}
