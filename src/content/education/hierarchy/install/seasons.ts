import type { EducationSeason } from '../../types';

/** INSTALL MASTERY — topics migrated from Lace Bible (installation-specific). */
export const INSTALL_MASTERY_SEASONS: EducationSeason[] = [
  {
    id: 'season-install-01-prep-install-finish',
    slug: 'prep-install-finish',
    masteryId: 'mastery-install',
    seasonNumber: 1,
    title: 'PREP, INSTALL & FINISH',
    subtitle: 'INSTALL MASTERY · SEASON 1',
    learningObjective:
      'Prepare skin and lace, secure the unit (glueless or adhesive), refine the melt, and finish with intentional baby-hair judgment.',
    episodeSlots: [
      {
        slotId: 'slot-install-s1-e01',
        curriculumBibleId: 'lace-07-prep-skin-lace-install',
        seasonEpisodeNumber: 1,
      },
      {
        slotId: 'slot-install-s1-e02',
        curriculumBibleId: 'lace-08-glueless-installation',
        seasonEpisodeNumber: 2,
      },
      {
        slotId: 'slot-install-s1-e03',
        curriculumBibleId: 'lace-09-adhesive-installation',
        seasonEpisodeNumber: 3,
      },
      {
        slotId: 'slot-install-s1-e04',
        curriculumBibleId: 'lace-10-how-to-melt-your-lace',
        seasonEpisodeNumber: 4,
      },
      {
        slotId: 'slot-install-s1-e05',
        curriculumBibleId: 'lace-11-baby-hairs-judgment',
        seasonEpisodeNumber: 5,
      },
    ],
    releaseStrategy: 'scheduled',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
  },
  {
    id: 'season-install-02-removal-restoration',
    slug: 'removal-restoration',
    masteryId: 'mastery-install',
    seasonNumber: 2,
    title: 'REMOVAL & RESTORATION',
    subtitle: 'INSTALL MASTERY · SEASON 2',
    learningObjective:
      'Remove installed units safely and restore lace after adhesive use without damaging mesh or hairline.',
    episodeSlots: [
      {
        slotId: 'slot-install-s2-e01',
        curriculumBibleId: 'lace-13-remove-unit-safely',
        seasonEpisodeNumber: 1,
      },
      {
        slotId: 'slot-install-s2-e02',
        curriculumBibleId: 'lace-14-clean-adhesive-from-lace',
        seasonEpisodeNumber: 2,
      },
    ],
    releaseStrategy: 'scheduled',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
  },
];
