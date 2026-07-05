import type { CampusStageId } from './types';

export const CAMPUS_EVOLUTION_STORAGE_KEY = 'studioOsCampusEvolution_v1';
export const CAMPUS_EVOLUTION_VERSION = '1.0.0';
export const CAMPUS_EVOLUTION_ID = 'campus-evolution-engine';

export const CAMPUS_PHILOSOPHY = [
  'Great companies grow — their headquarters should grow with them',
  'Architecture is the physical manifestation of organizational evolution',
  'Earn environments through meaningful progress — not manual customization',
  'Walk through the story of your company · not static dashboards',
] as const;

export const CAMPUS_EVOLUTION_CONNECTED_SYSTEMS = [
  'Architect Studio',
  'Living Headquarters',
  'Company Genome',
  'Knowledge Graph',
  'Reader Graph',
  'Relationship Engine',
  'Business Architect',
  'Brand Architect',
  'Experience Architect',
  'Digital Architect',
  'Growth Architect',
  'Chief of Staff',
  'Studio Intelligence',
  'Organizational Inheritance',
] as const;

export const CAMPUS_STAGE_DEFS: { id: CampusStageId; label: string; description: string }[] = [
  { id: 'startup-studio', label: 'STARTUP STUDIO', description: 'Day one · founder studio · possibility' },
  { id: 'innovation-loft', label: 'INNOVATION LOFT', description: 'First product · early team · knowledge wall grows' },
  { id: 'creative-headquarters', label: 'CREATIVE HEADQUARTERS', description: 'Brand identity · experience atelier · newsroom' },
  { id: 'executive-headquarters', label: 'EXECUTIVE HEADQUARTERS', description: 'Leadership maturity · executive council · strategy observatory' },
  { id: 'innovation-campus', label: 'INNOVATION CAMPUS', description: 'Multiple products · creator pavilion · innovation lab' },
  { id: 'global-campus', label: 'GLOBAL CAMPUS', description: 'International expansion · relationship center · global commons' },
  { id: 'organizational-institute', label: 'ORGANIZATIONAL INSTITUTE', description: 'Knowledge institute · legacy hall · teaching' },
  { id: 'legacy-campus', label: 'LEGACY CAMPUS', description: 'Decades of intentional leadership · living monument' },
];

export const DAY_ONE_SPACE_DEFS = [
  'Founder\'s workspace',
  'Executive briefing room',
  'Small collaboration area',
  'Knowledge wall',
  'Innovation table',
  'Company blueprint',
] as const;
