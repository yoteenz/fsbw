import type { EducationSeason } from '../../types';

/** Care Mastery Season 01 — canonical id retained for entitlements + episode refs. */
export const CARE_MASTERY_CANONICAL_SEASON_ID = 'season-care-mastery';

export const CARE_MASTERY_SEASONS: EducationSeason[] = [
  {
    id: CARE_MASTERY_CANONICAL_SEASON_ID,
    slug: 'know-your-unit',
    masteryId: 'mastery-care',
    seasonNumber: 1,
    title: 'KNOW YOUR UNIT',
    subtitle: 'CARE MASTERY · SEASON 01',
    shortPremise:
      "Understand what you're wearing before you learn how to care for it.",
    description:
      'Unit anatomy, raw hair fundamentals, texture and origin, density, lace and cap construction, and signature unit characteristics.',
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
    customerVisible: true,
    curriculumStatus: 'partially_approved',
    accessConfig: {
      paidEducationEnabled: true,
      /** Hair purchase unlocks Care Guides — NOT Care Mastery (paid PSA Today education). */
      qualifyingProductEntitlementEnabled: false,
    },
  },
  {
    id: 'season-care-02-the-care-ritual',
    slug: 'the-care-ritual',
    masteryId: 'mastery-care',
    seasonNumber: 2,
    title: 'THE CARE RITUAL',
    subtitle: 'CARE MASTERY · SEASON 02',
    shortPremise: 'Everyday upkeep and preventative care.',
    description:
      'Brushing, detangling, everyday products, nighttime protection, storage, routine maintenance, and shedding prevention.',
    learningObjective:
      'Build a repeatable everyday care ritual that protects the unit between styling sessions.',
    episodeSlots: [],
    releaseStrategy: 'manual',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
    customerVisible: false,
    accessConfig: {
      paidEducationEnabled: true,
      qualifyingProductEntitlementEnabled: false,
    },
  },
  {
    id: 'season-care-03-wash-day',
    slug: 'wash-day',
    masteryId: 'mastery-care',
    seasonNumber: 3,
    title: 'WASH DAY',
    subtitle: 'CARE MASTERY · SEASON 03',
    shortPremise: 'Cleansing, conditioning, and resetting the unit correctly.',
    description:
      'Wash frequency, shampooing, conditioning, drying, buildup, texture resetting, and post-wash preparation.',
    learningObjective:
      'Execute a full wash-day reset without compromising lace, construction, or customized finishes.',
    episodeSlots: [],
    releaseStrategy: 'manual',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
    customerVisible: false,
    accessConfig: {
      paidEducationEnabled: true,
      qualifyingProductEntitlementEnabled: false,
    },
  },
  {
    id: 'season-care-04-preserve-the-slay',
    slug: 'preserve-the-slay',
    masteryId: 'mastery-care',
    seasonNumber: 4,
    title: 'PRESERVE THE SLAY',
    subtitle: 'CARE MASTERY · SEASON 04',
    shortPremise: 'Protecting customization and the finished appearance of the unit.',
    description:
      'Preserving curls, waves, layers, heat care, blonde and color-treated unit care, and maintaining lace and hairline condition.',
    learningObjective:
      'Protect customized finishes and structural lace so the slay lasts between sessions.',
    episodeSlots: [],
    releaseStrategy: 'manual',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
    customerVisible: false,
    accessConfig: {
      paidEducationEnabled: true,
      qualifyingProductEntitlementEnabled: false,
    },
  },
  {
    id: 'season-care-05-revive-restore',
    slug: 'revive-restore',
    masteryId: 'mastery-care',
    seasonNumber: 5,
    title: 'REVIVE + RESTORE',
    subtitle: 'CARE MASTERY · SEASON 05',
    shortPremise: 'Restoring units that are beginning to show wear.',
    description:
      'Dryness, tangling, dullness, loss of movement, deep conditioning, restoration, troubleshooting, and when professional servicing is appropriate.',
    learningObjective:
      'Diagnose wear patterns and restore movement, moisture, and finish before replacement becomes necessary.',
    episodeSlots: [],
    releaseStrategy: 'manual',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
    customerVisible: false,
    accessConfig: {
      paidEducationEnabled: true,
      qualifyingProductEntitlementEnabled: false,
    },
  },
];

export function isCareMasterySeasonId(seasonId: string): boolean {
  return CARE_MASTERY_SEASONS.some((s) => s.id === seasonId);
}
