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
  pattern: 'STRAIGHT' | 'WAVY' | 'TIGHT_WAVE' | 'CURLY';
  appearance: string;
  origin: string;
  density: string;
  fiber: string;
  render: string;
  forbidden: string;
};

const UNIT_CATALOG: Record<CatalogUnitName, UnitCatalogEntry> = {
  NOIR: {
    pattern: 'STRAIGHT',
    appearance: 'straight',
    origin: 'Cambodian',
    density: '250%',
    fiber: 'silky straight (stock SILKY finish — high gloss, pin-straight)',
    render:
      'appears **straight** — pin-straight sleek Cambodian raw hair with silky shine; falls straight with natural weight',
    forbidden: 'any wave, wavy motion, curls, kinky, yaki, coily, afro-textured, or beach-wave pattern',
  },
  BLANCO: {
    pattern: 'STRAIGHT',
    appearance: 'straight',
    origin: 'Russian',
    density: '250%',
    fiber: 'silky straight (stock SILKY finish — glassy sleek straight only)',
    render:
      'appears **straight** — silky glass-straight Russian raw hair; smooth, lustrous, pin-straight blonde/platinum family',
    forbidden:
      'any wave, wavy motion, curls, kinky, yaki, coily, afro-textured, crimped, or fuzzy texture — BLANCO is NEVER wavy or curly',
  },
  'SOFT WAVE': {
    pattern: 'WAVY',
    appearance: 'loose wave',
    origin: 'Indian',
    density: '200%',
    fiber: 'loose soft wave (gentlest S-wave tier)',
    render:
      'appears **loose wave** — soft brushed S-wave with gentle relaxed motion; loosest wave tier (less defined than BEACH WAVE)',
    forbidden: 'pin-straight, tight waves (SOFT CURL), tight spiral curls (OCEAN CURL), or kinky afro texture',
  },
  'BEACH WAVE': {
    pattern: 'WAVY',
    appearance: 'true wavy',
    origin: 'Indonesian',
    density: '200%',
    fiber: 'true beach wave (rolling S-waves)',
    render:
      'appears **true wavy** — clear rolling beach-wave S-pattern; more defined wave than SOFT WAVE loose wave',
    forbidden: 'pin-straight, loose-only SOFT WAVE fluff, tight waves (SOFT CURL), tight spiral curls (OCEAN CURL), or kinky texture',
  },
  'SOFT CURL': {
    pattern: 'TIGHT_WAVE',
    appearance: 'tight wave',
    origin: 'Filipino',
    density: '200%',
    fiber: 'tight wave (compact elongated S-waves — NOT spiral curls)',
    render:
      'appears **tight wave** — compact elongated waves with minimal spiral; Filipino raw hair at the tightest **wave** tier only',
    forbidden:
      'spiral curls, ringlets, corkscrews, ocean-curl pattern, springy curl clumps, or any texture that reads like OCEAN CURL',
  },
  'OCEAN CURL': {
    pattern: 'CURLY',
    appearance: 'tight curl',
    origin: 'Vietnamese',
    density: '200%',
    fiber: 'tight spiral curl pattern',
    render:
      'appears **tight curl** — springy spiral ringlets and defined curl clumps; Vietnamese raw hair — the only BAW unit with true tight curls',
    forbidden:
      'straight, loose wave (SOFT WAVE), true wavy-only (BEACH WAVE), tight-wave-only (SOFT CURL), or pin-straight',
  },
};

export function normalizeCatalogUnit(unit: string): CatalogUnitName | null {
  const key = unit.trim().toUpperCase() as CatalogUnitName;
  return (CATALOG_UNITS as readonly string[]).includes(key) ? key : null;
}

export function isBlancoColor(color: string): boolean {
  return BLANCO_COLORS.has(color.trim().toUpperCase());
}

/** Catalog colors valid for a BAW unit (BLANCO = blonde family only). */
export function allowedColorsForCatalogUnit(unit: string): readonly string[] {
  const key = normalizeCatalogUnit(unit);
  if (key === 'BLANCO') return ['GOLDEN', 'PLATINUM', 'ASH'];
  return [
    'JET BLACK',
    'OFF BLACK',
    'ESPRESSO',
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
  ];
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
    `TEXTURE ${key} = ${entry.origin} raw human hair — catalog appearance: **${entry.appearance}** (${entry.fiber}).`,
    `Render: ${entry.render}.`,
    `FORBIDDEN for ${key}: ${entry.forbidden}.`,
  ].join(' ');
}

/** One-line texture tier lock for mannequin/styling refs — never swap unit appearance. */
export function unitTextureAppearanceLock(unit: string): string | null {
  const key = normalizeCatalogUnit(unit);
  if (!key) return null;
  const entry = UNIT_CATALOG[key];
  return `${key} must appear **${entry.appearance}** — ${entry.render}; NOT: ${entry.forbidden}.`;
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
      `Baby hairs and lace-edge wisps at the forehead/temples = same ${colorKey} pigment — never black/dark when the install color is ${colorKey}.`,
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
    '=== BAW CATALOG UNITS — TEXTURE APPEARANCE (MANDATORY — NEVER SWAP) ===',
    'TEXTURE value = unit name. Each unit has a fixed visual tier — render precisely, never swap patterns between units.',
    'Appearance ladder: NOIR + BLANCO = **straight** | SOFT WAVE = **loose wave** | BEACH WAVE = **true wavy** | SOFT CURL = **tight wave** | OCEAN CURL = **tight curl**.',
    'CRITICAL: SOFT CURL is **tight wave only** (elongated waves) — never spiral curls like OCEAN CURL. OCEAN CURL is the **only** tight-curl unit.',
    'SELF-CHECK: SOFT CURL that looks like OCEAN CURL spirals → wrong. NOIR/BLANCO with visible wave → wrong.',
    'Stock presentation = SILKY fiber on straight units; native wave/curl tier on wave/curl units.',
  ];

  for (const key of CATALOG_UNITS) {
    const entry = UNIT_CATALOG[key];
    lines.push(
      `${key}: **${entry.appearance}** — ${entry.origin}, ${entry.density} density — ${entry.render}. NOT: ${entry.forbidden}.`
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
    'MATCH 02–04 thumbnails: PLATINUM/GOLDEN/ASH/vivid colors must show **zero dark root band** — repaint scalp zone fully.',
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

function resolveStylingForCatalog(
  unitKey: CatalogUnitName,
  styling: string,
  _styleIndex: number
): string {
  const allowed = VALID_SALON_STYLES[unitKey];
  if (!styling || styling === 'NONE') return 'NONE';
  if (allowed.includes(styling)) return styling;
  return 'NONE';
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
  const resolvedStyling = unitKey
    ? resolveStylingForCatalog(unitKey, styling, styleIndex)
    : styling;
  const densityRaw = look.density?.trim().replace(/\s*DENSITY\s*$/i, '') ?? '';
  const density =
    !densityRaw
      ? (catalog?.density ?? look.density)
      : densityRaw.includes('%')
        ? densityRaw
        : `${densityRaw}%`;

  return {
    ...look,
    unit,
    styling: resolvedStyling,
    density,
    color: look.color.trim().toUpperCase(),
    hex: look.hex?.trim() || '#000000',
  };
}
