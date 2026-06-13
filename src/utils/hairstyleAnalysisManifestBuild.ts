import { hexForHairColor } from '../data/hairstyleCatalog';
import type { AnalysisLook, AnalysisTier, HairstyleAnalysis, UnitName } from '../types/hairstyleAnalysis';
import {
  buildEveryDetailMattersFromTopMatch,
  everyDetailVariationSeed,
  KATEENA_DEMO_FACE_FEATURES,
} from './hairstyleAnalysisEveryDetailMatters';
import {
  formatEdmPanelBuildSummary,
} from './hairstyleAnalysisFormat';
import type { ManifestLookDraft } from './hairstyleAnalysisManifestOptions';
import {
  normalizeDensityValue,
  normalizeHairlineValue,
  normalizeManifestDraft,
  normalizePartValue,
} from './hairstyleAnalysisManifestOptions';
import { additionalLooksLimit, resolveTemplateUrl } from './hairstyleAnalysisRules';

/** Preserve exact manifest picks — do not strip bangs combos or non-catalog salon ids. */
function resolveManifestLook(look: AnalysisLook): AnalysisLook {
  const unit = look.unit.trim().toUpperCase() as UnitName;
  return {
    ...look,
    unit,
    color: look.color.trim().toUpperCase(),
    length: look.length.trim().toUpperCase().includes('INCH')
      ? look.length.trim().toUpperCase()
      : `${look.length.trim().toUpperCase()} INCHES`,
    lace: look.lace.trim().toUpperCase().replace(/\s*HD\s*$/i, '').replace(/\s*LACE\s*$/i, '').trim(),
    density: normalizeDensityValue(look.density),
    hairline: normalizeHairlineValue(look.hairline),
    part: normalizePartValue(look.part),
    styling: look.styling.trim().toUpperCase(),
    hex: look.hex || hexForHairColor(look.color),
  };
}

function draftToLook(draft: ManifestLookDraft, rank: number, imageUrl?: string): AnalysisLook {
  const normalized = normalizeManifestDraft(draft);
  return {
    id: `manifest-look-${String(rank).padStart(2, '0')}`,
    rank,
    unit: normalized.unit,
    color: normalized.color,
    hex: hexForHairColor(normalized.color),
    length: normalized.length,
    lace: normalized.lace,
    density: normalized.density,
    hairline: normalized.hairline,
    part: normalized.part,
    styling: normalized.styling,
    score: rank === 1 ? 98 : Math.max(88, 98 - (rank - 1) * 2),
    rating: rank === 1 ? 5 : 4.5,
    imageUrl,
  };
}

export function lookToManifestDraft(look: AnalysisLook): ManifestLookDraft {
  return normalizeManifestDraft({
    unit: look.unit,
    color: look.color,
    length: look.length,
    lace: look.lace,
    density: look.density,
    part: look.part.replace(/\s*PART\s*$/i, '').trim().toUpperCase() || 'MIDDLE',
    hairline: look.hairline.replace(/\s*HAIRLINE\s*$/i, '').trim().toUpperCase() || 'NATURAL',
    styling: look.styling,
  });
}

/** One-line preview of every-detail-matters rows for the current top-match manifest. */
export function previewEveryDetailLines(
  topMatch: ManifestLookDraft,
  faceFeatures = KATEENA_DEMO_FACE_FEATURES
): string[] {
  const top = resolveManifestLook(draftToLook(topMatch, 1));
  return buildEveryDetailMattersFromTopMatch(top, faceFeatures, 5, 0);
}

export function formatManifestSummaryRibbon(draft: ManifestLookDraft): string {
  const n = normalizeManifestDraft(draft);
  return formatEdmPanelBuildSummary(draftToLook(n, 1));
}

export type BuildAnalysisFromManifestInput = {
  tier: AnalysisTier;
  clientPreviewUrl: string;
  clientName?: string;
  topMatch: ManifestLookDraft;
  additionalLooks: ManifestLookDraft[];
  everyDetailFaceFeatures?: HairstyleAnalysis['everyDetailFaceFeatures'];
};

/** Build a validated analysis payload from manual manifest picks (no diversity shuffle). */
export function buildAnalysisFromManifest(input: BuildAnalysisFromManifestInput): HairstyleAnalysis {
  const limit = additionalLooksLimit(input.tier);
  const top = resolveManifestLook(
    draftToLook(input.topMatch, 1, input.clientPreviewUrl)
  );
  const additionalLooks = input.additionalLooks.slice(0, limit).map((draft, i) =>
    resolveManifestLook(draftToLook(draft, i + 2))
  );
  const faceFeatures = input.everyDetailFaceFeatures ?? KATEENA_DEMO_FACE_FEATURES;
  const whyItWorks = buildEveryDetailMattersFromTopMatch(
    top,
    faceFeatures,
    5,
    everyDetailVariationSeed()
  );

  return {
    id: `manifest-test-${input.tier}`,
    clientName: input.clientName?.trim() || 'KATEENA ARMSTRONG',
    tier: input.tier,
    templateUrl: resolveTemplateUrl(input.tier),
    clientPreviewUrl: input.clientPreviewUrl,
    topMatch: top,
    additionalLooks,
    everyDetailFaceFeatures: faceFeatures,
    whyItWorks,
    createdAt: new Date().toISOString(),
  };
}
