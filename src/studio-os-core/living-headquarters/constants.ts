import type { ExecutiveArtifactKind, LegacyWallEntry } from './types';

export const LIVING_HEADQUARTERS_ID = 'living-headquarters';

/** Milestone ids → permanent Legacy Wall engravings when earned. */
export const LEGACY_WALL_MILESTONE_MAP: Record<
  string,
  { label: string; category: LegacyWallEntry['category']; detail?: string }
> = {
  'organization-created': { label: 'Organization Founded', category: 'founding' },
  'first-publish': { label: 'First Knowledge Asset Published', category: 'knowledge' },
  'first-revenue': { label: 'First Invoice', category: 'revenue', detail: 'Revenue journey begins' },
  'first-100-pages': { label: '100 Knowledge Assets', category: 'knowledge' },
  'first-1000-followers': { label: '1,000 Customers', category: 'customer' },
  'first-experiment': { label: 'Innovation Lab Activated', category: 'innovation' },
  'first-automation': { label: 'Automation Milestone', category: 'innovation' },
  'first-ai-recommendation': { label: 'Studio Intelligence Awakened', category: 'innovation' },
};

/** Executive Collection™ — physical artifacts unlocked by earned milestones (not gamification). */
export const EXECUTIVE_ARTIFACT_MAP: Record<
  string,
  { label: string; kind: ExecutiveArtifactKind; description: string }
> = {
  'organization-created': {
    label: 'Founding Crystal',
    kind: 'founder-recognition',
    description: 'Commemorates the day this headquarters was born.',
  },
  'first-revenue': {
    label: 'First Revenue Crystal',
    kind: 'crystal-trophy',
    description: 'Quietly placed the day revenue first flowed.',
  },
  'first-100-pages': {
    label: 'Century Knowledge Monument',
    kind: 'monument',
    description: 'One hundred published assets — institutional memory at scale.',
  },
  'first-1000-followers': {
    label: 'Thousand Voices Sculpture',
    kind: 'sculpture',
    description: 'A thousand customers chose to listen.',
  },
  'first-experiment': {
    label: 'Innovation Prism',
    kind: 'innovation-display',
    description: 'The lab remembers every experiment that shaped the future.',
  },
  'first-publish': {
    label: 'First Light Award',
    kind: 'award',
    description: 'The first published knowledge asset — where the story became public.',
  },
};

/** Frontal Slayer demo engravings when pilot mode is inactive. */
export const FRONTAL_SLAYER_LEGACY_DEMO: LegacyWallEntry[] = [
  {
    id: 'fs-founded',
    label: 'Organization Founded',
    engravedAt: '2019-03-14T12:00:00.000Z',
    category: 'founding',
    detail: 'Frontal Slayer headquarters established',
  },
  {
    id: 'fs-first-customer',
    label: 'First Customer',
    engravedAt: '2019-06-02T12:00:00.000Z',
    category: 'customer',
  },
  {
    id: 'fs-lounge-tv',
    label: 'Lounge TV Learn Series',
    engravedAt: '2024-08-15T12:00:00.000Z',
    category: 'knowledge',
    detail: 'First editorial knowledge at scale',
  },
  {
    id: 'fs-campaign-orchestrator',
    label: 'Campaign Orchestrator Live',
    engravedAt: '2025-11-01T12:00:00.000Z',
    category: 'innovation',
  },
];
