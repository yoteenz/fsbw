/** Client mirror of server Slay Archetype constants (do not import api/_lib in src). */

export const PSA_SLAY_ARCHETYPES = [
  'THE BOARDROOM SLAYER',
  'THE SOFT LIFE SLAYER',
  'THE IT GIRL SLAYER',
  'THE VACATION SLAYER',
  'THE BRIDAL SLAYER',
] as const;

export type PsaSlayArchetype = (typeof PSA_SLAY_ARCHETYPES)[number];
