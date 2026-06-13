/**
 * Build-a-Wig catalog unit + color facts for Fal hairstyle analysis prompts.
 * Mirrors src/data/hairstyleCatalog.ts and unit PDP specs (unitPdpDetailsConfig).
 */

import { normalizeAnalysisStylingId } from './hairstyleAnalysisDisplay.js';

export const CATALOG_UNITS = [
  'NOIR',
  'BLANCO',
  'SOFT WAVE',
  'BEACH WAVE',
  'SOFT CURL',
  'OCEAN CURL',
] as const;

export type CatalogUnitName = (typeof CATALOG_UNITS)[number];

const BLANCO_COLORS = new Set(['GOLDEN', 'PLATINUM', 'ASH']);

/** Colors that must be one uniform tone root to tip — no dark roots / ombré. */
const UNIFORM_ROOT_TO_TIP_COLORS = new Set([
  'CHESTNUT',
  'HONEY',
  'AUBURN',
  'COPPER',
  'GINGER',
  'SANGRIA',
  'CHERRY',
  'RASPBERRY',
  'PLUM',
  'COBALT',
  'TEAL',
  'SLIME',
  'CITRINE',
  'GOLDEN',
  'PLATINUM',
  'ASH',
]);

type UnitCatalogEntry = {
  pattern: 'STRAIGHT' | 'WAVY' | 'CURLY';
  origin: string;
  density: string;
  fiber: string;
  render: string;
  forbidden: string;
};

const UNIT_CATALOG: Record<CatalogUnitName, UnitCatalogEntry> = {
  NOIR: {
    pattern: 'STRAIGHT',
    origin: 'Cambodian',
    density: '250%',
    fiber: 'silky straight (stock SILKY finish — high gloss, pin-straight)',
    render:
      'pin-straight sleek Cambodian raw straight hair with silky shine — falls straight with natural weight',
    forbidden: 'kinky, yaki, coily, afro-textured, tight curls, or beach waves',
  },
  BLANCO: {
    pattern: 'STRAIGHT',
    origin: 'Russian',
    density: '250%',
    fiber: 'silky straight (stock SILKY finish — glassy sleek straight only)',
    render:
      'silky glass-straight Russian raw straight hair — smooth, lustrous, pin-straight blonde/platinum family',
    forbidden:
      'kinky, yaki, coily, afro-textured, curly, wavy, crimped, or fuzzy texture — BLANCO is NEVER kinky',
  },
  'SOFT WAVE': {
    pattern: 'WAVY',
    origin: 'Indian',
    density: '200%',
    fiber: 'soft wavy (natural S-wave pattern)',
    render: 'soft brushed S-wave — Indian raw wavy hair with gentle wave motion, not pin-straight',
    forbidden: 'pin-straight ironing, kinky afro texture, or tight curls',
  },
  'BEACH WAVE': {
    pattern: 'WAVY',
    origin: 'Indonesian',
    density: '200%',
    fiber: 'relaxed beach wave',
    render: 'relaxed loose beach-wave pattern — Indonesian raw wavy hair, effortless S-waves',
    forbidden: 'pin-straight, kinky texture, or tight spiral curls',
  },
  'SOFT CURL': {
    pattern: 'CURLY',
    origin: 'Filipino',
    density: '200%',
    fiber: 'soft curl definition',
    render: 'soft defined curls — Filipino raw curly hair with springy curl clumps',
    forbidden: 'straight, wavy-only, or kinky afro texture unrelated to soft curl',
  },
  'OCEAN CURL': {
    pattern: 'CURLY',
    origin: 'Vietnamese',
    density: '200%',
    fiber: 'deeper ocean curl pattern',
    render:
      'deeper defined curl pattern than SOFT CURL — Vietnamese raw curly hair, richer curl formation',
    forbidden: 'straight, loose wave only, or kinky unrelated texture',
  },
};

export function normalizeCatalogUnit(unit: string): CatalogUnitName | null {
  const key = unit.trim().toUpperCase() as CatalogUnitName;
  return (CATALOG_UNITS as readonly string[]).includes(key) ? key : null;
}

export function isBlancoColor(color: string): boolean {
  return BLANCO_COLORS.has(color.trim().toUpperCase());
}

export function requiresUniformRootToTipColor(color: string): boolean {
  const c = color.trim().toUpperCase();
  return UNIFORM_ROOT_TO_TIP_COLORS.has(c);
}

export function unitTexturePromptLine(unit: string): string {
  const key = normalizeCatalogUnit(unit);
  if (!key) return `Render catalog unit ${unit.trim().toUpperCase()} with accurate BAW strand pattern.`;
  const entry = UNIT_CATALOG[key];
  return [
    `TEXTURE ${key} = ${entry.origin} raw ${entry.pattern} human hair, ${entry.fiber}.`,
    `Render: ${entry.render}.`,
    `FORBIDDEN for ${key}: ${entry.forbidden}.`,
  ].join(' ');
}

