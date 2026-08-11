import type { SlayTip } from '../types';

/**
 * DEV-ONLY placeholder — validates Slay Tip architecture.
 * NOT final canon copy or scrapbook art.
 */
export const SLAY_TIP_DEV_WET_HAIRLINE: SlayTip = {
  id: 'slay-tip-dev-wet-hairline-plucking',
  slug: 'wet-hairline-before-plucking',
  title: 'WET YOUR HAIRLINE BEFORE PLUCKING',
  publicTitle: 'BEFORE YOU PLUCK',
  revealTitle: 'DAMPEN THE HAIRLINE FIRST.',
  previewCopy:
    "There's one step worth taking before your tweezers ever touch the hairline.",
  subtitle: 'SLAY TIP · DEV PLACEHOLDER',
  shortDescription:
    "There's one step worth taking before your tweezers ever touch the hairline.",
  fullDescription:
    'THIS MICRO-LESSON EXPLAINS WHY A LIGHTLY DAMPENED HAIRLINE CAN IMPROVE VISIBILITY AND CONTROL — WITHOUT REPLACING THE FULL PLUCKING CLASS.',
  pillar: 'lace',
  contentFamilyId: 'family-plucking',
  relatedPSAEpisodeId: 'psa-today-ep-01-how-to-pluck-your-frontal',
  tags: ['plucking', 'hairline', 'technique-modifier'],
  format: 'scrapbook',
  slayTicketCost: 1,
  published: true,
  comingSoon: false,
  thumbnailUrl: '/assets/NOIR/blanco-thumb.png',
  coverImageUrl: '/assets/NOIR/blanco-thumb.png',
  releaseDate: '2026-08-01',
  campaignId: 'plucking-launch-dev',
  accessPolicy: {
    accessDurationYears: 1,
    viewLimit: null,
  },
  educationOwnership: {
    ownsConcepts: ['damp hairline plucking modifier', 'hairline visibility optimization'],
    referencesConcepts: ['plucking technique', 'hairline density'],
    excludesConcepts: ['full plucking workflow', 'over-plucking prevention', 'class kit setup'],
  },
  pages: [
    {
      id: 'page-1',
      order: 1,
      layout: 'photo-focus',
      heading: 'WHY DAMPEN THE HAIRLINE?',
      body: 'A LIGHT MIST CAN HELP INDIVIDUAL HAIRS STAND OUT AGAINST LACE — USEFUL FOR PRECISE PLUCKING WITHOUT CHANGING YOUR OVERALL TECHNIQUE.',
      callout: 'DEV PLACEHOLDER — INSERT FINAL SCRAPBOOK PHOTO',
      imageUrl: '/assets/NOIR/blanco-thumb.png',
      altText: 'Placeholder scrapbook photo',
    },
    {
      id: 'page-2',
      order: 2,
      layout: 'tip',
      heading: 'HOW MUCH MOISTURE?',
      body: 'DAMP — NOT DRIPPING. YOU WANT VISIBILITY, NOT SATURATED LACE THAT STRETCHES OR SHIFTS UNDER TENSION.',
    },
    {
      id: 'page-3',
      order: 3,
      layout: 'text-focus',
      heading: 'WHEN TO SKIP IT',
      body: 'IF YOUR LACE IS FRAGILE, NEW, OR YOU ARE STILL LEARNING BASIC PLUCKING CONTROL, MASTER THE FULL CLASS FIRST. THIS TIP IS AN OPTIMIZATION — NOT A REQUIREMENT.',
      callout: 'REQUIRED SAFETY + CORE TECHNIQUE LIVE IN PSA TODAY.',
    },
  ],
};
