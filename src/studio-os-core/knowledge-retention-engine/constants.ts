import type { RefresherMode, RefresherModeId } from './types';

export const KNOWLEDGE_RETENTION_ENGINE_ARTICLE = {
  id: 'ARTICLE-E03',
  title: 'Knowledge Retention Engine™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World preserves mastery for life by turning learned concepts into professional memories with retention profiles, adaptive refreshers, Orb mentorship, and living industry updates.',
} as const;

export const KNOWLEDGE_RETENTION_ENGINE_VERSION = '1.0.0';

export const KNOWLEDGE_RETENTION_STORAGE_KEY = 'studio-os:knowledge-retention-engine';

export const KNOWLEDGE_RETENTION_UPDATED_EVENT = 'studio-os:knowledge-retention-updated';

export const RETENTION_ENGINE_PHILOSOPHY =
  'The learner never revisits courses. The learner revisits professional memories.';

export const REFRESHER_MODES: RefresherMode[] = [
  {
    id: 'memory-spark',
    label: 'Memory Spark™',
    durationLabel: '60 sec',
    depth: 'micro',
    description: 'A fast confidence rekindling: one memory, one cue, one professional judgment.',
  },
  {
    id: 'tldr-review',
    label: 'TL;DR Review™',
    durationLabel: '5 min',
    depth: 'short',
    description: 'A compact walkthrough that restores language, sequence, and decision points.',
  },
  {
    id: 'interactive-scenario',
    label: 'Interactive Scenario™',
    durationLabel: 'applied',
    depth: 'applied',
    description: 'A realistic client situation refreshes judgment, communication, and confidence.',
  },
  {
    id: 'simulation-replay',
    label: 'Simulation Replay™',
    durationLabel: 'applied',
    depth: 'applied',
    description: 'Practice inside a simulated professional moment without feeling like a student.',
  },
  {
    id: 'mentor-walkthrough',
    label: 'Mentor Walkthrough™',
    durationLabel: 'guided',
    depth: 'applied',
    description: 'The Orb shows the expert move, explains the why, then invites imitation.',
  },
  {
    id: 'quick-assessment',
    label: 'Quick Assessment™',
    durationLabel: 'deep',
    depth: 'deep',
    description: 'A mastery check for learners who need pressure, not review.',
  },
  {
    id: 'industry-update',
    label: 'Industry Update™',
    durationLabel: 'current',
    depth: 'short',
    description: 'What changed, why it changed, and how the learner should adapt work.',
  },
  {
    id: 'certification-renewal',
    label: 'Certification Renewal™',
    durationLabel: 'credential',
    depth: 'credential',
    description: 'A credential-sensitive refresh when standards, licenses, or renewals matter.',
  },
];

/** Maps legacy ARTICLE-E03 mode ids to implementation sprint ids. */
export const LEGACY_REFRESHER_MODE_MAP: Record<string, RefresherModeId> = {
  'skill-refresh': 'tldr-review',
  'interactive-simulation': 'simulation-replay',
  'mentor-demonstration': 'mentor-walkthrough',
  'client-scenario': 'interactive-scenario',
  'challenge-mode': 'quick-assessment',
};

export const DIFFICULTY_WEIGHT = {
  foundational: 0.82,
  intermediate: 1,
  advanced: 1.16,
  expert: 1.32,
} as const;

export const STATUS_THRESHOLDS = {
  fresh: 24,
  warming: 44,
  needsRefresh: 64,
  critical: 82,
} as const;

export const RETENTION_SCHEDULER_INTERVAL_MS = 6 * 60 * 60 * 1000;

export const RETENTION_ANALYTICS_WEIGHTS = {
  retention: 0.28,
  confidence: 0.22,
  mastery: 0.22,
  reviewCompletion: 0.14,
  knowledgeGrowth: 0.08,
  conceptDecay: 0.06,
} as const;
