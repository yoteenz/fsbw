import type { EducationSeason } from '../../types';

/** Canonical Care Mastery season — ONE season for paid + complimentary access. */
export const CARE_MASTERY_CANONICAL_SEASON_ID = 'season-care-mastery';

export const CARE_MASTERY_SEASONS: EducationSeason[] = [
  {
    id: CARE_MASTERY_CANONICAL_SEASON_ID,
    slug: 'care-mastery',
    masteryId: 'mastery-care',
    seasonNumber: 1,
    title: 'CARE MASTERY',
    subtitle: 'CARE MASTERY · SEASON 1',
    learningObjective:
      'Establish canonical unit anatomy vocabulary and quality observation — the foundation for all Care Mastery classes.',
    episodeSlots: [
      {
        slotId: 'slot-care-s1-e01',
        curriculumBibleId: 'care-01-intro-to-your-unit',
        seasonEpisodeNumber: 1,
        psaEpisodeId: 'psa-care-ep-01-intro-to-your-unit',
      },
    ],
    releaseStrategy: 'manual',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'releasing',
    published: true,
    curriculumStatus: 'partially_approved',
    accessConfig: {
      paidEducationEnabled: true,
      /** Hair purchase unlocks Care Guides — NOT Care Mastery (paid PSA Today education). */
      qualifyingProductEntitlementEnabled: false,
    },
  },
];

export function isCareMasterySeasonId(seasonId: string): boolean {
  return seasonId === CARE_MASTERY_CANONICAL_SEASON_ID;
}
