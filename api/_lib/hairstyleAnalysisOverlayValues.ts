/**
 * Server mirror of src/utils/hairstyleAnalysisOverlayContent.ts
 */

import {
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
  formatScorePercent,
} from './hairstyleAnalysisDisplay.js';
import type { FalAnalysisLook, FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { clientFirstName, hairstyleAnalysis3dMannequinFrontPath } from './hairstyleAnalysisMannequinRefs.js';
import { normalizeHairstyleAnalysisCardTier } from './hairstyleAnalysisTemplates.js';

function specValues(look: FalAnalysisLook): Record<string, string> {
  return {
    specTexture: look.unit,
    specColor: look.color,
    specLength: displayLength(look.length),
    specLace: displayLace(look.lace),
    specDensity: displayDensity(look.density),
    specParting: displayPart(look.part),
    specHairline: displayHairline(look.hairline),
    specStyle: displayStyle(look.styling),
  };
}

function topMatchHeader(look: FalAnalysisLook): Record<string, string> {
  return {
    clientName: '',
    topScore: formatScorePercent(look.score),
    rating: '',
    ...specValues(look),
  };
}

function matchRowValues(look: FalAnalysisLook): Record<string, string> {
  return {
    texture: look.unit,
    color: look.color,
    length: displayLength(look.length),
    score: formatScorePercent(look.score),
  };
}

function applyMatchRow(out: Record<string, string>, prefix: string, look: FalAnalysisLook): void {
  const row = matchRowValues(look);
  out[`${prefix}-texture`] = row.texture;
  out[`${prefix}-color`] = row.color;
  out[`${prefix}-length`] = row.length;
  out[`${prefix}-score`] = row.score;
}

function freeOverlayValues(analysis: FalHairstyleAnalysis): Record<string, string> {
  const out: Record<string, string> = {
    ...topMatchHeader(analysis.topMatch),
    clientName: clientFirstName(analysis.clientName),
  };
  analysis.whyItWorks.forEach((line, i) => {
    out[`whyLine-${i}`] = line;
  });
  return out;
}

function threeMonthOverlayValues(analysis: FalHairstyleAnalysis): Record<string, string> {
  const out: Record<string, string> = {
    ...topMatchHeader(analysis.topMatch),
    clientName: clientFirstName(analysis.clientName),
  };
  analysis.additionalLooks.slice(0, 3).forEach((look, i) => {
    applyMatchRow(out, `match${i + 2}`, look);
  });
  return out;
}

function sixMonthOverlayValues(analysis: FalHairstyleAnalysis): Record<string, string> {
  const portfolio: FalAnalysisLook[] = [analysis.topMatch, ...analysis.additionalLooks];
  const out: Record<string, string> = {
    ...topMatchHeader(analysis.topMatch),
    clientName: clientFirstName(analysis.clientName),
  };
  portfolio.slice(0, 5).forEach((look, i) => {
    applyMatchRow(out, `portfolio-${i}`, look);
  });
  return out;
}

function twelveMonthOverlayValues(analysis: FalHairstyleAnalysis): Record<string, string> {
  const out: Record<string, string> = {
    ...topMatchHeader(analysis.topMatch),
    clientName: clientFirstName(analysis.clientName),
  };
  analysis.additionalLooks.slice(0, 9).forEach((alt, i) => {
    out[`alt-${i}-color`] = alt.color;
    out[`alt-${i}-length`] = displayLength(alt.length);
    out[`alt-${i}-score`] = formatScorePercent(alt.score);
  });
  analysis.whyItWorks.forEach((line, i) => {
    out[`whyLine-${i}`] = line;
  });
  return out;
}

const BUILDERS: Record<
  ReturnType<typeof normalizeHairstyleAnalysisCardTier>,
  (analysis: FalHairstyleAnalysis) => Record<string, string>
> = {
  free: freeOverlayValues,
  three_month: threeMonthOverlayValues,
  six_month: sixMonthOverlayValues,
  twelve_month: twelveMonthOverlayValues,
};

export function buildServerOverlayValues(analysis: FalHairstyleAnalysis): Record<string, string> {
  const key = normalizeHairstyleAnalysisCardTier(analysis.tier);
  return BUILDERS[key](analysis);
}

function lookForFieldId(fieldId: string, analysis: FalHairstyleAnalysis): FalAnalysisLook | null {
  const portfolioThumb = /^portfolio-(\d+)-thumb$/.exec(fieldId);
  if (portfolioThumb) {
    const idx = Number(portfolioThumb[1]);
    const portfolio = [analysis.topMatch, ...analysis.additionalLooks];
    return portfolio[idx] ?? null;
  }

  const matchThumb = /^match(\d+)-thumb$/.exec(fieldId);
  if (matchThumb) {
    const rank = Number(matchThumb[1]);
    return (
      analysis.additionalLooks.find((l) => l.rank === rank) ??
      analysis.additionalLooks[rank - 2] ??
      null
    );
  }

  const altThumb = /^alt-(\d+)-thumb$/.exec(fieldId);
  if (altThumb) {
    const idx = Number(altThumb[1]);
    return analysis.additionalLooks[idx] ?? null;
  }

  return null;
}

export function resolveServerOverlayImageUrl(
  fieldId: string,
  analysis: FalHairstyleAnalysis,
  clientPreviewUrl: string,
  siteOrigin: string
): string | null {
  if (fieldId === 'clientImage') return clientPreviewUrl;

  const look = lookForFieldId(fieldId, analysis);
  if (!look) return null;

  if (look.imageUrl?.trim()) return look.imageUrl.trim();

  const path = hairstyleAnalysis3dMannequinFrontPath(look.unit);
  return path.startsWith('/') ? `${siteOrigin.replace(/\/$/, '')}${path}` : path;
}
