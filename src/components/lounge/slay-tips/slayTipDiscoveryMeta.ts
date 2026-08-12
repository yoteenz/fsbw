import type { CSSProperties } from 'react';
import type { SlayTip } from '../../../content/education/types';
import { isPackSaved, togglePackSaved } from '../../../utils/loungeTvLibrary';
import { slayTipUnlockContentId } from './slayTipAccess';

export const SLAY_TIPS_DISCOVERY_TAGLINE =
  'QUICK KNOWLEDGE. BETTER TECHNIQUE. SMARTER SLAYS.';

export const SLAY_TIP_DISCOVERY_FILTERS = [
  'ALL',
  'LIKES',
  'CARE',
  'LACE',
  'COLOR',
  'INSTALL',
  'STYLING',
  'UPKEEP',
] as const;

export type SlayTipDiscoveryFilter = (typeof SLAY_TIP_DISCOVERY_FILTERS)[number];

/** Editorial pin archetypes — one column each; height rhythm only. */
export type SlayTipPinArchetype =
  | 'hero'
  | 'standard'
  | 'compact'
  | 'detail'
  | 'micro'
  | 'portrait'
  | 'stack'
  | 'duo';

/** @deprecated Use SlayTipPinArchetype */
export type SlayTipMasonrySize = 'short' | 'standard' | 'tall';

/**
 * 8-pin editorial band (6-track grid → 3 visual columns + 50/50 duo row):
 * Row 1–2: HERO (50%) | STACK + STACK (50%) — full board width
 * Row 3: PORTRAIT · PORTRAIT · PORTRAIT
 * Row 4: DUO · DUO (symmetrical half-board panels)
 */
const PIN_ARCHETYPE_PATTERN: SlayTipPinArchetype[] = [
  'hero',
  'stack',
  'stack',
  'portrait',
  'portrait',
  'portrait',
  'duo',
  'duo',
];

/** Pins per repeating editorial band (3 visual rows + duo row). */
export const SLAY_TIPS_EDITORIAL_BAND_SIZE = PIN_ARCHETYPE_PATTERN.length;

const PIN_IMAGE_CROPS: Record<SlayTipPinArchetype, readonly string[]> = {
  hero: ['50% 12%', '42% 18%', '58% 14%'],
  standard: ['50% 36%', '62% 30%', '38% 42%'],
  compact: ['68% 38%', '32% 50%', '50% 58%'],
  detail: ['50% 8%', '35% 22%', '65% 18%'],
  micro: ['55% 45%', '40% 32%', '60% 60%'],
  portrait: ['50% 32%', '62% 28%', '38% 38%'],
  stack: ['50% 22%', '62% 26%', '40% 34%'],
  duo: ['50% 38%', '42% 34%', '58% 40%'],
};

/** Intentional object-position per tip — avoids duplicated mannequin reads. */
const PIN_TIP_IMAGE_CROPS: Record<string, string> = {
  'slay-tip-dev-wet-hairline-plucking': '50% 9%',
  'slay-tip-dev-density-dont-overpluck': '50% 18%',
  'slay-tip-dev-density-melt-check': '44% 15%',
  'slay-tip-dev-density-lace-not-dirty': '62% 46%',
  'slay-tip-dev-density-low-heat': '72% 56%',
  'slay-tip-dev-density-brush-ends': '36% 40%',
  'slay-tip-dev-density-night-routine': '54% 66%',
  'slay-tip-dev-density-keep-fresh': '38% 62%',
  'slay-tip-dev-density-secure-sides': '58% 28%',
  'slay-tip-dev-density-tone-match': '46% 52%',
  'slay-tip-dev-density-part-line': '50% 24%',
  'slay-tip-dev-density-glue-cure': '42% 20%',
};

/** Subtle zoom per tip when sharing one thumbnail source. */
const PIN_TIP_IMAGE_SCALES: Record<string, number> = {
  'slay-tip-dev-wet-hairline-plucking': 1.14,
  'slay-tip-dev-density-dont-overpluck': 1.16,
  'slay-tip-dev-density-melt-check': 1.16,
  'slay-tip-dev-density-lace-not-dirty': 1.1,
  'slay-tip-dev-density-low-heat': 1.08,
  'slay-tip-dev-density-brush-ends': 1.12,
  'slay-tip-dev-density-night-routine': 1.1,
  'slay-tip-dev-density-keep-fresh': 1.09,
};

const PILLAR_FILTER_MAP: Record<string, Exclude<SlayTipDiscoveryFilter, 'ALL' | 'LIKES'>> = {
  lace: 'LACE',
  care: 'CARE',
  color: 'COLOR',
  installation: 'INSTALL',
  install: 'INSTALL',
  style: 'STYLING',
  styling: 'STYLING',
  'after-care': 'UPKEEP',
  'after care': 'UPKEEP',
  upkeep: 'UPKEEP',
};

export function slayTipSaveId(tip: SlayTip): string {
  return slayTipUnlockContentId(tip);
}

