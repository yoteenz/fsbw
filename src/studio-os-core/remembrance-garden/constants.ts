export const REMEMBRANCE_GARDEN_STORAGE_KEY = 'studioOsRemembranceGarden_v1';
export const REMEMBRANCE_GARDEN_VERSION = '1.0.0';
export const REMEMBRANCE_GARDEN_ID = 'remembrance-garden';

export const GARDEN_PHILOSOPHY = [
  'Businesses are never built alone — gratitude becomes part of the company\'s architecture',
  'Not mourning · honoring · peaceful · hopeful · grateful · alive',
  'Preserve the people, moments, and sacrifices that shaped the organization',
  'Success is never achieved alone — their influence deserves to live on',
] as const;

export const REMEMBRANCE_GARDEN_CONNECTED_SYSTEMS = [
  'Founder Walk',
  'Campus Evolution Engine',
  'Living Headquarters',
  'Company Genome',
  'Leadership DNA',
  'Knowledge Graph',
  'Relationship Engine',
  'Organizational Inheritance',
  'Studio Intelligence',
] as const;

export const PRIVACY_LEVELS: { level: import('./types').PrivacyLevel; label: string }[] = [
  { level: 'private', label: 'PRIVATE' },
  { level: 'family', label: 'FAMILY ONLY' },
  { level: 'executive', label: 'EXECUTIVE ONLY' },
  { level: 'organization', label: 'ORGANIZATION' },
  { level: 'public', label: 'PUBLIC' },
];
