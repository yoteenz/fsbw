import type { TimelineEra } from './types';

export const FOUNDER_WALK_STORAGE_KEY = 'studioOsFounderWalk_v1';
export const FOUNDER_WALK_VERSION = '1.0.0';
export const FOUNDER_WALK_ID = 'founder-walk';

export const WALK_PHILOSOPHY = [
  'Companies are built one decision at a time — those decisions deserve to be remembered',
  'Not an achievement system · a legacy system · the soul of the organization',
  'Transform organizational history into a living architectural journey',
  'Celebrate growth · character · relationships · wisdom · not revenue alone',
] as const;

export const FOUNDER_WALK_CONNECTED_SYSTEMS = [
  'Campus Evolution Engine',
  'Living Headquarters',
  'Architect Studio',
  'Company Genome',
  'Knowledge Graph',
  'Leadership DNA',
  'Relationship Engine',
  'Organizational Inheritance',
  'Studio Intelligence',
] as const;

export const TIMELINE_ERAS: { era: TimelineEra; label: string; description: string }[] = [
  { era: 'day-one', label: 'DAY ONE', description: 'Single marble pathway · founder studio · possibility' },
  { era: 'year-one', label: 'YEAR ONE', description: 'First milestones · path extends · gardens begin' },
  { era: 'year-five', label: 'YEAR FIVE', description: 'Reflection spaces · pavilions · institutional memory' },
  { era: 'year-ten', label: 'YEAR TEN', description: 'Legacy pavilion · future generations can walk' },
  { era: 'year-twenty', label: 'YEAR TWENTY', description: 'Mature landscape · wisdom preserved · full journey' },
  { era: 'future', label: 'FUTURE', description: 'Projected path · what today\'s decisions become' },
];
