/** Screening Room — luxury review theater before publication. */

export const SCREENING_ROOM_STORAGE_KEY = 'studioOsScreeningRoom_v1';
export const SCREENING_ROOM_VERSION = '1.0.0';
export const SCREENING_ROOM_ID = 'screening-room';

export const SCREENING_ROOM_PHILOSOPHY = [
  'Not a dashboard — a private cinema where every production is experienced before publication.',
  'The emotional moment before content enters the world — intentional, quiet, cinematic, premium.',
  'Compare versions simultaneously · concierge guidance · founder decides with confidence.',
] as const;

export const SCREENING_ROOM_CONNECTED_SYSTEMS = [
  'RENDER QUEUE',
  'PRODUCTION STUDIO',
  'PUBLISHING',
  'LIBRARY',
  'STUDIO INTELLIGENCE',
  'BRAND CONCIERGE',
  'EXPERIENCE CONCIERGE',
  'GROWTH CONCIERGE',
  'TECHNOLOGY CONCIERGE',
  'CHIEF CONCIERGE',
] as const;

export const COMPARISON_FIELDS = [
  { id: 'thumbnail', label: 'THUMBNAIL' },
  { id: 'voice', label: 'VOICE' },
  { id: 'hook', label: 'HOOK' },
  { id: 'caption', label: 'CAPTION' },
  { id: 'title', label: 'TITLE' },
] as const;
