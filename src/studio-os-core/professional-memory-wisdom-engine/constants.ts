import type { MemoryReflectionMode, MemoryReflectionModeId } from './types';

export const PROFESSIONAL_MEMORY_WISDOM_ENGINE_ARTICLE = {
  id: 'ARTICLE-E04',
  title: 'Professional Memory™ / The Wisdom Engine™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World preserves professional wisdom by turning meaningful career experiences into a lifelong timeline that the Orb and Wisdom Engine™ can recall for context-aware guidance.',
} as const;

export const PROFESSIONAL_MEMORY_WISDOM_ENGINE_VERSION = '1.1.0';

export const PROFESSIONAL_MEMORY_STORAGE_KEY = 'studio-os:professional-memory-wisdom-engine';

export const PROFESSIONAL_MEMORY_UPDATED_EVENT = 'studio-os:professional-memory-updated';

export const WISDOM_ENGINE_PHILOSOPHY =
  'Knowledge teaches people HOW. Wisdom teaches people WHEN.';

export const PROFESSIONAL_MEMORY_PHILOSOPHY =
  'Traditional education tracks completed lessons. Studio World tracks experiences.';

export const MEMORY_REFLECTION_MODES: MemoryReflectionMode[] = [
  {
    id: 'career-timeline',
    label: 'Career Timeline™',
    horizon: 'lifetime',
    description: 'A persistent view of milestones, transitions, and professional identity.',
  },
  {
    id: 'year-in-review',
    label: 'Year In Review™',
    horizon: 'year',
    description: 'A calendar-year reflection across achievements, mistakes, clients, and growth.',
  },
  {
    id: 'mastery-replay',
    label: 'Mastery Replay™',
    horizon: 'multi-year',
    description: 'Replay the arc from first attempts through expert judgment.',
  },
  {
    id: 'business-timeline',
    label: 'Business Timeline™',
    horizon: 'business',
    description: 'Founder/operator growth, hires, launches, reputation, and resilience.',
  },
  {
    id: 'knowledge-evolution',
    label: 'Knowledge Evolution™',
    horizon: 'industry',
    description: 'How retained knowledge and industry updates shaped professional practice.',
  },
  {
    id: 'skill-growth',
    label: 'Skill Growth™',
    horizon: 'skills',
    description: 'Skill-by-skill growth across simulations, clients, and real work.',
  },
  {
    id: 'mentorship-journey',
    label: 'Mentorship Journey™',
    horizon: 'session',
    description: 'Teaching, apprentices, feedback given, and mastery passed forward.',
  },
];

export const LEGACY_REFLECTION_MODE_MAP: Record<string, MemoryReflectionModeId> = {
  'career-recap': 'career-timeline',
  'five-year-journey': 'mastery-replay',
  'mastery-timeline': 'mastery-replay',
  'business-growth-replay': 'business-timeline',
  'industry-impact': 'knowledge-evolution',
};

export const WISDOM_SOURCE_DEFAULT_WEIGHTS = {
  'profession-brain': 0.18,
  'professional-memory': 0.22,
  'knowledge-retention': 0.14,
  'career-world': 0.12,
  'world-graph': 0.06,
  'simulation-outcomes': 0.12,
  mentorship: 0.08,
  'industry-updates': 0.05,
  'community-contributions': 0.03,
} as const;

export const ORB_MEMORY_RECALL_COOLDOWN_MS = 12 * 60 * 60 * 1000;

export const ORB_MEMORY_IMPORTANCE_THRESHOLD = 70;
