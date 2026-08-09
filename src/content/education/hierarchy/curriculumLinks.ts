/** Maps Curriculum Bible entries → Mastery / Season / Episode hierarchy. */
export const CURRICULUM_HIERARCHY_LINKS: Record<
  string,
  {
    masteryId: string;
    seasonId: string;
    seasonEpisodeNumber: number;
    relatedMasteryIds?: string[];
  }
> = {
  'lace-01-know-your-lace': {
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-01-understand-your-lace',
    seasonEpisodeNumber: 1,
  },
  'lace-05-what-does-your-lace-need': {
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-01-understand-your-lace',
    seasonEpisodeNumber: 2,
  },
  'lace-02-how-to-pluck-your-frontal': {
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-02-customize-your-lace',
    seasonEpisodeNumber: 1,
  },
  'lace-03-how-to-bleach-your-knots': {
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-02-customize-your-lace',
    seasonEpisodeNumber: 2,
  },
  'lace-04-how-to-tint-your-lace': {
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-02-customize-your-lace',
    seasonEpisodeNumber: 3,
  },
  'lace-06-how-to-cut-your-lace': {
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-02-customize-your-lace',
    seasonEpisodeNumber: 4,
  },
  'lace-12-why-your-lace-isnt-melting': {
    masteryId: 'mastery-lace',
    seasonId: 'season-lace-03-lace-troubleshooting',
    seasonEpisodeNumber: 1,
    relatedMasteryIds: ['mastery-install'],
  },
  'lace-07-prep-skin-lace-install': {
    masteryId: 'mastery-install',
    seasonId: 'season-install-01-prep-install-finish',
    seasonEpisodeNumber: 1,
    relatedMasteryIds: ['mastery-lace'],
  },
  'lace-08-glueless-installation': {
    masteryId: 'mastery-install',
    seasonId: 'season-install-01-prep-install-finish',
    seasonEpisodeNumber: 2,
    relatedMasteryIds: ['mastery-lace'],
  },
  'lace-09-adhesive-installation': {
    masteryId: 'mastery-install',
    seasonId: 'season-install-01-prep-install-finish',
    seasonEpisodeNumber: 3,
    relatedMasteryIds: ['mastery-lace'],
  },
  'lace-10-how-to-melt-your-lace': {
    masteryId: 'mastery-install',
    seasonId: 'season-install-01-prep-install-finish',
    seasonEpisodeNumber: 4,
    relatedMasteryIds: ['mastery-lace'],
  },
  'lace-11-baby-hairs-judgment': {
    masteryId: 'mastery-install',
    seasonId: 'season-install-01-prep-install-finish',
    seasonEpisodeNumber: 5,
    relatedMasteryIds: ['mastery-lace'],
  },
  'lace-13-remove-unit-safely': {
    masteryId: 'mastery-install',
    seasonId: 'season-install-02-removal-restoration',
    seasonEpisodeNumber: 1,
    relatedMasteryIds: ['mastery-lace'],
  },
  'lace-14-clean-adhesive-from-lace': {
    masteryId: 'mastery-install',
    seasonId: 'season-install-02-removal-restoration',
    seasonEpisodeNumber: 2,
    relatedMasteryIds: ['mastery-lace'],
  },
  'lace-15-preserve-lace-care-route': {
    masteryId: 'mastery-care',
    seasonId: 'season-care-mastery',
    seasonEpisodeNumber: 9,
    relatedMasteryIds: ['mastery-lace'],
  },
  'care-01-intro-to-your-unit': {
    masteryId: 'mastery-care',
    seasonId: 'season-care-mastery',
    seasonEpisodeNumber: 1,
  },
};

export function applyCurriculumHierarchyLink<T extends { id: string }>(
  entry: T
): T & {
  masteryId?: string;
  seasonId?: string;
  seasonEpisodeNumber?: number;
  relatedMasteryIds?: string[];
} {
  const link = CURRICULUM_HIERARCHY_LINKS[entry.id];
  if (!link) return entry;
  return { ...entry, ...link };
}
