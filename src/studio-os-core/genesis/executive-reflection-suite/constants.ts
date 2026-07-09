export const ERS_SUBSYSTEM_NAME = 'Executive Reflection Suite™';
export const ERS_SUBSYSTEM_VERSION = '1.0.0';

/** Headquarters wing room destinations */
export const ERS_ROOM_PATHS = [
  'executive-reflection',
  'evolution-room',
  'evolution-council',
  'founders-summit',
  'quarterly-retreat',
  'founder-diary',
  'victory-gallery',
  'legacy-chamber',
  'lessons-library',
  'opportunity-observatory',
  'future-theater',
  'boardroom',
  'innovation-hall',
  'decision-timeline',
  'failure-laboratory',
  'genesis-learning',
  'launch-stack-health',
] as const;

export type ErsRoomPath = (typeof ERS_ROOM_PATHS)[number];

export const ERS_ROOM_PATH_LABELS: Record<ErsRoomPath, string> = {
  'executive-reflection': 'Executive Reflection Suite™',
  'evolution-room': 'Evolution Room™',
  'evolution-council': 'Evolution Council™',
  'founders-summit': "Founder's Annual Summit™",
  'quarterly-retreat': 'Quarterly Strategy Retreat™',
  'founder-diary': 'Founder Diary™',
  'victory-gallery': 'Victory Gallery™',
  'legacy-chamber': 'Legacy Chamber™',
  'lessons-library': 'Lessons Learned Library™',
  'opportunity-observatory': 'Opportunity Observatory™',
  'future-theater': 'Future Vision Theater™',
  boardroom: 'The Boardroom™',
  'innovation-hall': 'Innovation Hall™',
  'decision-timeline': 'Decision Timeline™',
  'failure-laboratory': 'Failure Laboratory™',
  'genesis-learning': 'Genesis Learning Loop™',
  'launch-stack-health': 'Launch Stack Health™',
};

export const ERS_SESSION_TYPES = [
  'executive-review',
  'evolution-monthly',
  'quarterly-retreat',
  'annual-summit',
  'boardroom',
  'diary-reflection',
] as const;

export type ErsSessionType = (typeof ERS_SESSION_TYPES)[number];

export const ERS_HEALTH_LENSES = [
  'launch-stack',
  'company',
  'founder',
  'knowledge',
  'mission',
  'automation',
  'executive',
  'system',
] as const;

export type ErsHealthLens = (typeof ERS_HEALTH_LENSES)[number];

export const ERS_LESSON_CATEGORIES = [
  'experiment',
  'failure',
  'discovery',
  'pattern',
  'architecture',
  'business',
  'marketing',
  'leadership',
  'creative',
] as const;

export type ErsLessonCategory = (typeof ERS_LESSON_CATEGORIES)[number];
