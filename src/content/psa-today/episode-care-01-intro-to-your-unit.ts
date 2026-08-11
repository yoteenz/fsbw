import type { PSATodayEpisode } from '../../components/lounge/psa-today/types';
import { WIG_UNIT_SLUGS } from '../education/care/productCatalog';

/**
 * CARE MASTERY — EPISODE 01 (structural curriculum only).
 * ONE canonical class — dynamic Signature Unit personalization inside Part 01.
 * No scripts, dialogue, or final media in this sprint.
 */
export const PSA_CARE_EPISODE_01: PSATodayEpisode = {
  id: 'psa-care-ep-01-intro-to-your-unit',
  slug: 'introduction-to-your-unit',
  series: 'psa-today',
  episodeNumber: 1,
  seasonNumber: 1,
  seasonEpisodeNumber: 1,
  masteryId: 'mastery-care',
  seasonId: 'season-care-mastery',
  title: 'INTRODUCTION TO YOUR UNIT',
  subtitle: 'KNOW YOUR UNIT · SEASON 01 · EPISODE 01',
  shortDescription:
    'MEET YOUR UNIT, LEARN THE VOCABULARY, AND UNDERSTAND WHAT YOU ARE LOOKING AT BEFORE FUTURE CARE AND CUSTOMIZATION CLASSES.',
  fullDescription:
    'THE CANONICAL UNIT FOUNDATION FOR FRONTAL SLAYER EDUCATION — ANATOMY, QUALITY OBSERVATION, AND SAFE HANDLING WITHOUT TEACHING FUTURE PROCEDURES.',
  category: 'PSA TODAY',
  tags: ['care', 'unit-anatomy', 'foundation', 'inspection'],
  pillar: 'care',
  contentFamilyId: undefined,
  curriculumBibleId: 'care-01-intro-to-your-unit',
  educationOwnership: {
    ownsConcepts: [
      'canonical unit anatomy',
      'canonical unit terminology',
      'initial unit inspection',
      'hair characteristic identification',
      'root-to-tip quality observation',
      'lace identification',
      'hairline identification',
      'knot identification',
      'parting-space identification',
      'lace footprint',
      'introductory lace dimensions',
      'interior cap anatomy',
      'lace vs wefted construction',
      'breathable/stretch construction',
      'removable comb identification',
      'adjustable band/strap identification',
      'safe handling zones',
      'delicate vs structural areas',
      'quality evaluation fundamentals',
    ],
    referencesConcepts: [
      'texture',
      'density',
      'length',
      'ultra-thin HD lace',
      'pre-plucked hairline',
      'fine knots',
    ],
    excludesConcepts: [
      'detangling procedure',
      'washing',
      'conditioning',
      'drying',
      'storage',
      'plucking technique',
      'knot bleaching',
      'lace tinting',
      'color transformation',
      'installation',
      'finished hairstyling',
      'upkeep maintenance procedures',
    ],
  },
  runtimeSeconds: undefined,
  featured: true,
  published: true,
  comingSoon: true,
  accessType: 'slay-ticket',
  slayTicketCost: 2,
  episodeTicketCost: 2,
  releaseState: 'planned',
  watchPolicy: {
    includedWatches: 3,
    qualificationPercent: 0.333333,
    accessDurationYears: 1,
  },
  requiresPreparationCheck: false,
  thumbnailUrl: '/assets/NOIR/noir-thumb.png',
  heroPosterUrl: '/assets/NOIR/noir-thumb.png',
  cameraA: {
    previewVideoUrl: undefined,
    posterUrl: '/assets/NOIR/noir-thumb.png',
    socialReusable: true,
  },
  cameraB: {
    fullLessonVideoUrl: undefined,
    posterUrl: '/assets/NOIR/noir-thumb.png',
  },
  unitEducation: {
    supportsDynamicUnits: true,
    supportsGeneralMode: true,
    supportsFollowThisUnit: true,
    continuityStage: 'untouched',
    demonstrationUnitStrategy: 'learner-selected',
    curriculumApprovalNote: 'APPROVED — EPISODE 01 ONLY',
  },
  careApplicability: { universal: true },
  classUnitTeaching: {
    usesSignatureUnitClassSpec: true,
    note:
      'Camera teaches using the approved Class Unit (Signature Unit spec). YOUR UNIT metadata personalizes entitlement and contextual UI — not the canonical lesson video.',
  },
  chapters: [
    {
      id: 'care-ep01-part-01-meet-your-unit',
      order: 1,
      label: '01 — MEET YOUR UNIT',
      title: 'MEET YOUR UNIT',
      type: 'camera-b',
      startSeconds: 0,
      gated: true,
      learningObjective:
        'Introduce the unit being followed — name, texture, and characteristics that matter in later classes.',
      unitMediaSlot: 'untouchedUnitVideoUrl',
      allowTextureFamilyFallback: false,
      unitSpecificModules: Object.fromEntries(
        WIG_UNIT_SLUGS.map((unitId) => [
          unitId,
          {
            insertLabel: `Meet ${unitId.split('-').join(' ').toUpperCase()}`,
          },
        ])
      ),
      sharedModule: {
        learningObjective: 'General introduction when no Signature Unit is selected.',
        posterUrl: '/assets/NOIR/noir-thumb.png',
      },
      fallbackPosterUrl: '/assets/NOIR/noir-thumb.png',
      socialExtractThemes: ['meet your unit', 'texture introduction'],
    },
    {
      id: 'care-ep01-part-02-the-hair',
      order: 2,
      label: '02 — THE HAIR',
      title: 'THE HAIR',
      type: 'camera-b',
      startSeconds: 120,
      gated: true,
      learningObjective:
        'Examine texture, density, length, root-to-tip fullness, movement, and condition — not care procedures.',
      sharedModule: {
        learningObjective: 'How to observe hair characteristics that influence future care and styling.',
      },
      socialExtractThemes: ['root-to-tip fullness', 'hair movement'],
    },
    {
      id: 'care-ep01-part-03-lace-hairline',
      order: 3,
      label: '03 — LACE + HAIRLINE',
      title: 'LACE + HAIRLINE',
      type: 'camera-b',
      startSeconds: 300,
      gated: true,
      learningObjective:
        'Establish lace, hairline, knots, parting space, and lace footprint vocabulary — not customization procedures.',
      sharedModule: {
        learningObjective: 'Canonical lace vocabulary used across Lace and Install Mastery.',
      },
      socialExtractThemes: [
        'understanding ultra-thin lace',
        'understanding a pre-plucked hairline',
        'understanding fine knots',
      ],
    },
    {
      id: 'care-ep01-part-04-inside-the-unit',
      order: 4,
      label: '04 — INSIDE THE UNIT',
      title: 'INSIDE THE UNIT',
      type: 'camera-b',
      startSeconds: 480,
      gated: true,
      learningObjective:
        'Cap, wefts, construction zones, breathability, combs, and strap — why each component exists.',
      sharedModule: {
        learningObjective: 'Interior construction anatomy before installation classes.',
      },
      socialExtractThemes: ['turning the unit inside out', 'understanding cap construction'],
    },
    {
      id: 'care-ep01-part-05-handle-it-right',
      order: 5,
      label: '05 — HANDLE IT RIGHT',
      title: 'HANDLE IT RIGHT',
      type: 'camera-b',
      startSeconds: 660,
      gated: true,
      learningObjective:
        'Support points, delicate lace areas, and safe handling before manipulation.',
      sharedModule: {
        learningObjective: 'Foundational physical handling — not washing, storage, or install.',
      },
    },
    {
      id: 'care-ep01-part-06-what-comes-next',
      order: 6,
      label: '06 — WHAT COMES NEXT',
      title: 'WHAT COMES NEXT',
      type: 'outro',
      startSeconds: 780,
      gated: true,
      learningObjective:
        'Connect anatomy vocabulary to future Care, Lace, Color, Install, Styling, and Upkeep classes.',
      sharedModule: {
        learningObjective: 'Shared vocabulary bridge — no mini-tutorials for future courses.',
      },
    },
  ],
  social: {
    socialClipTitle: undefined,
    socialCaption: undefined,
  },
};
