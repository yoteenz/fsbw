import type { MemoryReflectionMode } from './types';

export const PROFESSIONAL_MEMORY_WISDOM_ENGINE_ARTICLE = {
  id: 'ARTICLE-E04',
  title: 'Professional Memory™ / The Wisdom Engine™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World preserves professional wisdom by turning meaningful career experiences into a lifelong timeline that the Orb and Wisdom Engine™ can recall for context-aware guidance.',
} as const;

export const PROFESSIONAL_MEMORY_WISDOM_ENGINE_VERSION = '1.0.0';

export const WISDOM_ENGINE_PHILOSOPHY =
  'Knowledge teaches people HOW. Wisdom teaches people WHEN.';

export const PROFESSIONAL_MEMORY_PHILOSOPHY =
  'Traditional education tracks completed lessons. Studio World tracks experiences.';

export const MEMORY_REFLECTION_MODES: MemoryReflectionMode[] = [
  {
    id: 'career-recap',
    label: 'Career Recap™',
    horizon: 'session',
    description: 'A concise reflection on recent professional growth, decisions, and lessons.',
  },
  {
    id: 'year-in-review',
    label: 'Year In Review™',
    horizon: 'year',
    description: 'A calendar-year reflection across achievements, mistakes, clients, and growth.',
  },
  {
    id: 'five-year-journey',
    label: 'Five-Year Journey™',
    horizon: 'multi-year',
    description: 'A long-range professional arc showing identity, mastery, and career evolution.',
  },
  {
    id: 'mastery-timeline',
    label: 'Mastery Timeline™',
    horizon: 'lifetime',
    description: 'A visual professional memory path from first attempts to expert judgment.',
  },
  {
    id: 'business-growth-replay',
    label: 'Business Growth Replay™',
    horizon: 'business',
    description: 'A founder/operator view of growth, decisions, hires, reputation, and resilience.',
  },
  {
    id: 'industry-impact',
    label: 'Industry Impact™',
    horizon: 'industry',
    description: 'A reflection on contributions that changed peers, clients, community, or craft.',
  },
];

export const WISDOM_SOURCE_DEFAULT_WEIGHTS = {
  'profession-brain': 0.22,
  'professional-memory': 0.24,
  'career-history': 0.16,
  'simulation-outcomes': 0.14,
  mentorship: 0.1,
  'industry-updates': 0.08,
  'community-contributions': 0.06,
} as const;
