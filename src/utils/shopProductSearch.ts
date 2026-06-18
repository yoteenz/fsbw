/**
 * Intelligent storefront search: wig units + Build-a-Wig customization options.
 * Used by `/home/shop?q=` to filter the UNITS strip and BCF category sections.
 */

import {
  ADDON_COMBO_OPTIONS,
  ADDON_OPTIONS,
  COLOR_OPTIONS_BLANCO,
  COLOR_OPTIONS_DEFAULT,
  DENSITY_OPTIONS,
  HAIRLINE_OPTIONS,
  LACE_OPTIONS,
  LENGTH_OPTIONS,
  STYLING_OPTIONS,
  STYLING_OPTIONS_CURLY,
  TEXTURE_OPTIONS,
  type UnitId,
  getColorOptionsForUnit,
  getOptionsForUnit,
} from './productOptions';
import { BAW_SALON_STYLING_IDS } from './bawUnitStylingOptions';
import {
  BCF_COLOR_OPTIONS,
  BCF_LACE_OPTIONS,
  BCF_ORIGIN_OPTIONS,
  BCF_TEXTURE_LABELS,
} from './bcfProductOptions';

export const ALL_UNIT_IDS: readonly UnitId[] = [
  'noir',
  'blanco',
  'soft-wave',
  'beach-wave',
  'soft-curl',
  'ocean-curl',
] as const;

export type ShopUnitSearchRecord = {
  id: string;
  name: string;
  length?: string;
  hairOrigin?: string;
  route?: string;
};

export type BcfCategorySlug = 'bundles' | 'closures' | 'frontals';
export type ShopTextureSlug = 'straight' | 'wavy' | 'curly';

export type ShopSearchScope<T extends ShopUnitSearchRecord = ShopUnitSearchRecord> = {
  /** Filtered wig units for the UNITS strip (ranked best match first). */
  units: T[];
  /** BCF marble cards to show when search is active (empty = hide all BCF cards). */
  bcfCategories: BcfCategorySlug[];
  /** Texture tabs still relevant inside visible BCF cards (empty = all three). */
  bcfTextures: ShopTextureSlug[];
  /** True when the query matched a BAW option (color, styling, lace, etc.). */
  matchedBawOptions: boolean;
};

const CAP_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XXS/XS/S', 'S/M/L'] as const;
const PART_OPTIONS = ['LEFT', 'MIDDLE', 'RIGHT'] as const;

const UNIT_DISPLAY_NAMES: Record<UnitId, string> = {
  noir: 'NOIR',
  blanco: 'BLANCO',
  'soft-wave': 'SOFT WAVE',
  'beach-wave': 'BEACH WAVE',
  'soft-curl': 'SOFT CURL',
  'ocean-curl': 'OCEAN CURL',
};

const UNIT_TEXTURE_FAMILY: Record<UnitId, ShopTextureSlug> = {
  noir: 'straight',
  blanco: 'straight',
  'soft-wave': 'wavy',
  'beach-wave': 'wavy',
  'soft-curl': 'curly',
  'ocean-curl': 'curly',
};

const UNIT_ORIGIN_KEYWORDS: Record<UnitId, string[]> = {
  noir: ['cambodian'],
  blanco: ['russian'],
  'soft-wave': ['indian'],
  'beach-wave': ['indonesian'],
  'soft-curl': ['filipino'],
  'ocean-curl': ['vietnamese'],
};

/** Curly salon equivalent for straight/wavy styling ids (intelligent cross-family search). */
const STYLING_CROSS_FAMILY: Record<string, string[]> = {
  LAYERS: ['DEFINE'],
  DEFINE: ['LAYERS'],
  CRIMPS: ['WAND CURLS'],
  'WAND CURLS': ['CRIMPS'],
};

const STYLING_EXTRA_ALIASES: Record<string, string[]> = {
  LAYERS: ['layer', 'layers', 'face framing', 'face-framing'],
  DEFINE: ['define', 'layer', 'layers', 'face framing', 'face-framing'],
  CRIMPS: ['crimp', 'crimps'],
  'WAND CURLS': ['wand curl', 'wand curls', 'crimp', 'crimps'],
  'FLAT IRON': ['flat iron', 'flatiron', 'straightened'],
  BANGS: ['bang', 'bangs', 'fringe'],
  NONE: [],
};

