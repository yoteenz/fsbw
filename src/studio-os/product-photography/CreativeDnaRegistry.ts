/**
 * Creative DNA v1.0 — permanent source of truth for Frontal Slayer product photography.
 */

import {
  CREATIVE_DNA_APPROVED_PROMPT_BODY,
  CREATIVE_DNA_APPROVED_PROMPT_NAME,
  CREATIVE_DNA_APPROVED_PROMPT_VERSION,
} from './CreativeDnaApprovedPrompt';
import { CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT } from './CreativeDnaEditorialPrompt';
import {
  OFFICIAL_DISPLAY_BUST_CANONICAL_FRONT,
  OFFICIAL_DISPLAY_BUST_LABEL,
  OFFICIAL_DISPLAY_BUST_PRESERVE,
  OFFICIAL_DISPLAY_BUST_TEXTURE_FAMILIES,
  OFFICIAL_DISPLAY_BUST_VERSION,
  resolveDisplayBustFrontForUnitSlug,
} from './CreativeDnaDisplayBust';
import { CREATIVE_DNA_VERSION_1_0 } from './CreativeDnaVersionManager';
import { SIGNATURE_COLLECTION_UNITS } from './SignatureCollectionRegistry';

export const CREATIVE_DNA_VERSION = '1.0' as const;

export type CreativeDnaLockStatus = 'approved' | 'locked';

export type CreativeDnaLockedSpecification = {
  id: string;
  rule: string;
  locked: true;
};

/** Locked Creative DNA rules — Milestone 22.5 canonical list. */
export const CREATIVE_DNA_LOCKED_SPECIFICATIONS: readonly CreativeDnaLockedSpecification[] = [
  { id: 'aspect-ratio', rule: '1:1 square composition', locked: true },
  { id: 'background', rule: 'pure white seamless studio background', locked: true },
  { id: 'mannequin', rule: 'official Frontal Slayer mannequin', locked: true },
  { id: 'logo', rule: 'chest logo preserved', locked: true },
  { id: 'camera-facing', rule: 'front-facing camera', locked: true },
  { id: 'camera-angle', rule: 'eye-level angle', locked: true },
  { id: 'composition', rule: 'centered composition', locked: true },
  { id: 'white-space', rule: '15–18% white space on left/right/top', locked: true },
  { id: 'hair-continuity', rule: 'hair continues beyond bottom edge', locked: true },
  { id: 'hair-ends', rule: 'hair ends should not show', locked: true },
  { id: 'lighting-style', rule: 'luxury editorial lighting', locked: true },
  { id: 'key-light', rule: 'soft diffused key light', locked: true },
  { id: 'fill-light', rule: 'soft fill light', locked: true },
  { id: 'rim-light', rule: 'subtle rim lighting', locked: true },
  { id: 'no-warm-cast', rule: 'no orange/yellow lighting', locked: true },
  { id: 'no-props', rule: 'no props', locked: true },
  { id: 'no-acrylic', rule: 'no acrylic', locked: true },
  { id: 'no-text', rule: 'no text', locked: true },
  { id: 'no-decor', rule: 'no diamonds/roses', locked: true },
  { id: 'no-graphics', rule: 'no decorative graphics', locked: true },
] as const;

export type CreativeDnaBenchmarkOutput = {
  unit: string;
  unitSlug: string;
  collectionNumber: string;
  texture: string;
  length: string;
  density: string;
  lace: string;
  aspectRatio: string;
  resolution: string;
  background: string;
  heroPortraitSrc: string;
  status: CreativeDnaLockStatus;
};

/** Approved SOFT WAVE Master Hero Portrait — Creative DNA benchmark output. */
export const CREATIVE_DNA_BENCHMARK_OUTPUT: CreativeDnaBenchmarkOutput = {
  unit: 'SOFT WAVE',
  unitSlug: 'soft-wave',
  collectionNumber: '003',
  texture: 'Raw Indian',
  length: '24"',
  density: '200%',
  lace: '13×6 Ultra Thin HD Film Lace',
  aspectRatio: '1:1',
  resolution: '4096×4096',
  background: 'Pure white seamless studio',
  heroPortraitSrc: '/assets/2D WAVY FRONT.png',
  status: 'approved',
};

export type CreativeDnaFutureUnitSlot = {
  collectionNo: string;
  slug: string;
  label: string;
  status: 'prepared' | 'benchmark' | 'pending';
  inheritsFrom: string;
};

