/**
 * studio os platform vocabulary — industry-agnostic terms.
 * Use consistently in naming, UI labels, docs, and code comments.
 */

export const STUDIO_OS_VOCABULARY = {
  workspace: {
    term: 'Workspace',
    definition: 'A company, brand, or client operating inside studio os.',
    example: 'Frontal Slayer',
  },
  studio: {
    term: 'Studio',
    definition: 'A creative department, production area, show environment, or internal production space within a Workspace.',
  },
  project: {
    term: 'Project',
    definition: 'A campaign, launch, initiative, or major business objective.',
  },
  contentPack: {
    term: 'Content Pack',
    definition: 'The complete production package created from one idea.',
  },
  asset: {
    term: 'Asset',
    definition:
      'Any reusable visual, audio, prompt, template, file, material, environment, character, product image, video, or brand element.',
  },
} as const;

export type StudioOsVocabularyKey = keyof typeof STUDIO_OS_VOCABULARY;