export function isSlayTipSaved(tip: SlayTip): boolean {
  return isPackSaved(slayTipSaveId(tip));
}

export function toggleSlayTipSaved(tip: SlayTip): boolean {
  return togglePackSaved(slayTipSaveId(tip));
}

export function slayTipCategoryLabel(tip: SlayTip): string {
  const key = String(tip.pillar).toLowerCase();
  return PILLAR_FILTER_MAP[key] ?? (String(tip.pillar).trim().toUpperCase() || 'SLAY TIP');
}

export function slayTipFilterCategory(tip: SlayTip): Exclude<SlayTipDiscoveryFilter, 'ALL' | 'LIKES'> | null {
  const key = String(tip.pillar).toLowerCase();
  return PILLAR_FILTER_MAP[key] ?? null;
}

export function slayTipMatchesDiscoveryFilter(
  tip: SlayTip,
  filter: SlayTipDiscoveryFilter,
  context?: { viewerHelpful?: boolean },
): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'LIKES') return Boolean(context?.viewerHelpful);
  return slayTipFilterCategory(tip) === filter;
}

export function slayTipPinArchetypeForIndex(index: number): SlayTipPinArchetype {
  return PIN_ARCHETYPE_PATTERN[index % PIN_ARCHETYPE_PATTERN.length];
}

/**
 * Explicit 6-track band placement (3 visual cols @ 2 tracks each; duo row 50/50).
 * Row 1–2: hero spans tracks 1–3 (50%) | stacks share tracks 4–6 (50%) — full board width.
 * Grid rows per band: 4 (hero+stacks ×2, portrait ×1, duo ×1).
 */
export function slayTipPinGridPlacement(index: number): CSSProperties {
  const pos = index % SLAY_TIPS_EDITORIAL_BAND_SIZE;
  const band = Math.floor(index / SLAY_TIPS_EDITORIAL_BAND_SIZE);
  const rowBase = band * 4 + 1;
  switch (pos) {
    case 0:
      return { gridColumn: '1 / span 3', gridRow: `${rowBase} / span 2` };
    case 1:
      return { gridColumn: '4 / span 3', gridRow: rowBase };
    case 2:
      return { gridColumn: '4 / span 3', gridRow: rowBase + 1 };
    case 3:
      return { gridColumn: '1 / span 2', gridRow: rowBase + 2 };
    case 4:
      return { gridColumn: '3 / span 2', gridRow: rowBase + 2 };
    case 5:
      return { gridColumn: '5 / span 2', gridRow: rowBase + 2 };
    case 6:
      return { gridColumn: '1 / span 3', gridRow: rowBase + 3 };
    case 7:
      return { gridColumn: '4 / span 3', gridRow: rowBase + 3 };
    default:
      return {};
  }
}

export function slayTipPinGridSpansTwoRows(index: number): boolean {
  return index % SLAY_TIPS_EDITORIAL_BAND_SIZE === 0;
}

/** Two-column portrait placement when a category/LIKES filter yields a partial board. */
export function slayTipFilteredGridPlacement(index: number): CSSProperties {
  const colStart = index % 2 === 0 ? 1 : 4;
  return { gridColumn: `${colStart} / span 3`, gridRow: 'auto' };
}

export function slayTipImageCropForPin(index: number, archetype: SlayTipPinArchetype): string {
  const crops = PIN_IMAGE_CROPS[archetype];
  return crops[index % crops.length];
}

export function slayTipImageCropForTip(
  tip: SlayTip,
  index: number,
  archetype: SlayTipPinArchetype,
): string {
  return PIN_TIP_IMAGE_CROPS[tip.id] ?? slayTipImageCropForPin(index, archetype);
}

export function slayTipImageScaleForTip(tip: SlayTip): number {
  return PIN_TIP_IMAGE_SCALES[tip.id] ?? 1.1;
}

/** @deprecated Use slayTipPinArchetypeForIndex */
export function slayTipMasonrySizeForIndex(index: number): SlayTipMasonrySize {
  const archetype = slayTipPinArchetypeForIndex(index);
  if (archetype === 'hero' || archetype === 'detail') return 'tall';
  if (archetype === 'compact' || archetype === 'micro') return 'short';
  return 'standard';
}

/** Single metadata line — category · duration */
export function slayTipPinMetaLine(tip: SlayTip): string {
  return `${slayTipCategoryLabel(tip)} · ${slayTipCompactReadDuration(tip)}`;
}

/** Compact read label — e.g. "1 MIN" without verbose suffix. */
export function slayTipCompactReadDuration(tip: SlayTip): string {
  if (tip.readTime?.trim()) {
    const normalized = tip.readTime.trim().toUpperCase();
    return normalized.replace(/\s*READ$/i, '').trim();
  }
  const pages = tip.pages ?? [];
  if (!pages.length) return '1 MIN';
  const wordCount = pages
    .flatMap((page) => [page.heading, page.body, page.callout])
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} MIN`;
}
