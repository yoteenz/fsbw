import { REGRESSION_CATEGORY_LABELS } from './constants';
import type { HistoricalMemoryEntry } from './types';

const PATTERN_SEEDS: Omit<HistoricalMemoryEntry, 'id' | 'discoveredAt' | 'categoryLabel'>[] = [
  {
    category: 'permissions',
    featureLabel: 'Employee Workflow Access',
    description: 'Employee workflow loses steps after permission matrix updates.',
    rootCause: 'Permission inheritance not migrated when matrix changes.',
    recurrenceCount: 3,
    studioIntelligencePattern:
      'This workflow has broken three times after permission updates.',
    status: 'recurring',
  },
  {
    category: 'ui-components',
    featureLabel: 'Mobile Layout Animations',
    description: 'Health ring and hero animations jank after mobile layout refactors.',
    rootCause: 'CSS transform paths not updated for new breakpoints.',
    recurrenceCount: 4,
    studioIntelligencePattern:
      'This animation frequently regresses after mobile layout changes.',
    status: 'recurring',
  },
  {
    category: 'profession-brains',
    featureLabel: 'Complex Prompt Routing',
    description: 'Profession Brain becomes unstable when prompts exceed complexity threshold.',
    rootCause: 'Chunking disabled without fallback routing path.',
    recurrenceCount: 2,
    studioIntelligencePattern:
      'This Profession Brain™ becomes unstable when prompts exceed a certain complexity.',
    status: 'recurring',
  },
  {
    category: 'navigation',
    featureLabel: 'Intelligence Wing Routes',
    description: 'Nav items route to stale pages after module route renames.',
    rootCause: 'Navigation registry not synced with App.tsx routes.',
    recurrenceCount: 2,
    studioIntelligencePattern: 'Navigation regressions follow route segment renames without registry sync.',
    status: 'open',
  },
  {
    category: 'automations',
    featureLabel: 'Cascade Sync Duplicates',
    description: 'Automation chains fire duplicate events on organization boundary sync.',
    rootCause: 'Event listener deduplication removed during cascade refactor.',
    recurrenceCount: 1,
    studioIntelligencePattern: 'Automation duplicates correlate with cascade sync refactors.',
    status: 'resolved',
  },
  {
    category: 'integrations',
    featureLabel: 'Calendar OAuth Scopes',
    description: 'Appointment booking fails after integration scope expansion.',
    rootCause: 'Existing OAuth tokens lack newly required scopes.',
    recurrenceCount: 1,
    studioIntelligencePattern: 'Integration regressions follow OAuth scope changes without re-auth flow.',
    status: 'open',
  },
  {
    category: 'marketplace',
    featureLabel: 'Checkout Pack IDs',
    description: 'Marketplace checkout fails when pack registry IDs change.',
    rootCause: 'Checkout adapter references deprecated pack slugs.',
    recurrenceCount: 2,
    studioIntelligencePattern: 'Marketplace regressions follow pack registry renames without adapter updates.',
    status: 'open',
  },
  {
    category: 'studio-intelligence',
    featureLabel: 'Scorer Threshold Shift',
    description: 'False positive flags after regression scorer recalibration.',
    rootCause: 'Threshold applied to historical baselines without migration.',
    recurrenceCount: 1,
    studioIntelligencePattern: 'Intelligence false positives follow scorer threshold changes without baseline migration.',
    status: 'resolved',
  },
];

export function buildHistoricalMemory(now: string): HistoricalMemoryEntry[] {
  const dates = [
    new Date(Date.now() - 2 * 86400000).toISOString(),
    new Date(Date.now() - 14 * 86400000).toISOString(),
    new Date(Date.now() - 45 * 86400000).toISOString(),
    new Date(Date.now() - 7 * 86400000).toISOString(),
    new Date(Date.now() - 30 * 86400000).toISOString(),
    new Date(Date.now() - 60 * 86400000).toISOString(),
    new Date(Date.now() - 21 * 86400000).toISOString(),
    new Date(Date.now() - 90 * 86400000).toISOString(),
  ];

  return PATTERN_SEEDS.map((seed, i) => ({
    ...seed,
    id: `memory-${seed.category}-${i}`,
    categoryLabel: REGRESSION_CATEGORY_LABELS[seed.category],
    discoveredAt: dates[i % dates.length] ?? now,
  }));
}

export function getRecurringPatterns(memory: HistoricalMemoryEntry[]): HistoricalMemoryEntry[] {
  return memory.filter((m) => m.status === 'recurring' || m.recurrenceCount >= 2);
}