const COLOR_EXTRA_ALIASES: Record<string, string[]> = {
  'JET BLACK': ['jet black', 'jet-black', 'black'],
  'OFF BLACK': ['off black', 'off-black'],
  PLATINUM: ['platinum', 'blonde', 'blond'],
  GOLDEN: ['golden', 'blonde', 'blond'],
  ASH: ['ash', 'ash blonde'],
};

const HAIRLINE_EXTRA_ALIASES: Record<string, string[]> = {
  'LAGOS, PEAK': ['lagos peak', 'lagos + peak', 'lagos and peak', 'lagos, peak'],
  LAGOS: ['lagos'],
  PEAK: ['peak'],
  NATURAL: ['natural hairline', 'natural'],
};

const CATEGORY_KEYWORDS: Record<BcfCategorySlug, string[]> = {
  bundles: ['bundle', 'bundles'],
  closures: ['closure', 'closures'],
  frontals: ['frontal', 'frontals', 'hd lace'],
};

const TEXTURE_KEYWORDS: Record<ShopTextureSlug, string[]> = {
  straight: ['straight'],
  wavy: ['wavy', 'wave'],
  curly: ['curly', 'curl'],
};

const BAW_CATEGORY_KEYWORDS: Record<string, string[]> = {
  color: ['color', 'colors', 'colour', 'colours', 'dye', 'tone'],
  styling: ['styling', 'style', 'salon', 'styled'],
  length: ['length', 'lengths', 'inches', 'inch'],
  density: ['density', 'fullness', 'volume'],
  lace: ['lace', 'frontal lace', 'closure lace'],
  hairline: ['hairline', 'hair line'],
  texture: ['texture', 'silky', 'kinky', 'yaki'],
  capSize: ['cap', 'capsize', 'cap size', 'circumference', 'flexible', 'flex cap'],
  addon: ['addon', 'add-on', 'add on', 'bleach', 'pluck', 'blunt cut', 'blunt'],
  part: ['part', 'parting', 'middle part', 'side part'],
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[""]/g, '"')
    .replace(/[%×]/g, (ch) => (ch === '×' ? 'x' : ch))
    .replace(/[^a-z0-9"/\s,+.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactText(value: string): string {
  return normalizeText(value).replace(/[\s/,-]+/g, '');
}

function tokenizeQuery(raw: string): string[] {
  const normalized = normalizeText(raw);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter(Boolean);
}

function unitsSupportingOption(
  unitIds: readonly UnitId[],
  predicate: (unitId: UnitId) => boolean
): UnitId[] {
  return unitIds.filter(predicate);
}

function unitsForColor(colorId: string): UnitId[] {
  const id = colorId.toUpperCase();
  return unitsSupportingOption(ALL_UNIT_IDS, (uid) =>
    getColorOptionsForUnit(uid).some((c) => c.toUpperCase() === id)
  );
}

function stylingQueryMatchesUnit(query: string, unitId: UnitId): boolean {
  const stylingList =
    unitId === 'soft-curl' || unitId === 'ocean-curl' ? STYLING_OPTIONS_CURLY : STYLING_OPTIONS;
  const queryNorm = normalizeText(query);

  for (const entry of stylingList) {
    const atomic = entry.split(',').map((p) => p.trim());
    for (const id of atomic) {
      if (expandStylingSearchTerms(id).some((term) => queryNorm.includes(term) || term.includes(queryNorm))) {
        return true;
      }
    }
  }

  for (const [from, toList] of Object.entries(STYLING_CROSS_FAMILY)) {
    const fromTerms = expandStylingSearchTerms(from, true);
    if (!fromTerms.some((term) => queryNorm.includes(term) || term.includes(queryNorm))) continue;
    if (unitsForStylingToken(from).includes(unitId)) return true;
    for (const cross of toList) {
      if (unitsForStylingToken(cross).includes(unitId)) return true;
    }
  }

  return false;
}

function unitsForStylingToken(token: string): UnitId[] {
  const upper = token.toUpperCase();
  const idsToCheck = new Set<string>([upper]);
  for (const [from, toList] of Object.entries(STYLING_CROSS_FAMILY)) {
    if (from === upper) toList.forEach((t) => idsToCheck.add(t));
    if (toList.includes(upper)) idsToCheck.add(from);
  }

  return unitsSupportingOption(ALL_UNIT_IDS, (uid) => {
    const stylingList =
      uid === 'soft-curl' || uid === 'ocean-curl' ? STYLING_OPTIONS_CURLY : STYLING_OPTIONS;
    return stylingList.some((entry) => {
      const parts = entry.split(',').map((p) => p.trim().toUpperCase());
      return parts.some((p) => idsToCheck.has(p));
    });
  });
}

function expandStylingSearchTerms(stylingId: string, includeCrossFamily = false): string[] {
  const upper = stylingId.toUpperCase();
  const terms = new Set<string>([normalizeText(stylingId), compactText(stylingId)]);
  for (const alias of STYLING_EXTRA_ALIASES[upper] ?? []) {
    terms.add(normalizeText(alias));
    terms.add(compactText(alias));
  }
  if (includeCrossFamily) {
    for (const cross of STYLING_CROSS_FAMILY[upper] ?? []) {
      terms.add(normalizeText(cross));
      terms.add(compactText(cross));
      for (const alias of STYLING_EXTRA_ALIASES[cross] ?? []) {
        terms.add(normalizeText(alias));
        terms.add(compactText(alias));
      }
    }
  }
  return [...terms];
}

function expandColorSearchTerms(colorId: string): string[] {
  const upper = colorId.toUpperCase();
  const terms = new Set<string>([normalizeText(colorId), compactText(colorId)]);
  for (const alias of COLOR_EXTRA_ALIASES[upper] ?? []) {
    terms.add(normalizeText(alias));
    terms.add(compactText(alias));
  }
  return [...terms];
}

function expandHairlineSearchTerms(hairlineId: string): string[] {
  const terms = new Set<string>([normalizeText(hairlineId), compactText(hairlineId)]);
  for (const alias of HAIRLINE_EXTRA_ALIASES[hairlineId.toUpperCase()] ?? []) {
    terms.add(normalizeText(alias));
    terms.add(compactText(alias));
  }
  return [...terms];
}

function buildUnitSearchCorpus(unitId: UnitId): string[] {
  const opts = getOptionsForUnit(unitId);
  const chunks: string[] = [
    unitId,
    UNIT_DISPLAY_NAMES[unitId],
    UNIT_TEXTURE_FAMILY[unitId],
    ...UNIT_ORIGIN_KEYWORDS[unitId],
    'unit',
    'units',
    'wig',
    'customize',
    'build a wig',
    'baw',
    opts.length.join(' '),
    opts.density.join(' '),
    opts.texture.join(' '),
    opts.lace.join(' '),
    ...opts.hairline.flatMap(expandHairlineSearchTerms),
    ...opts.color.flatMap(expandColorSearchTerms),
    ...opts.styling.flatMap((s) => expandStylingSearchTerms(s)),
    ...opts.addOns.map((a) => a.toLowerCase()),
    ...ADDON_COMBO_OPTIONS.map((c) => c.label.toLowerCase()),
    ...CAP_SIZE_OPTIONS.map((c) => c.toLowerCase()),
    ...PART_OPTIONS.map((p) => p.toLowerCase()),
    'parting',
  ];

  for (const cat of Object.keys(BAW_CATEGORY_KEYWORDS)) {
    chunks.push(cat);
  }

  return chunks.map(normalizeText).filter(Boolean);
}

function tokenMatchesCorpus(token: string, corpus: string[]): boolean {
  const t = normalizeText(token);
  const tc = compactText(token);
  if (!t) return false;
  return corpus.some((entry) => {
    const ec = compactText(entry);
    if (entry === t || entry.includes(t) || t.includes(entry)) return true;
    if (ec && tc && (ec.includes(tc) || tc.includes(ec))) return true;
    return false;
  });
}

function scoreUnitMatch(unitId: UnitId, rawQuery: string): number {
  const query = normalizeText(rawQuery);
  const tokens = tokenizeQuery(rawQuery);
  if (!query) return 0;

  const corpus = buildUnitSearchCorpus(unitId);
  const corpusJoined = corpus.join(' ');
  const unitName = UNIT_DISPLAY_NAMES[unitId].toLowerCase();
  const unitSlug = unitId.toLowerCase();

  let score = 0;

  if (query === unitSlug || query === unitName) score += 200;
  if (corpusJoined.includes(query)) score += 120;

  if (tokens.length > 0) {
    const allTokensMatch = tokens.every((tok) => {
      if (tokenMatchesCorpus(tok, corpus)) return true;
      if (stylingQueryMatchesUnit(tok, unitId)) return true;
      return false;
    });
    if (!allTokensMatch) return 0;
    score += 60 + tokens.length * 10;
  } else {
    return 0;
  }

  if (stylingQueryMatchesUnit(query, unitId)) score += 85;

  for (const color of [...COLOR_OPTIONS_DEFAULT, ...COLOR_OPTIONS_BLANCO]) {
    const colorTerms = expandColorSearchTerms(color);
    if (colorTerms.some((term) => query.includes(term) || term.includes(query))) {
      if (unitsForColor(color).includes(unitId)) score += 90;
    }
  }

  for (const stylingId of BAW_SALON_STYLING_IDS) {
    const styleTerms = expandStylingSearchTerms(stylingId, true);
    if (styleTerms.some((term) => query.includes(term) || term.includes(query))) {
      if (unitsForStylingToken(stylingId).includes(unitId)) score += 85;
    }
  }

  for (const lace of LACE_OPTIONS) {
    const laceNorm = compactText(lace);
    if (query.includes(normalizeText(lace)) || compactText(query).includes(laceNorm)) score += 70;
  }

  for (const origin of UNIT_ORIGIN_KEYWORDS[unitId]) {
    if (query.includes(origin)) score += 50;
  }

  if (TEXTURE_KEYWORDS[UNIT_TEXTURE_FAMILY[unitId]].some((kw) => query.includes(kw))) score += 45;

  return score;
}

function matchBcfCategories(rawQuery: string): BcfCategorySlug[] {
  const query = normalizeText(rawQuery);
  if (!query) return ['bundles', 'closures', 'frontals'];

  const matched = new Set<BcfCategorySlug>();
  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS) as [BcfCategorySlug, string[]][]) {
    if (keywords.some((kw) => query.includes(kw))) matched.add(slug);
  }

  const bcfColorHit = BCF_COLOR_OPTIONS.some((c) => {
    const terms = expandColorSearchTerms(c.id);
    return terms.some((term) => query.includes(term) || term.includes(query));
  });
  const bcfLaceHit = BCF_LACE_OPTIONS.some((l) => query.includes(compactText(l.id)));
  const bcfOriginHit = BCF_ORIGIN_OPTIONS.some((o) => query.includes(o.label.toLowerCase()));
  const bcfGeneric =
    query.includes('bundle') ||
    query.includes('closure') ||
    query.includes('frontal') ||
    query.includes('bcf') ||
    query.includes('raw human hair');

  if (bcfColorHit || bcfLaceHit || bcfOriginHit || bcfGeneric) {
    return ['bundles', 'closures', 'frontals'];
  }

  return [...matched];
}

