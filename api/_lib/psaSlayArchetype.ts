/**
 * Slay Archetype system — contextual identity (quiz + DNA).
 */
export const PSA_SLAY_ARCHETYPES = [
  'THE BOARDROOM SLAYER',
  'THE SOFT LIFE SLAYER',
  'THE IT GIRL SLAYER',
  'THE VACATION SLAYER',
  'THE BRIDAL SLAYER',
] as const;

export type PsaSlayArchetype = (typeof PSA_SLAY_ARCHETYPES)[number];

export type ArchetypeDnaHints = {
  textureAffinity: ('straight' | 'wavy' | 'curly')[];
  maintenanceTolerance: 'low' | 'medium' | 'high';
  recommendedUnits: string[];
  vibeLine: string;
};

export const ARCHETYPE_DNA_HINTS: Record<PsaSlayArchetype, ArchetypeDnaHints> = {
  'THE BOARDROOM SLAYER': {
    textureAffinity: ['straight'],
    maintenanceTolerance: 'low',
    recommendedUnits: ['NOIR', 'BLANCO'],
    vibeLine: 'Polished, low-drama, camera-ready straight lines.',
  },
  'THE SOFT LIFE SLAYER': {
    textureAffinity: ['straight', 'wavy'],
    maintenanceTolerance: 'low',
    recommendedUnits: ['BLANCO', 'SOFT WAVE'],
    vibeLine: 'Effortless luxury, minimal daily fight.',
  },
  'THE IT GIRL SLAYER': {
    textureAffinity: ['wavy', 'curly'],
    maintenanceTolerance: 'medium',
    recommendedUnits: ['BEACH WAVE', 'SOFT CURL'],
    vibeLine: 'Statement texture, rotation-worthy glam.',
  },
  'THE VACATION SLAYER': {
    textureAffinity: ['wavy'],
    maintenanceTolerance: 'medium',
    recommendedUnits: ['BEACH WAVE', 'SOFT WAVE'],
    vibeLine: 'Humidity-friendly movement, trip-ready.',
  },
  'THE BRIDAL SLAYER': {
    textureAffinity: ['wavy', 'straight'],
    maintenanceTolerance: 'medium',
    recommendedUnits: ['SOFT WAVE', 'BLANCO'],
    vibeLine: 'Event polish with install timing discipline.',
  },
};

const LEGACY_HAIR_PROFILE_TO_ARCHETYPE: Record<string, PsaSlayArchetype> = {
  'THE EFFORTLESS SLAYER': 'THE SOFT LIFE SLAYER',
  'THE CEO SLAYER': 'THE BOARDROOM SLAYER',
  'THE SOFT GLAM SLAYER': 'THE IT GIRL SLAYER',
  'THE VACATION SLAYER': 'THE VACATION SLAYER',
  'THE BIRTHDAY BEHAVIOR SLAYER': 'THE IT GIRL SLAYER',
};

export function normalizeSlayArchetype(raw: string): PsaSlayArchetype | null {
  const upper = raw.trim().toUpperCase();
  const direct = PSA_SLAY_ARCHETYPES.find((a) => a === upper);
  if (direct) return direct;
  return LEGACY_HAIR_PROFILE_TO_ARCHETYPE[upper] ?? null;
}

export function buildPsaArchetypeBlock(archetype: string | null | undefined): string {
  if (!archetype?.trim()) {
    return `\n## Slay Archetype\nMember has not completed the archetype quiz. Offer **DISCOVER MY ARCHETYPE** energy when personalization would help.\n`;
  }
  const match = normalizeSlayArchetype(archetype);
  if (!match) return '';
  const hints = ARCHETYPE_DNA_HINTS[match];
  return `\n## Slay Archetype (contextual lens — not a label to repeat every reply)\n- **${match}**\n- Vibe: ${hints.vibeLine}\n- Lean units: ${hints.recommendedUnits.join(', ')}\n- Texture affinity: ${hints.textureAffinity.join(' / ')}\n- Maintenance tolerance: ${hints.maintenanceTolerance}\n`;
}
