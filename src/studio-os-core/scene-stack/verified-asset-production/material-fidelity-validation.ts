import type { MaterialFidelityEvidence, MaterialFidelityVerdict } from '../../creative-production/brand-asset-grounding/contract';
import type { BrandMaterialPackage } from '../../creative-production/brand-asset-grounding';

export type MaterialFidelityInput = {
  brandMaterialPackage?: BrandMaterialPackage | null;
  organizationId: string;
  /** Heuristic signals from image analysis or test fixtures */
  genericMarbleSuspect?: boolean;
  wrongMarbleSuspect?: boolean;
  brandMarbleExpected?: boolean;
  colorTokenDeviation?: number;
  materialMatchConfidence?: number;
};

const PASS_VERDICTS: MaterialFidelityVerdict[] = [
  'exact-brand-material-pass',
  'acceptable-brand-material-interpretation',
];

export function validateMaterialFidelity(input: MaterialFidelityInput): {
  pass: boolean;
  verdict: MaterialFidelityVerdict;
  evidence: MaterialFidelityEvidence;
} {
  const pkg = input.brandMaterialPackage;
  const requiredMarble = pkg?.materialSlots.some(
    (s) => s.required && s.appliedToMaterialSlot && s.resolvedBrandAssetId?.includes('marble')
  ) ?? false;

  const requiredBrandAssetIds =
    pkg?.materialSlots
      .filter((s) => s.required && s.resolvedBrandAssetId)
      .map((s) => s.resolvedBrandAssetId!) ?? [];

  const materialSlots: Record<string, string> = pkg?.materialMappings ?? {};

  let verdict: MaterialFidelityVerdict = 'exact-brand-material-pass';
  let genericSubstitutionLikelihood = 0.1;
  let wrongMarbleLikelihood = 0.05;
  const confidence = input.materialMatchConfidence ?? 0.88;

  if (!pkg && input.brandMarbleExpected) {
    verdict = 'missing-required-material';
  } else if (input.wrongMarbleSuspect) {
    verdict = 'wrong-brand-material';
    wrongMarbleLikelihood = 0.92;
  } else if (input.genericMarbleSuspect && requiredMarble) {
    verdict = 'generic-material-substitution';
    genericSubstitutionLikelihood = 0.9;
  } else if ((input.colorTokenDeviation ?? 0) > 0.35) {
    verdict = 'low-confidence-material-match';
  } else if (confidence < 0.55) {
    verdict = 'low-confidence-material-match';
  } else if (confidence < 0.75) {
    verdict = 'acceptable-brand-material-interpretation';
  }

  const evidence: MaterialFidelityEvidence = {
    requiredBrandAssetIds,
    materialSlots,
    suppliedReferenceChecksums: pkg?.referenceChecksums ?? [],
    referenceDeliveryConfirmed: (pkg?.referenceUrls.length ?? 0) > 0 || !requiredMarble,
    expectedMaterialSignature: requiredMarble ? 'primary-marble-texture:frontal-slayer' : 'finish-policy-only',
    observedMaterialClassification: input.genericMarbleSuspect
      ? 'generic-white-marble'
      : input.wrongMarbleSuspect
        ? 'wrong-marble-vein-pattern'
        : 'brand-aligned',
    materialMatchConfidence: confidence,
    genericSubstitutionLikelihood,
    wrongMarbleLikelihood,
    colorTokenDeviation: input.colorTokenDeviation ?? 0,
    finalMaterialVerdict: verdict,
  };

  return {
    pass: PASS_VERDICTS.includes(verdict),
    verdict,
    evidence,
  };
}

export function materialFidelityBlocksApproval(verdict: MaterialFidelityVerdict): boolean {
  return !PASS_VERDICTS.includes(verdict);
}
