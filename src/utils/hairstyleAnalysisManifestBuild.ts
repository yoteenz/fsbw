import { hexForHairColor } from '../data/hairstyleCatalog';
import type { AnalysisLook, AnalysisTier, HairstyleAnalysis } from '../types/hairstyleAnalysis';
import { resolveCatalogLook } from './hairstyleAnalysisCatalogResolve';
import {
  buildEveryDetailMattersFromTopMatch,
  everyDetailVariationSeed,
  KATEENA_DEMO_FACE_FEATURES,
} from './hairstyleAnalysisEveryDetailMatters';
import {
  formatEdmPanelBuildSummary,
} from './hairstyleAnalysisFormat';
import type { ManifestLookDraft } from './hairstyleAnalysisManifestOptions';
import { normalizeManifestDraft } from './hairstyleAnalysisManifestOptions';
import { additionalLooksLimit, resolveTemplateUrl } from './hairstyleAnalysisRules';

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
  const top = resolveCatalogLook(draftToLook(topMatch, 1), 0);
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
  const top = resolveCatalogLook(
    draftToLook(input.topMatch, 1, input.clientPreviewUrl),
    0
  );
  const additionalLooks = input.additionalLooks.slice(0, limit).map((draft, i) =>
    resolveCatalogLook(draftToLook(draft, i + 2), i + 1)
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
