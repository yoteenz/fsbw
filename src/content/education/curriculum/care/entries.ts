import type { CurriculumBibleEntry } from '../../types';

/** Approved CARE Curriculum Bible — Episode 01 only. Episodes 02–08 remain under review. */
export const CARE_CURRICULUM_ENTRIES: CurriculumBibleEntry[] = [
  {
    id: 'care-01-intro-to-your-unit',
    curriculumCode: 'CARE-01',
    pillar: 'care',
    contentType: 'psa-today',
    title: 'INTRODUCTION TO YOUR UNIT',
    role: 'foundation',
    lifecyclePhase: 'foundation',
    primaryLearningObjective:
      'Establish canonical unit anatomy vocabulary and quality observation fundamentals that future Frontal Slayer education can assume.',
    linkedContentId: 'psa-care-ep-01-intro-to-your-unit',
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
      'detangling',
      'washing',
      'conditioning',
      'drying',
      'storage',
      'plucking',
      'knot bleaching',
      'lace tinting',
      'color transformation',
      'installation',
      'finished hairstyling',
      'upkeep maintenance',
    ],
    cameraBVisualRequirements: [
      'Unit inspection walkthrough',
      'Macro lace / hairline / knot observation',
      'Interior cap reveal',
      'Safe handling demonstration',
    ],
    antiOverlapNotes: [
      'Episode 01 prefaces future courses — it does not teach care procedures, lace customization, install, or styling.',
      'Dynamic Signature Unit personalization applies to Part 01 only where pedagogically appropriate.',
    ],
    recommendedNextIds: [],
    status: 'in-development',
    editorialNotes: [
      'APPROVED — EPISODE 01 ONLY. Episodes 02–08 under review.',
      'Tone: informative, trustworthy, neutral, observational — no competitor attacks.',
    ],
  },
];

export const CARE_CURRICULUM_LIFECYCLE = {
  foundation: ['care-01-intro-to-your-unit'],
} as const;
