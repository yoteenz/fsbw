import type { AnalysisLook, AnalysisTier, HairstyleAnalysis } from '../types/hairstyleAnalysis';
import { resolveCatalogLook } from './hairstyleAnalysisCatalogResolve';
import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
  formatScorePercent,
} from './hairstyleAnalysisFormat';
import { normalizeAnalysisTier } from './hairstyleAnalysisRules';
import { buildEveryDetailMattersFromTopMatch } from './hairstyleAnalysisEveryDetailMatters';

function specValues(look: AnalysisLook): Record<string, string> {
  const resolved = resolveCatalogLook(look);
  return {
    specTexture: resolved.unit,
    specColor: resolved.color,
    specLength: displayLength(resolved),
    specLace: displayLace(resolved),
    specDensity: displayDensity(resolved),
    specParting: displayPart(resolved),
    specHairline: displayHairline(resolved),
    specStyle: displayStyle(resolved),
  };
}

function topMatchHeader(look: AnalysisLook): Record<string, string> {
  return specValues(look);
}

function matchRowValues(look: AnalysisLook): Record<string, string> {
  const resolved = resolveCatalogLook(look);
  return {
    texture: resolved.unit,
    color: resolved.color,
    length: displayLength(resolved),
    score: formatScorePercent(resolved.score),
  };
}

function applyMatchRow(out: Record<string, string>, prefix: string, look: AnalysisLook): void {
  const row = matchRowValues(look);
  out[`${prefix}-texture`] = row.texture;
  out[`${prefix}-color`] = row.color;
  out[`${prefix}-length`] = row.length;
  out[`${prefix}-score`] = row.score;
}

function freeOverlayValues(analysis: HairstyleAnalysis): Record<string, string> {
  const out: Record<string, string> = {
    ...topMatchHeader(analysis.topMatch),
    clientName: 'TOP MATCH',
    clientHeaderName: analysis.clientName.toUpperCase(),
  };
  const whyLines = buildEveryDetailMattersFromTopMatch(
    analysis.topMatch,
    analysis.everyDetailFaceFeatures
  );
  whyLines.forEach((line, i) => {
    out[`whyLine-${i}`] = line;
  });
  return out;
}

function threeMonthOverlayValues(analysis: HairstyleAnalysis): Record<string, string> {
  const out: Record<string, string> = {
    ...topMatchHeader(analysis.topMatch),
    clientName: 'TOP MATCH',
    clientHeaderName: analysis.clientName.toUpperCase(),
  };
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    applyMatchRow(out, `match${i + 2}`, look);
  });
  const whyLines = buildEveryDetailMattersFromTopMatch(
    analysis.topMatch,
    analysis.everyDetailFaceFeatures
  );
  whyLines.forEach((line, i) => {
    out[`whyLine-${i}`] = line;
  });
  return out;
}

const BUILDERS: Record<
  Exclude<AnalysisTier, 'black'>,
  (analysis: HairstyleAnalysis) => Record<string, string>
> = {
  free: freeOverlayValues,
  three_month: threeMonthOverlayValues,
  six_month: threeMonthOverlayValues,
  twelve_month: threeMonthOverlayValues,
};

export function buildTemplateOverlayValues(analysis: HairstyleAnalysis): Record<string, string> {
  const key = normalizeAnalysisTier(analysis.tier);
  return BUILDERS[key](analysis);
}

export function resolveOverlayImageUrl(
  fieldId: string,
  analysis: HairstyleAnalysis
): string | null {
  if (fieldId === 'clientImage') return analysis.clientPreviewUrl;

  const portfolioThumb = /^portfolio-(\d+)-thumb$/.exec(fieldId);
  if (portfolioThumb) {
    const idx = Number(portfolioThumb[1]);
    const portfolio = [analysis.topMatch, ...analysis.additionalLooks];
    return portfolio[idx]?.imageUrl ?? null;
  }

  const matchThumb = /^match(\d+)-thumb$/.exec(fieldId);
  if (matchThumb) {
    const rank = Number(matchThumb[1]);
    const look = analysis.additionalLooks.find((l) => l.rank === rank) ?? analysis.additionalLooks[rank - 2];
    return look?.imageUrl ?? null;
  }

  const altThumb = /^alt-(\d+)-thumb$/.exec(fieldId);
  if (altThumb) {
    const idx = Number(altThumb[1]);
    return analysis.additionalLooks[idx]?.imageUrl ?? null;
  }

  return null;
}
