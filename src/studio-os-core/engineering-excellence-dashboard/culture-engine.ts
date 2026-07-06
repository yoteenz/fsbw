import { CULTURE_ACHIEVEMENT_LABELS, CULTURE_ACHIEVEMENTS } from './constants';
import type { CultureCelebration, HealthPillarScore } from './types';

const CELEBRATION_SEEDS: Omit<CultureCelebration, 'id' | 'achievementLabel' | 'celebratedAt'>[] = [
  {
    achievement: 'zero-regression-release',
    title: 'Zero-Regression Release Achieved',
    description: 'Latest build passed Regression Engine™ with no broken features across all journey replays.',
    impactSummary: 'Users receive verified improvements without unintended breakage — engineering excellence rewarded.',
  },
  {
    achievement: 'accessibility-improvement',
    title: 'Accessibility Score +6% This Month',
    description: 'Accessibility Auditor™ reports all intelligence wing modules inclusively usable.',
    impactSummary: 'Inclusive design is premium design — accessibility feels invisible.',
  },
  {
    achievement: 'performance-milestone',
    title: 'Mobile Performance Budget Restored',
    description: 'Performance Monitor™ confirms mobile Lighthouse back above 80 budget threshold.',
    impactSummary: 'Premium responsiveness preserved — performance is a feature.',
  },
  {
    achievement: 'design-consistency',
    title: 'Design Compliance Creative Director 90%+',
    description: 'Design Compliance Engine™ recognizes all audited pages as Studio OS.',
    impactSummary: 'Visual discipline and craftsmanship celebrated across the organization.',
  },
  {
    achievement: 'knowledge-quality',
    title: 'Knowledge Confidence Milestone',
    description: 'Knowledge Confidence™ exceeds 85% — Profession Brains become reliable assets.',
    impactSummary: 'Knowledge quality compounds — prompts are infrastructure.',
  },
  {
    achievement: 'automation-reliability',
    title: 'Automation Chain Reliability 98%',
    description: 'QA Simulation Engine™ reports automation chains passing without duplicate events.',
    impactSummary: 'Reliability over speed — automations earn trust through consistency.',
  },
  {
    achievement: 'documentation-excellence',
    title: 'Documentation Sync 90%+',
    description: 'Documentation Sync™ covers all intelligence wing modules with current guides.',
    impactSummary: 'Studio OS teaches the current version of itself — documentation excellence.',
  },
];

export function buildCultureCelebrations(
  pillars: HealthPillarScore[],
  now: string
): CultureCelebration[] {
  const dates = [
    new Date(Date.now() - 3 * 86400000).toISOString(),
    new Date(Date.now() - 10 * 86400000).toISOString(),
    new Date(Date.now() - 21 * 86400000).toISOString(),
    new Date(Date.now() - 35 * 86400000).toISOString(),
    new Date(Date.now() - 50 * 86400000).toISOString(),
    new Date(Date.now() - 70 * 86400000).toISOString(),
    new Date(Date.now() - 90 * 86400000).toISOString(),
  ];

  const eligible = CULTURE_ACHIEVEMENTS.filter((achievement) => {
    if (achievement === 'accessibility-improvement') {
      return (pillars.find((p) => p.pillar === 'accessibility')?.score ?? 0) >= 85;
    }
    if (achievement === 'performance-milestone') {
      return (pillars.find((p) => p.pillar === 'performance')?.score ?? 0) >= 80;
    }
    if (achievement === 'design-consistency') {
      return (pillars.find((p) => p.pillar === 'design-health')?.score ?? 0) >= 85;
    }
    return true;
  });

  return CELEBRATION_SEEDS.filter((seed) => eligible.includes(seed.achievement)).map((seed, i) => ({
    ...seed,
    id: `culture-${seed.achievement}`,
    achievementLabel: CULTURE_ACHIEVEMENT_LABELS[seed.achievement],
    celebratedAt: dates[i % dates.length] ?? now,
  }));
}
