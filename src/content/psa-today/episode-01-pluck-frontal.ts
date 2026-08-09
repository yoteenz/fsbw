import type { PSATodayEpisode } from '../../components/lounge/psa-today/types';

/**
 * PSA TODAY — EPISODE 01 (structural placeholder only).
 *
 * Insert final media at the marked slots below — do NOT hard-code URLs in UI components.
 *
 * Camera A preview  → cameraA.previewVideoUrl
 * Camera A poster   → cameraA.posterUrl
 * Class Kit flat lay → classKit.flatLayImageUrl
 * Camera B lesson   → cameraB.fullLessonVideoUrl
 * Tool / kit links  → classKit.tools[].fsProductUrl | amazonProductUrl
 * Full kit links    → classKit.fullKit.fsStorefrontUrl | amazonIdeaListUrl
 */
export const PSA_TODAY_EPISODE_01: PSATodayEpisode = {
  id: 'psa-today-ep-01-how-to-pluck-your-frontal',
  slug: 'how-to-pluck-your-frontal',
  series: 'psa-today',
  episodeNumber: 1,
  seasonNumber: 2,
  seasonEpisodeNumber: 1,
  masteryId: 'mastery-lace',
  seasonId: 'season-lace-02-customize-your-lace',
  title: 'HOW TO PLUCK YOUR FRONTAL',
  subtitle: 'LACE MASTERY · CUSTOMIZE YOUR LACE · EPISODE 01',
  shortDescription:
    'LEARN HOW TO PLUCK DENSITY ALONG THE HAIRLINE FOR A NATURAL, LESS WIGGY FINISH.',
  fullDescription:
    'PSA INTRODUCES THE TECHNIQUE ON CAMERA A, REVIEWS YOUR CLASS KIT, THEN DEMONSTRATES THE PLUCK ON CAMERA B.',
  category: 'PSA TODAY',
  tags: ['plucking', 'lace', 'hairline', 'advanced'],
  pillar: 'lace',
  contentFamilyId: 'family-plucking',
  /** Curriculum Bible editorial link — not customer-facing. */
  curriculumBibleId: 'lace-02-how-to-pluck-your-frontal',
  educationOwnership: {
    ownsConcepts: [
      'hairline density customization',
      'plucking technique',
      'over-plucking prevention',
    ],
    referencesConcepts: ['knot visibility', 'lace tint'],
    excludesConcepts: ['knot bleaching process', 'lace tinting process', 'adhesive installation'],
  },
  runtimeSeconds: 7 * 60,
  featured: true,
  published: true,
  comingSoon: false,
  accessType: 'slay-ticket',
  slayTicketCost: 2,
  episodeTicketCost: 2,
  releaseState: 'released',
  linkedContentPackId: 'plucking-lace',
  watchPolicy: {
    includedWatches: 3,
    qualificationPercent: 0.333333,
    accessDurationYears: 1,
  },
  requiresPreparationCheck: true,
  thumbnailUrl: '/assets/NOIR/blanco-thumb.png',
  heroPosterUrl: '/assets/NOIR/blanco-thumb.png',
  cameraA: {
    previewVideoUrl: undefined,
    posterUrl: '/assets/NOIR/blanco-thumb.png',
    durationSeconds: undefined,
    socialReusable: true,
    transitionAtSeconds: undefined,
  },
  classKit: {
    id: 'psa-today-ep-01-class-kit',
    title: 'CLASS KIT',
    introText: 'EVERYTHING YOU NEED FOR THIS LESSON.',
    flatLayImageUrl: undefined,
    flatLayVideoUrl: undefined,
    tools: [
      {
        id: 'canvas-mannequin-head',
        order: 1,
        name: 'CANVAS MANNEQUIN HEAD',
        description: 'SECURE YOUR UNIT FOR CONTROLLED PLUCKING.',
        required: true,
        hotspot: { x: 0.22, y: 0.38 },
      },
      {
        id: 't-pins',
        order: 2,
        name: 'T-PINS',
        description: 'ANCHOR THE UNIT WITHOUT STRETCHING LACE.',
        required: true,
        hotspot: { x: 0.72, y: 0.28 },
      },
      {
        id: 'precision-tweezers',
        order: 3,
        name: 'PRECISION TWEEZERS',
        description: 'PLUCK 1–3 HAIRS AT A TIME FOR A GRADUATED LINE.',
        required: true,
        hotspot: { x: 0.48, y: 0.62 },
      },
      {
        id: 'rat-tail-comb',
        order: 4,
        name: 'RAT-TAIL COMB',
        description: 'SECTION AND REVEAL THE HAIRLINE WHILE YOU WORK.',
        required: true,
        hotspot: { x: 0.18, y: 0.68 },
      },
      {
        id: 'sectioning-clips',
        order: 5,
        name: 'SECTIONING CLIPS',
        description: 'KEEP DENSITY OUT OF THE WAY DURING PLUCKING.',
        required: false,
        hotspot: { x: 0.78, y: 0.58 },
      },
    ],
    fullKit: {
      label: 'SHOP THE FULL KIT',
      preferredDestination: 'choice',
    },
  },
  cameraB: {
    fullLessonVideoUrl: undefined,
    posterUrl: '/assets/NOIR/blanco-thumb.png',
  },
  chapters: [
    { id: 'ch-01-intro', label: '01 INTRO', type: 'camera-a', startSeconds: 0, gated: false },
    {
      id: 'ch-02-transition',
      label: '02 WALK-OFF',
      type: 'camera-a-transition',
      gated: false,
    },
    { id: 'ch-03-class-kit', label: '03 CLASS KIT', type: 'class-kit', gated: false },
    {
      id: 'ch-04-secure',
      label: '04 SECURE THE FRONTAL',
      type: 'camera-b',
      startSeconds: 0,
      gated: true,
    },
    {
      id: 'ch-05-density',
      label: '05 FIND THE DENSITY',
      type: 'camera-b',
      startSeconds: 45,
      gated: true,
    },
    {
      id: 'ch-06-pluck',
      label: '06 START PLUCKING',
      type: 'camera-b',
      startSeconds: 90,
      gated: true,
    },
    {
      id: 'ch-07-temples',
      label: '07 TEMPLE AREA',
      type: 'camera-b',
      startSeconds: 180,
      gated: true,
    },
    {
      id: 'ch-08-check',
      label: '08 FINAL CHECK',
      type: 'camera-b',
      startSeconds: 300,
      gated: true,
    },
    { id: 'ch-09-recap', label: '09 RECAP', type: 'recap', gated: true },
  ],
  social: {
    socialClipTitle: undefined,
    socialCaption: undefined,
  },
};