export function unitColorPromptLine(unit: string, color: string, hex: string): string {
  const unitKey = normalizeCatalogUnit(unit);
  const colorKey = color.trim().toUpperCase();
  const pigment = (hex || '#000000').toUpperCase();

  if (unitKey === 'BLANCO') {
    return [
      `COLOR ${colorKey} on BLANCO: uniform ${colorKey} blonde tone root to tip on silky straight Russian hair (pigment ${pigment}).`,
      'NO dark roots, NO ash band at roots, NO ombré — one light blonde family from lace to ends.',
      `Hairline baby hairs and edge wisps = same ${colorKey} tone — never black.`,
    ].join(' ');
  }

  if (requiresUniformRootToTipColor(colorKey)) {
    return [
      `COLOR ${colorKey} on ${unitKey ?? unit}: BAW custom color — **one uniform ${colorKey} tone root to tip** (pigment ${pigment}).`,
      'FORBIDDEN: dark roots, black roots, shadow roots, ombré, dip-dye, two-tone regrowth, or natural root melt.',
      `Every strand from hairline to ends reads as ${colorKey} — lighting shine only, not a second root color.`,
      'Baby hairs and lace-edge wisps at the forehead/temples = same ${colorKey} pigment — never black/dark when the install color is ${colorKey}.',
    ].join(' ');
  }

  if (colorKey === 'JET BLACK' || colorKey === 'OFF BLACK' || colorKey === 'ESPRESSO') {
    return [
      `COLOR ${colorKey}: natural brunette/black depth allowed — subtle dimension within ${colorKey} only (pigment ${pigment}).`,
      'Still NO fashion-color roots (no red/plum/copper roots under a different mids).',
    ].join(' ');
  }

  return `COLOR ${colorKey}: repaint to catalog pigment ${pigment} — strand-level, installed look on ${unitKey ?? unit}.`;
}

export function bawUnitCatalogBlock(): string {
  const lines = [
    '=== BAW CATALOG UNITS — TEXTURE + PATTERN (MANDATORY) ===',
    'TEXTURE value = unit name. Each unit has a fixed raw pattern — render precisely, never swap patterns between units.',
    'Stock presentation = SILKY fiber on straight units; native wave/curl pattern on wave/curl units.',
  ];

  for (const key of CATALOG_UNITS) {
    const entry = UNIT_CATALOG[key];
    lines.push(
      `${key}: ${entry.origin} ${entry.pattern}, ${entry.density} density — ${entry.render}. NOT: ${entry.forbidden}.`
    );
  }

  return lines.join('\n');
}

export function bawColorApplicationRulesBlock(): string {
  return [
    '=== BAW COLOR — ROOT TO TIP (CRITICAL) ===',
    'Build-a-Wig custom/lifted colors are **one uniform tone from root to tip** on the installed unit.',
    'FORBIDDEN on vivid + custom colors (CHERRY, RASPBERRY, PLUM, COBALT, TEAL, SLIME, CITRINE, HONEY, AUBURN, COPPER, GINGER, SANGRIA, GOLDEN, PLATINUM, ASH):',
    'dark roots, black roots, shadow roots, ombré, balayage root melt, dip-dye, or two-tone regrowth.',
    'Hairline baby hairs, wispy edge strands, and temple flyaways must be the **same catalog color** as the main hair — never left black when the unit is a fashion/vivid tone.',
    'CHERRY example: vivid red (#FF1400) **same saturation from lace to ends** — zero dark root band.',
    'BLANCO (GOLDEN / PLATINUM / ASH only): silky straight blonde/light uniform root to tip.',
    'JET BLACK / OFF BLACK / ESPRESSO: natural brunette depth within that shade only — never pair with fashion-color body.',
    'Use catalog hex for pigment; strand shine and lighting variation OK — **not** a second root pigment.',
  ].join('\n');
}

export function lookHairAccuracyLines(look: { unit: string; color: string; hex: string }): string {
  return [unitTexturePromptLine(look.unit), unitColorPromptLine(look.unit, look.color, look.hex)].join(
    '\n'
  );
}

const VALID_SALON_STYLES: Record<CatalogUnitName, readonly string[]> = {
  NOIR: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  BLANCO: ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'BEACH WAVE': ['NONE', 'LAYERS', 'CRIMPS', 'FLAT IRON'],
  'SOFT CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
  'OCEAN CURL': ['NONE', 'DEFINE', 'WAND CURLS'],
};

function defaultSalonStyleForPattern(pattern: UnitCatalogEntry['pattern']): string {
  if (pattern === 'STRAIGHT') return 'FLAT IRON';
  if (pattern === 'WAVY') return 'LAYERS';
  return 'DEFINE';
}

function coerceSalonStyleForUnit(
  unitKey: CatalogUnitName,
  styling: string,
  styleIndex = 0
): string {
  const allowed = VALID_SALON_STYLES[unitKey].filter((s) => s !== 'NONE');
  if (styling === 'NONE') {
    return (
      allowed[styleIndex % allowed.length] ??
      defaultSalonStyleForPattern(UNIT_CATALOG[unitKey].pattern)
    );
  }
  if (allowed.includes(styling)) return styling;
  return (
    allowed[styleIndex % allowed.length] ??
    defaultSalonStyleForPattern(UNIT_CATALOG[unitKey].pattern)
  );
}

/** Align TOP MATCH / look specs with BAW catalog unit (density, valid salon STYLE id). */
export function resolveCatalogLookForFal<
  T extends {
    unit: string;
    styling: string;
    density: string;
    color: string;
    hex: string;
  },
>(look: T, styleIndex = 0): T {
  const unit = look.unit.trim().toUpperCase();
  const unitKey = normalizeCatalogUnit(unit);
  const styling = normalizeAnalysisStylingId(unit, look.styling);
  const catalog = unitKey ? UNIT_CATALOG[unitKey] : null;
  const resolvedStyling = unitKey ? coerceSalonStyleForUnit(unitKey, styling, styleIndex) : styling;
  const density =
    catalog && (!look.density?.trim() || (look.density === '250%' && catalog.density !== '250%'))
      ? catalog.density
      : look.density;

  return {
    ...look,
    unit,
    styling: resolvedStyling,
    density,
    color: look.color.trim().toUpperCase(),
    hex: look.hex?.trim() || '#000000',
  };
}
