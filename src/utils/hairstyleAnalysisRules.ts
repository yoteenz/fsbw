import {
  allowedColorsForUnit,
  HAIRSTYLE_ANALYSIS_TEMPLATE_URLS,
  hexForHairColor,
  UNIT_NAMES,
} from '../data/hairstyleCatalog';
import { normalizeAnalysisStylingId } from './hairstyleAnalysisFormat';
import { resolveCatalogLook } from './hairstyleAnalysisCatalogResolve';
import { diversifyHairstyleAnalysisLooks } from './hairstyleAnalysisLookDiversity';
import { buildEveryDetailMattersFromTopMatch } from './hairstyleAnalysisEveryDetailMatters';
import type { PsaSelfieStylePick } from '../types/styleAnalysis';
import type {
  AnalysisLook,
  AnalysisTier,
  EveryDetailFaceFeatures,
  HairstyleAnalysis,
  UnitName,
} from '../types/hairstyleAnalysis';

export const ADDITIONAL_LOOKS_BY_TIER: Record<AnalysisTier, number> = {
  free: 0,
  three_month: 3,
  six_month: 3,
  twelve_month: 3,
  black: 3,
};

export function normalizeAnalysisTier(tier: AnalysisTier): Exclude<AnalysisTier, 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

export function resolveTemplateUrl(tier: AnalysisTier): string {
  return HAIRSTYLE_ANALYSIS_TEMPLATE_URLS[normalizeAnalysisTier(tier)];
}

export function additionalLooksLimit(tier: AnalysisTier): number {
  return ADDITIONAL_LOOKS_BY_TIER[tier];
}

export function totalLooksForTier(tier: AnalysisTier): number {
  return 1 + additionalLooksLimit(tier);
}

export type HairstyleAnalysisValidationIssue = {
  field: string;
  message: string;
};

export function isUnitName(value: string): value is UnitName {
  return UNIT_NAMES.includes(value.trim().toUpperCase() as UnitName);
}

export function validateAnalysisLook(look: AnalysisLook): HairstyleAnalysisValidationIssue[] {
  const issues: HairstyleAnalysisValidationIssue[] = [];
  const unit = look.unit.trim().toUpperCase() as UnitName;

  if (!isUnitName(unit)) {
    issues.push({ field: 'unit', message: `Unknown unit: ${look.unit}` });
    return issues;
  }

  const color = look.color.trim().toUpperCase();
  const allowed = allowedColorsForUnit(unit);
  if (!allowed.includes(color as (typeof allowed)[number])) {
    issues.push({
      field: 'color',
      message: `${color} is not allowed for ${unit}`,
    });
  }

  if (look.score < 0 || look.score > 100) {
    issues.push({ field: 'score', message: 'Score must be 0–100' });
  }

  if (look.rating < 0 || look.rating > 5) {
    issues.push({ field: 'rating', message: 'Rating must be 0–5' });
  }

  return issues;
}

export function validateHairstyleAnalysis(
  analysis: HairstyleAnalysis
): HairstyleAnalysisValidationIssue[] {
  const issues: HairstyleAnalysisValidationIssue[] = [];
  const limit = additionalLooksLimit(analysis.tier);

  issues.push(...validateAnalysisLook(analysis.topMatch));

  if (analysis.additionalLooks.length !== limit) {
    issues.push({
      field: 'additionalLooks',
      message: `Expected ${limit} additional looks for tier ${analysis.tier}, got ${analysis.additionalLooks.length}`,
    });
  }

  analysis.additionalLooks.forEach((look, index) => {
    validateAnalysisLook(look).forEach((issue) => {
      issues.push({ field: `additionalLooks[${index}].${issue.field}`, message: issue.message });
    });
  });

  const tierNorm = normalizeAnalysisTier(analysis.tier);
  const expectedWhy = tierNorm === 'free' ? 5 : 0;
  if (expectedWhy > 0 && analysis.whyItWorks.length !== expectedWhy) {
    issues.push({
      field: 'whyItWorks',
      message: `Expected ${expectedWhy} why lines for tier ${analysis.tier}, got ${analysis.whyItWorks.length}`,
    });
  }

  const expectedTemplate = resolveTemplateUrl(analysis.tier);
  if (analysis.templateUrl !== expectedTemplate) {
    issues.push({
      field: 'templateUrl',
      message: 'Template URL does not match tier',
    });
  }

  return issues;
}

export function psaPickToAnalysisLook(pick: PsaSelfieStylePick): AnalysisLook {
  const unit = pick.unitLabel.trim().toUpperCase() as UnitName;
  const color = pick.color.trim().toUpperCase();
  const unitName = isUnitName(unit) ? unit : 'NOIR';
  const styling = normalizeAnalysisStylingId(unitName, pick.styling || 'NONE');

  return resolveCatalogLook({
    id: `psa-pick-${pick.rank}`,
    rank: pick.rank,
    unit: unitName,
    color,
    hex: hexForHairColor(color),
    length: pick.length.includes('INCH') ? pick.length.toUpperCase() : `${pick.length.toUpperCase()} INCHES`,
    lace: '13X6 HD',
    density: pick.density.includes('%') ? pick.density.toUpperCase() : `${pick.density.toUpperCase()}%`,
    hairline: pick.hairline.includes('HAIRLINE')
      ? pick.hairline.toUpperCase()
      : `${pick.hairline.toUpperCase()} HAIRLINE`,
    part: pick.partSelection.replace(/\s*PART\s*$/i, '').trim().toUpperCase(),
    styling,
    score: Math.max(70, 100 - (pick.rank - 1) * 3),
    rating: pick.stars ?? Math.max(3, 5 - Math.floor((pick.rank - 1) / 2)),
  }, pick.rank - 1);
}

export function buildHairstyleAnalysisFromPsaPicks(options: {
  id: string;
  clientName: string;
  tier: AnalysisTier;
  clientPreviewUrl: string;
  picks: PsaSelfieStylePick[];
  whyItWorks?: string[];
  everyDetailFaceFeatures?: EveryDetailFaceFeatures;
}): HairstyleAnalysis {
  const limit = additionalLooksLimit(options.tier);
  const sorted = [...options.picks].sort((a, b) => a.rank - b.rank);
  const looks = sorted.map(psaPickToAnalysisLook);
  const [rawTop, ...rawRest] = looks;
  const { topMatch, additionalLooks } = diversifyHairstyleAnalysisLooks(
    rawTop,
    rawRest.slice(0, limit)
  );

  const resolvedTop = resolveCatalogLook(topMatch, 0);
  const resolvedAlts = additionalLooks.map((look, i) => resolveCatalogLook(look, i + 1));

  return {
    id: options.id,
    clientName: options.clientName,
    tier: options.tier,
    templateUrl: resolveTemplateUrl(options.tier),
    clientPreviewUrl: options.clientPreviewUrl,
    topMatch: resolvedTop,
    additionalLooks: resolvedAlts,
    everyDetailFaceFeatures: options.everyDetailFaceFeatures,
    whyItWorks:
      options.whyItWorks ??
      (normalizeAnalysisTier(options.tier) === 'free'
        ? buildEveryDetailMattersFromTopMatch(
            resolvedTop,
            options.everyDetailFaceFeatures
          )
        : []),
    createdAt: new Date().toISOString(),
  };
}
