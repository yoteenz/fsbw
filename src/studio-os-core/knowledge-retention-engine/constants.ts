import type { RefresherMode } from './types';

export const KNOWLEDGE_RETENTION_ENGINE_ARTICLE = {
  id: 'ARTICLE-E03',
  title: 'Knowledge Retention Engine™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World preserves mastery for life by turning learned concepts into professional memories with retention profiles, adaptive refreshers, Orb mentorship, and living industry updates.',
} as const;

export const RETENTION_ENGINE_PHILOSOPHY =
  'The learner never revisits courses. The learner revisits professional memories.';

export const REFRESHER_MODES: RefresherMode[] = [
  {
    id: 'memory-spark',
    label: '60-second Memory Spark™',
    durationLabel: '60 sec',
    depth: 'micro',
    description: 'A fast confidence rekindling: one memory, one cue, one professional judgment.',
  },
  {
    id: 'skill-refresh',
    label: '5-minute Skill Refresh™',
    durationLabel: '5 min',
    depth: 'short',
    description: 'A compact walkthrough that restores language, sequence, and decision points.',
  },
  {
    id: 'interactive-simulation',
    label: 'Interactive Simulation™',
    durationLabel: 'applied',
    depth: 'applied',
    description: 'Practice inside a simulated professional moment without feeling like a student.',
  },
  {
    id: 'mentor-demonstration',
    label: 'Mentor Demonstration™',
    durationLabel: 'guided',
    depth: 'applied',
    description: 'The Orb shows the expert move, explains the why, then invites imitation.',
  },
  {
    id: 'client-scenario',
    label: 'Client Scenario™',
    durationLabel: 'applied',
    depth: 'applied',
    description: 'A realistic client situation refreshes judgment, communication, and confidence.',
  },
  {
    id: 'industry-update',
    label: 'Industry Update™',
    durationLabel: 'current',
    depth: 'short',
    description: 'What changed, why it changed, and how the learner should adapt work.',
  },
  {
    id: 'challenge-mode',
    label: 'Challenge Mode™',
    durationLabel: 'deep',
    depth: 'deep',
    description: 'A mastery check for learners who need pressure, not review.',
  },
  {
    id: 'certification-renewal',
    label: 'Certification Renewal™',
    durationLabel: 'credential',
    depth: 'credential',
    description: 'A credential-sensitive refresh when standards, licenses, or renewals matter.',
  },
];

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
