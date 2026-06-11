import type { AnalysisLook, AnalysisTier, HairstyleAnalysis } from '../types/hairstyleAnalysis';
import {
  alternativeBlock,
  compactPortfolioLine,
  displayDensity,
  displayHairline,
  displayLength,
  displayLace,
  displayPart,
  displayStyle,
  formatScorePercent,
  formatStarRating,
  threeMonthAltBlock,
} from './hairstyleAnalysisFormat';
import { normalizeAnalysisTier } from './hairstyleAnalysisRules';

function topMatchBulletLines(look: AnalysisLook): string[] {
  return [
    look.unit,
    look.color,
    displayLength(look),
    displayLace(look),
    displayDensity(look),
    displayHairline(look),
    displayPart(look).replace(/\s+PART$/i, ''),
    displayStyle(look) === 'LAYERS' ? 'SOFT FACE FRAMING LAYERS' : displayStyle(look),
  ];
}

function specValues(look: AnalysisLook): Record<string, string> {
  return {
    specTexture: look.unit,
    specColor: look.color,
    specHex: look.hex,
    specLength: displayLength(look),
    specLace: displayLace(look),
    specDensity: displayDensity(look),
    specParting: displayPart(look).replace(/\s+PART$/i, ''),
    specHairline: displayHairline(look),
    specStyle: displayStyle(look) === 'LAYERS' ? 'SOFT FACE FRAMING LAYERS' : displayStyle(look),
  };
}

function freeOverlayValues(analysis: HairstyleAnalysis): Record<string, string> {
  const bullets = topMatchBulletLines(analysis.topMatch);
  const specs = specValues(analysis.topMatch);
  const out: Record<string, string> = {
    clientName: analysis.clientName.toUpperCase(),
    topScore: formatScorePercent(analysis.topMatch.score),
    rating: formatStarRating(analysis.topMatch.rating),
    ...specs,
  };
  bullets.forEach((line, i) => {
    out[`topBullet-${i}`] = line;
  });
  analysis.whyItWorks.forEach((line, i) => {
    out[`whyLine-${i}`] = line;
  });
  return out;
}

function threeMonthOverlayValues(analysis: HairstyleAnalysis): Record<string, string> {
  const out: Record<string, string> = {
    clientName: analysis.clientName.toUpperCase(),
    topMatchBlock: threeMonthAltBlock(analysis.topMatch),
  };
  analysis.additionalLooks.forEach((look, i) => {
    out[`altBlock-${i}`] = threeMonthAltBlock(look);
  });
  return out;
}

function sixMonthOverlayValues(analysis: HairstyleAnalysis): Record<string, string> {
  const portfolio: AnalysisLook[] = [analysis.topMatch, ...analysis.additionalLooks];
  const out: Record<string, string> = {
    clientName: analysis.clientName.toUpperCase(),
    topMatchBlock: [
      analysis.topMatch.unit,
      analysis.topMatch.color,
      displayLength(analysis.topMatch),
      formatScorePercent(analysis.topMatch.score),
    ].join('\n'),
  };
  portfolio.forEach((look, i) => {
    out[`portfolioLine-${i}`] = compactPortfolioLine(i + 1, look);
  });
  return out;
}

function twelveMonthOverlayValues(analysis: HairstyleAnalysis): Record<string, string> {
  const look = analysis.topMatch;
  const specs = specValues(look);
  const out: Record<string, string> = {
    clientName: analysis.clientName.toUpperCase(),
    topScore: formatScorePercent(look.score),
    rating: formatStarRating(look.rating),
    topMatchBlock: [
      `TEXTURE = ${look.unit}`,
      `COLOR = ${look.color}`,
      `HEX = ${look.hex}`,
      `LENGTH = ${displayLength(look)}`,
      `LACE = ${displayLace(look)}`,
      `DENSITY = ${displayDensity(look)}`,
      `PART = ${displayPart(look)}`,
      `HAIRLINE = ${displayHairline(look)}`,
      `STYLE = ${displayStyle(look) === 'LAYERS' ? 'SOFT FACE FRAMING LAYERS' : displayStyle(look)}`,
    ].join('\n'),
    ...specs,
  };
  analysis.additionalLooks.forEach((alt, i) => {
    out[`altBlock-${i}`] = alternativeBlock(i + 1, alt);
  });
  analysis.whyItWorks.forEach((line, i) => {
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
  six_month: sixMonthOverlayValues,
  twelve_month: twelveMonthOverlayValues,
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
  return null;
}
