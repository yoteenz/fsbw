import type { EducationSeason } from '../../types';

/** LACE MASTERY seasons — migrated from Lace Curriculum Bible. */
export const LACE_MASTERY_SEASONS: EducationSeason[] = [
  {
    id: 'season-lace-01-understand-your-lace',
    slug: 'understand-your-lace',
    masteryId: 'mastery-lace',
    seasonNumber: 1,
    title: 'UNDERSTAND YOUR LACE',
    subtitle: 'LACE MASTERY · SEASON 1',
    learningObjective:
      'Understand lace anatomy, distinguish common lace problems, and learn how to diagnose what type of customization or installation issue is actually present before changing the product.',
    episodeSlots: [
      {
        slotId: 'slot-lace-s1-e01',
        curriculumBibleId: 'lace-01-know-your-lace',
        seasonEpisodeNumber: 1,
      },
      {
        slotId: 'slot-lace-s1-e02',
        curriculumBibleId: 'lace-05-what-does-your-lace-need',
        seasonEpisodeNumber: 2,
      },
    ],
    releaseStrategy: 'scheduled',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
  },
  {
    id: 'season-lace-02-customize-your-lace',
    slug: 'customize-your-lace',
    masteryId: 'mastery-lace',
    seasonNumber: 2,
    title: 'CUSTOMIZE YOUR LACE',
    subtitle: 'LACE MASTERY · SEASON 2',
    learningObjective:
      'Customize the appearance and construction of lace before installation by refining density, knots, lace tone, and lace edge appropriately.',
    episodeSlots: [
      {
        slotId: 'slot-lace-s2-e01',
        curriculumBibleId: 'lace-02-how-to-pluck-your-frontal',
        seasonEpisodeNumber: 1,
        psaEpisodeId: 'psa-today-ep-01-how-to-pluck-your-frontal',
      },
      {
        slotId: 'slot-lace-s2-e02',
        curriculumBibleId: 'lace-03-how-to-bleach-your-knots',
        seasonEpisodeNumber: 2,
      },
      {
        slotId: 'slot-lace-s2-e03',
        curriculumBibleId: 'lace-04-how-to-tint-your-lace',
        seasonEpisodeNumber: 3,
      },
      {
        slotId: 'slot-lace-s2-e04',
        curriculumBibleId: 'lace-06-how-to-cut-your-lace',
        seasonEpisodeNumber: 4,
      },
    ],
    releaseStrategy: 'scheduled',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'releasing',
    published: true,
    certification: {
      enabled: true,
      title: 'Customize Your Lace — Frontal Slayer Certified',
      requiredEpisodeIds: ['psa-today-ep-01-how-to-pluck-your-frontal'],
      completionRequirement: 'all-required-episodes',
      collectibleAssetId: 'collectible-season-cert-lace-s2',
      seasonVersion: '1',
    },
  },
  {
    id: 'season-lace-03-lace-troubleshooting',
    slug: 'lace-troubleshooting',
    masteryId: 'mastery-lace',
    seasonNumber: 3,
    title: 'LACE TROUBLESHOOTING',
    subtitle: 'LACE MASTERY · SEASON 3',
    learningObjective:
      'Diagnose common lace-customization failures without unnecessarily repeating or compounding the original problem.',
    episodeSlots: [
      {
        slotId: 'slot-lace-s3-e01',
        curriculumBibleId: 'lace-12-why-your-lace-isnt-melting',
        seasonEpisodeNumber: 1,
      },
    ],
    releaseStrategy: 'scheduled',
    allowEpisodePurchase: true,
    allowSeasonPass: true,
    status: 'planned',
    published: false,
  },
];