/** Architecture prepared for units 001–006 — no generation in Milestone 22.5. */
export const CREATIVE_DNA_FUTURE_UNIT_SLOTS: readonly CreativeDnaFutureUnitSlot[] =
  SIGNATURE_COLLECTION_UNITS.map((u) => ({
    collectionNo: u.collectionNo,
    slug: u.slug,
    label: u.label,
    status: u.slug === 'soft-wave' ? ('benchmark' as const) : ('prepared' as const),
    inheritsFrom: `Creative DNA v${CREATIVE_DNA_VERSION}`,
  }));

export type CreativeDnaApprovedPromptRecord = {
  name: typeof CREATIVE_DNA_APPROVED_PROMPT_NAME;
  promptVersion: typeof CREATIVE_DNA_APPROVED_PROMPT_VERSION;
  creativeDnaVersion: typeof CREATIVE_DNA_VERSION;
  status: CreativeDnaLockStatus;
  body: typeof CREATIVE_DNA_APPROVED_PROMPT_BODY;
};

export type CreativeDnaRecord = {
  version: typeof CREATIVE_DNA_VERSION;
  label: string;
  lockStatus: CreativeDnaLockStatus;
  effectiveDate: string;
  approvedPrompt: CreativeDnaApprovedPromptRecord;
  editorialReferencePrompt: string;
  displayBust: {
    version: typeof OFFICIAL_DISPLAY_BUST_VERSION;
    label: typeof OFFICIAL_DISPLAY_BUST_LABEL;
    canonicalFrontSrc: typeof OFFICIAL_DISPLAY_BUST_CANONICAL_FRONT;
    textureFamilies: typeof OFFICIAL_DISPLAY_BUST_TEXTURE_FAMILIES;
    preserve: readonly string[];
  };
  benchmarkOutput: CreativeDnaBenchmarkOutput;
  lockedSpecifications: readonly CreativeDnaLockedSpecification[];
  futureUnitSlots: readonly CreativeDnaFutureUnitSlot[];
  /** Fields that change per unit during generation — everything else inherits Creative DNA. */
  perUnitVariableFields: readonly string[];
};

/** Immutable Creative DNA v1.0 record. */
export const CREATIVE_DNA_V1_0: CreativeDnaRecord = {
  version: CREATIVE_DNA_VERSION,
  label: CREATIVE_DNA_VERSION_1_0.label,
  lockStatus: 'locked',
  effectiveDate: CREATIVE_DNA_VERSION_1_0.effectiveDate,
  approvedPrompt: {
    name: CREATIVE_DNA_APPROVED_PROMPT_NAME,
    promptVersion: CREATIVE_DNA_APPROVED_PROMPT_VERSION,
    creativeDnaVersion: CREATIVE_DNA_VERSION,
    status: 'approved',
    body: CREATIVE_DNA_APPROVED_PROMPT_BODY,
  },
  editorialReferencePrompt: CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT,
  displayBust: {
    version: OFFICIAL_DISPLAY_BUST_VERSION,
    label: OFFICIAL_DISPLAY_BUST_LABEL,
    canonicalFrontSrc: OFFICIAL_DISPLAY_BUST_CANONICAL_FRONT,
    textureFamilies: OFFICIAL_DISPLAY_BUST_TEXTURE_FAMILIES,
    preserve: OFFICIAL_DISPLAY_BUST_PRESERVE,
  },
  benchmarkOutput: CREATIVE_DNA_BENCHMARK_OUTPUT,
  lockedSpecifications: CREATIVE_DNA_LOCKED_SPECIFICATIONS,
  futureUnitSlots: CREATIVE_DNA_FUTURE_UNIT_SLOTS,
  perUnitVariableFields: ['unitName', 'collectionNumber', 'texture', 'productReferenceImage'],
};

export function getCreativeDna(version: string = CREATIVE_DNA_VERSION): CreativeDnaRecord {
  if (version !== '1.0') {
    throw new Error(`Creative DNA ${version} is not registered. Only v1.0 is active.`);
  }
  return CREATIVE_DNA_V1_0;
}

export function resolveCreativeDnaMasterHeroSrc(unitSlug: string): string {
  if (unitSlug === CREATIVE_DNA_BENCHMARK_OUTPUT.unitSlug) {
    return CREATIVE_DNA_BENCHMARK_OUTPUT.heroPortraitSrc;
  }
  return resolveDisplayBustFrontForUnitSlug(unitSlug);
}
