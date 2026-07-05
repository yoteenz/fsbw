/** Intelligent Concierge Routing V1.0 — founders speak to the organization (Milestone 81.5). */

export const CONCIERGE_ROUTING_STORAGE_KEY = 'studioOsConciergeRouting_v1';
export const CONCIERGE_ROUTING_VERSION = '1.0.0';
export const CONCIERGE_ROUTING_ID = 'concierge-routing';

export const ROUTING_PHILOSOPHY = [
  'The founder speaks to the organization — the organization decides who should handle it.',
  'Do not force users to address a specific concierge.',
  'Never create events unless the founder explicitly says so or approves a suggested tentative window.',
] as const;

/** Universal command input label rotation — one entry point, no slash commands. */
export const UNIVERSAL_COMMAND_LABELS = [
  'ASK STUDIO OS',
  'TELL HEADQUARTERS',
  'ASK THE CONCIERGE TEAM',
] as const;

export const CONCIERGE_DISPLAY_NAMES = {
  'chief-concierge': 'Chief Concierge',
  'brand-concierge': 'Brand Concierge',
  'experience-concierge': 'Experience Concierge',
  'digital-concierge': 'Digital Concierge',
  'technology-concierge': 'Technology Concierge',
  'growth-concierge': 'Growth Concierge',
  'knowledge-concierge': 'Knowledge Concierge',
  'production-concierge': 'Production Concierge',
} as const;

export type ConciergeRoutingId = keyof typeof CONCIERGE_DISPLAY_NAMES;

/** Intent → primary + supporting concierge assignment rules. */
export const INTENT_CONCIERGE_MAP: Record<
  string,
  { primary: ConciergeRoutingId; supporting: ConciergeRoutingId[] }
> = {
  'schedule-change': { primary: 'chief-concierge', supporting: [] },
  'campaign-change': { primary: 'growth-concierge', supporting: ['brand-concierge'] },
  'content-production': { primary: 'production-concierge', supporting: ['brand-concierge', 'growth-concierge'] },
  'publishing-change': { primary: 'growth-concierge', supporting: ['digital-concierge'] },
  'personal-life': { primary: 'chief-concierge', supporting: [] },
  'workflow-dependency': { primary: 'chief-concierge', supporting: [] },
  'technology': { primary: 'technology-concierge', supporting: [] },
  'brand-creative': { primary: 'brand-concierge', supporting: [] },
  'customer-journey': { primary: 'experience-concierge', supporting: [] },
  'knowledge': { primary: 'knowledge-concierge', supporting: [] },
  'approval-deferral': { primary: 'chief-concierge', supporting: ['growth-concierge'] },
  'general': { primary: 'chief-concierge', supporting: [] },
};

export const ROUTING_CONFIDENCE_THRESHOLD = 72;

export const TIMELINE_COMMAND_EXAMPLES = [
  'Move my designer meeting to Thursday.',
  'Clear my afternoon.',
  'Push the Noir campaign back two weeks.',
  'Find the best day to post the first NDXBOOK video.',
  'Delay anything that needs my approval while I\'m traveling.',
  'Give me Friday off.',
  'Pause publishing while I\'m out of town.',
  'Schedule the first NDXBOOK video review.',
] as const;

export const ROUTING_CONNECTED_SYSTEMS = [
  'Executive Timeline',
  'Chief Concierge',
  'Concierge Layer',
  'Mission Control',
  'Production Studio',
  'Render Queue',
  'Publishing',
  'Campaign Engine',
  'Organization Intelligence',
  'Knowledge Graph',
] as const;
