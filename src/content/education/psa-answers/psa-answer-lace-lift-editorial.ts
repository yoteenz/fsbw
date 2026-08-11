import type { PsaAnswerEditorialContent } from './types';

const IMG_HERO = '/assets/BLANCO%20Hairline.png';
const IMG_LACE = '/assets/BLANCO%20LACE.png';
const IMG_SIDE = '/assets/NOIR/mannequin%20top.png';
const IMG_UNDERSIDE = '/assets/NOIR/mannequin%20bottom.png';

/** DEV-ONLY structured fixture — lace lift troubleshooting answer QA. */
export const PSA_ANSWER_EDITORIAL_LACE_LIFT: PsaAnswerEditorialContent = {
  id: 'psa-answer-lace-lift',
  deck:
    'The short answer: side lifting usually comes down to tension, prep, placement, or the way the adhesive is curing.',
  readTime: '3 MIN',
  directAnswer:
    'Side lifting happens when the lace isn\'t fully secured in that area. It\'s rarely just the adhesive. Most of the time it\'s tension near the ear, incomplete prep, improper adhesive placement, or not allowing the adhesive to tack.',
  heroMedia: [
    {
      id: 'lift-hero-side',
      src: IMG_HERO,
      alt: 'Lace side profile macro',
      role: 'hero',
      order: 0,
      objectPosition: 'center 40%',
    },
  ],
  relatedAnswerId: 'psa-answer-lace-buffer',
  deeperContent: {
    contentType: 'season',
    seasonId: 'season-install-01-prep-install-finish',
    masteryId: 'mastery-install',
    title: 'PROPER LACE PLACEMENT',
    description: 'Prep, install and secure placement that holds at the sides.',
  },
  modules: [
    {
      type: 'psaSays',
      body:
        'Side lifting happens when the lace isn\'t fully secured in that area. It\'s rarely just the adhesive. Most of the time it\'s tension near the ear, incomplete prep, improper adhesive placement, or not allowing the adhesive to tack.',
    },
    {
      type: 'likelyCauses',
      causes: [
        {
          number: '01',
          label: 'SIDE TENSION',
          body: 'Hair or elastic pulling the lace backward or upward right above the ear tab.',
        },
        {
          number: '02',
          label: 'INCOMPLETE PREP',
          body: 'Oils, product or residue can prevent the adhesive from gripping the skin.',
        },
        {
          number: '03',
          label: 'ADHESIVE PLACEMENT',
          body: 'Adhesive may be too close to the edge or not extended far enough toward the side.',
        },
        {
          number: '04',
          label: 'EAR-TAB FIT',
          body: 'Ear tabs that are too tight or not secured flat can cause the lace to lift.',
        },
      ],
    },
    {
      type: 'lookHere',
      items: [
        {
          label: 'LIFT START POINT',
          caption: 'Check where separation begins before assuming the whole side failed.',
          imageId: 'lift-evidence-start',
        },
        {
          label: 'CORRECTLY LAID SIDE',
          caption: 'A flat side should follow the temple without tension lines.',
          imageId: 'lift-evidence-good',
        },
        {
          label: 'ADHESIVE PLACEMENT',
          caption: 'Product should extend slightly past the lace edge — not stop short.',
          imageId: 'lift-evidence-glue',
        },
        {
          label: 'LACE ANGLE',
          caption: 'The lace should sit flush, not buckled or folded at the tab.',
          imageId: 'lift-evidence-angle',
        },
      ],
    },
    {
      type: 'psaNote',
      number: '01',
      body:
        'Most lifting isn\'t from the glue — it\'s from the pull. Secure the side before you secure the front.',
    },
    {
      type: 'tryThisFirst',
      steps: [
        {
          number: '01',
          label: 'CLEAN THE AREA',
          body: 'Remove oils and product with an alcohol pad.',
        },
        {
          number: '02',
          label: 'RESET THE SIDE',
          body: 'Lay the lace back without pulling or stretching.',
        },
        {
          number: '03',
          label: 'ALLOW TO TACK',
          body: 'Let adhesive tack until sticky, not wet.',
        },
      ],
    },
    {
      type: 'escalation',
      body:
        'You may be dealing with fit, cap construction, lace shape or placement. Adjust your placement or try a different method that works with your head shape and install style.',
    },
  ],
};

export const PSA_ANSWER_LACE_LIFT_MEDIA: import('../types').SlayTipEditorialImage[] = [
  { id: 'lift-evidence-start', src: IMG_SIDE, alt: 'Lift start point', role: 'macro', order: 1 },
  { id: 'lift-evidence-good', src: IMG_HERO, alt: 'Correctly laid side', role: 'detail', order: 2 },
  { id: 'lift-evidence-glue', src: IMG_LACE, alt: 'Adhesive placement', role: 'macro', order: 3 },
  { id: 'lift-evidence-angle', src: IMG_UNDERSIDE, alt: 'Lace angle', role: 'supporting', order: 4 },
];
