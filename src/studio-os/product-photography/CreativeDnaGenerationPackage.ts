/**
 * Creative DNA generation package builder — auto-assembles production inputs per unit.
 * Future product generation should NOT require manual prompt copy/paste or mannequin re-upload.
 */

import { CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT } from './CreativeDnaEditorialPrompt';
import {
  CREATIVE_DNA_BENCHMARK_OUTPUT,
  CREATIVE_DNA_V1_0,
  getCreativeDna,
  type CreativeDnaRecord,
} from './CreativeDnaRegistry';
import { resolveDisplayBustFrontForUnitSlug } from './CreativeDnaDisplayBust';
import { getSignatureUnitBySlug } from './SignatureCollectionRegistry';

export type CreativeDnaGenerationUnitInput = {
  unitName: string;
  collectionNumber: string;
  texture: string;
  productReferenceImageSrc: string;
  unitSlug?: string;
  length?: string;
  density?: string;
  lace?: string;
};

export type CreativeDnaGenerationPackage = {
  creativeDnaVersion: string;
  creativeDnaLabel: string;
  lockStatus: string;
  approvedPromptName: string;
  approvedPromptVersion: string;
  approvedPromptBody: string;
  editorialReferencePrompt: string;
  displayBustVersion: string;
  displayBustLabel: string;
  displayBustFrontSrc: string;
  productReferenceImageSrc: string;
  unitMetadata: {
    unitName: string;
    collectionNumber: string;
    texture: string;
    length?: string;
    density?: string;
    lace?: string;
  };
  lockedSpecifications: readonly { id: string; rule: string }[];
  benchmarkReference?: typeof CREATIVE_DNA_BENCHMARK_OUTPUT;
  assembledAt: string;
};

function resolveUnitInput(input: CreativeDnaGenerationUnitInput): CreativeDnaGenerationUnitInput {
  if (input.unitSlug) {
    const unit = getSignatureUnitBySlug(input.unitSlug);
    if (unit) {
      return {
        unitName: input.unitName || unit.label,
        collectionNumber: input.collectionNumber || unit.collectionNo,
        texture: input.texture,
        productReferenceImageSrc: input.productReferenceImageSrc || unit.referenceImageSrc,
        unitSlug: input.unitSlug,
        length: input.length,
        density: input.density,
        lace: input.lace,
      };
    }
  }
  return input;
}

/** Build a complete generation package from Creative DNA + per-unit variables only. */
export function buildCreativeDnaGenerationPackage(
  input: CreativeDnaGenerationUnitInput,
  dna: CreativeDnaRecord = getCreativeDna()
): CreativeDnaGenerationPackage {
  const resolved = resolveUnitInput(input);
  const slug = resolved.unitSlug ?? resolved.unitName.toLowerCase().replace(/\s+/g, '-');
  const displayBustFront = resolveDisplayBustFrontForUnitSlug(slug);

  return {
    creativeDnaVersion: dna.version,
    creativeDnaLabel: dna.label,
    lockStatus: dna.lockStatus,
    approvedPromptName: dna.approvedPrompt.name,
    approvedPromptVersion: dna.approvedPrompt.promptVersion,
    approvedPromptBody: dna.approvedPrompt.body,
    editorialReferencePrompt: CREATIVE_DNA_EDITORIAL_REFERENCE_PROMPT,
    displayBustVersion: dna.displayBust.version,
    displayBustLabel: dna.displayBust.label,
    displayBustFrontSrc: displayBustFront,
    productReferenceImageSrc: resolved.productReferenceImageSrc,
    unitMetadata: {
      unitName: resolved.unitName,
      collectionNumber: resolved.collectionNumber,
      texture: resolved.texture,
      length: resolved.length,
      density: resolved.density,
      lace: resolved.lace,
    },
    lockedSpecifications: dna.lockedSpecifications.map(({ id, rule }) => ({ id, rule })),
    benchmarkReference:
      slug === CREATIVE_DNA_BENCHMARK_OUTPUT.unitSlug ? CREATIVE_DNA_BENCHMARK_OUTPUT : undefined,
    assembledAt: new Date().toISOString(),
  };
}

/** Asset Factory must read Creative DNA before processing — returns immutable rules snapshot. */
export function resolveCreativeDnaForAssetFactory(unitSlug: string = CREATIVE_DNA_BENCHMARK_OUTPUT.unitSlug) {
  const dna = CREATIVE_DNA_V1_0;
  const pkg = buildCreativeDnaGenerationPackage({
    unitSlug,
    unitName: getSignatureUnitBySlug(unitSlug)?.label ?? unitSlug,
    collectionNumber: getSignatureUnitBySlug(unitSlug)?.collectionNo ?? '',
    texture: unitSlug === 'soft-wave' ? CREATIVE_DNA_BENCHMARK_OUTPUT.texture : '',
    productReferenceImageSrc:
      getSignatureUnitBySlug(unitSlug)?.referenceImageSrc ??
      resolveDisplayBustFrontForUnitSlug(unitSlug),
  });

  return {
    dna,
    package: pkg,
    masterHeroSrc: unitSlug === dna.benchmarkOutput.unitSlug ? dna.benchmarkOutput.heroPortraitSrc : pkg.productReferenceImageSrc,
    mustNotInventRules: true as const,
  };
}