function matchBcfTextures(rawQuery: string): ShopTextureSlug[] {
  const query = normalizeText(rawQuery);
  if (!query) return ['straight', 'wavy', 'curly'];

  const matched = new Set<ShopTextureSlug>();
  for (const [slug, keywords] of Object.entries(TEXTURE_KEYWORDS) as [ShopTextureSlug, string[]][]) {
    if (keywords.some((kw) => query.includes(kw))) matched.add(slug);
  }

  for (const label of Object.values(BCF_TEXTURE_LABELS)) {
    if (query.includes(label.toLowerCase())) {
      const slug = Object.entries(BCF_TEXTURE_LABELS).find(([, v]) => v === label)?.[0] as
        | ShopTextureSlug
        | undefined;
      if (slug) matched.add(slug);
    }
  }

  return [...matched];
}

function queryMatchesOnlyBawOptions(rawQuery: string): boolean {
  const query = normalizeText(rawQuery);
  if (!query) return false;

  const unitNameHit = ALL_UNIT_IDS.some(
    (id) => query.includes(id) || query.includes(UNIT_DISPLAY_NAMES[id].toLowerCase())
  );
  if (unitNameHit) return false;

  const bcfHit = matchBcfCategories(query).length > 0;
  if (bcfHit) return false;

  const bawSignals = [
    ...COLOR_OPTIONS_DEFAULT,
    ...COLOR_OPTIONS_BLANCO,
    ...BAW_SALON_STYLING_IDS,
    ...LENGTH_OPTIONS,
    ...DENSITY_OPTIONS,
    ...LACE_OPTIONS,
    ...HAIRLINE_OPTIONS,
    ...TEXTURE_OPTIONS,
    ...ADDON_OPTIONS,
    ...CAP_SIZE_OPTIONS,
    ...PART_OPTIONS,
  ];

  return bawSignals.some((signal) => {
    const terms = [
      normalizeText(signal),
      compactText(signal),
      ...expandColorSearchTerms(signal),
      ...expandStylingSearchTerms(signal),
      ...expandHairlineSearchTerms(signal),
    ];
    return terms.some((term) => term && (query.includes(term) || term.includes(query)));
  });
}

