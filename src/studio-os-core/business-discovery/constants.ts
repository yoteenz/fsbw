import type { BusinessDiscoveryPhaseId } from './types';

export const BUSINESS_DISCOVERY_ENGINE_ARTICLE = {
  id: 'BD01',
  title: 'Business Discovery™',
  approvedDate: '2026-07-09',
  summary:
    'Studio OS signature onboarding that replaces SaaS setup with a premium strategy session producing the Company Genome™.',
} as const;

export const BUSINESS_DISCOVERY_ENGINE_VERSION = '1.0.0';

export const BUSINESS_DISCOVERY_STORAGE_KEY = 'studio-os:business-discovery';

export const BUSINESS_DISCOVERY_UPDATED_EVENT = 'studio-os:business-discovery-updated';

export const DISCOVERY_SESSION_STATUS_ORDER = [
  'not-started',
  'in-progress',
  'genome-ready',
  'headquarters-ready',
  'complete',
] as const;

export const PHASE_COMPLETION_THRESHOLD = 75;

export const GENOME_COMPLETION_THRESHOLD = 85;

export const DISCOVERY_INSIGHT_CONFIDENCE_WEIGHTS = {
  responseDepth: 0.35,
  phaseCoverage: 0.25,
  relationshipDensity: 0.2,
  knowledgeCoverage: 0.2,
} as const;

export const DISCOVERY_RISK_SEVERITY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

export const AUTOMATION_READINESS_THRESHOLD = 70;

export const ORB_DISCOVERY_CONTEXT_LINES = [
  'Before we map your company, tell me what future you are building toward.',
  'Every answer becomes Company Genome material — nothing is wasted configuration.',
  'We are discovering the business behind the business.',
  'Your customer journey is beginning to take shape.',
  'Three operational dependencies surfaced — worth reviewing together.',
  'Your first Headquarters proposal is ready when the evidence supports it.',
] as const;

export const FOUNDER_MOMENT_TRIGGERS: Record<BusinessDiscoveryPhaseId, string[]> = {
  'founder-discovery': [
    'Your leadership pattern is beginning to emerge.',
    'We found the decisions that should always stay founder-led.',
  ],
  'company-discovery': [
    'Your business is beginning to take shape.',
    'We mapped how value moves from request to delivery.',
  ],
  'relationship-discovery': [
    'We discovered hidden bottlenecks in how work connects.',
    'Your operational graph now shows who owns what.',
  ],
  'knowledge-discovery': [
    'Your knowledge foundation is clearer than most mature companies.',
    'We found gaps where documentation could protect the team.',
  ],
  'business-genome': [
    'Your Company Genome™ is taking form.',
    'Automation and AI opportunities are now evidence-based.',
  ],
  'headquarters-generation': [
    'Your first Headquarters is ready.',
    'Welcome to your company\'s new home.',
  ],
};