/** Ranked unit list for `/home/shop?q=` — products + BAW-aware option matching. */
export function filterShopUnitsBySearch<T extends ShopUnitSearchRecord>(
  units: T[],
  rawQuery: string
): T[] {
  const query = normalizeText(rawQuery);
  if (!query) return units;

  const scored = units
    .map((unit) => {
      const unitId = unit.id as UnitId;
      if (!ALL_UNIT_IDS.includes(unitId)) {
        const blob = normalizeText(
          `${unit.id} ${unit.name} ${unit.length ?? ''} ${unit.hairOrigin ?? ''} ${unit.route ?? ''}`
        );
        return blob.includes(query) ? { unit, score: 40 } : null;
      }
      const score = scoreUnitMatch(unitId, rawQuery);
      return score > 0 ? { unit, score } : null;
    })
    .filter((row): row is { unit: T; score: number } => row !== null)
    .sort((a, b) => b.score - a.score);

  return scored.map((row) => row.unit);
}

/** Full search scope for home shop: units strip + BCF category visibility. */
export function resolveShopSearchScope<T extends ShopUnitSearchRecord>(
  units: T[],
  rawQuery: string
): ShopSearchScope<T> {
  const query = normalizeText(rawQuery);
  if (!query) {
    return {
      units,
      bcfCategories: ['bundles', 'closures', 'frontals'],
      bcfTextures: ['straight', 'wavy', 'curly'],
      matchedBawOptions: false,
    };
  }

  const filteredUnits = filterShopUnitsBySearch(units, rawQuery);
  const bcfCategories = matchBcfCategories(rawQuery);
  let bcfTextures = matchBcfTextures(rawQuery);

  const bcfRelevant = bcfCategories.length > 0;
  const hideBcf =
    filteredUnits.length > 0 && queryMatchesOnlyBawOptions(rawQuery) && !bcfRelevant;
  const categories = hideBcf ? ([] as BcfCategorySlug[]) : bcfCategories;

  if (categories.length > 0 && bcfTextures.length === 0) {
    bcfTextures = ['straight', 'wavy', 'curly'];
  }

  return {
    units: filteredUnits,
    bcfCategories: categories,
    bcfTextures,
    matchedBawOptions: queryMatchesOnlyBawOptions(rawQuery) || filteredUnits.length > 0,
  };
}

/** Human-readable labels for admin / debug. */
export const SHOP_SEARCH_BAW_CATEGORIES = [
  'color',
  'styling',
  'length',
  'density',
  'lace',
  'hairline',
  'texture',
  'cap size',
  'add-ons',
  'parting',
] as const;
