import type { AnalysisLook } from '../types/hairstyleAnalysis';

export function formatScorePercent(score: number): string {
  return `${Math.round(score)}%`;
}

export function formatStarRating(rating: number): string {
  const n = Math.min(5, Math.max(0, Math.round(rating)));
  return '★'.repeat(n) + (n < 5 ? '☆'.repeat(5 - n) : '');
}

export function displayLace(look: AnalysisLook): string {
  return look.lace
    .replace(/\s*LACE\s*$/i, '')
    .replace(/\s*HD\s*$/i, ' HD')
    .trim()
    .toUpperCase();
}

export function displayDensity(look: AnalysisLook): string {
  return look.density.replace(/\s*DENSITY\s*$/i, '').trim();
}

export function displayHairline(look: AnalysisLook): string {
  return look.hairline.replace(/\s*HAIRLINE\s*$/i, '').trim().toUpperCase();
}

export function displayPart(look: AnalysisLook): string {
  return look.part
    .replace(/\s*PART\s*$/i, '')
    .replace(/^PART\s+/i, '')
    .trim()
    .toUpperCase();
}

export function normalizeAnalysisStylingId(unit: string, stylingRaw: string): string {
  let s = String(stylingRaw || '')
    .replace(/^STYLING:\s*/i, '')
    .trim()
    .toUpperCase();
  if (!s || s === 'NONE') return 'NONE';
  const u = unit.trim().toUpperCase();
  if (u === 'SOFT CURL' || u === 'OCEAN CURL') {
    if (s === 'CRIMPS') return 'WAND CURLS';
    if (s === 'LAYERS') return 'DEFINE';
  }
  if (s === 'SOFT FACE FRAMING LAYERS') return 'LAYERS';
  return s;
}

export function displayStyle(look: AnalysisLook): string {
  return normalizeAnalysisStylingId(look.unit, look.styling);
}

export function displayLength(look: AnalysisLook): string {
  return look.length.toUpperCase().includes('INCH') ? look.length.toUpperCase() : `${look.length.toUpperCase()} INCHES`;
}

export function compactPortfolioLine(rank: number, look: AnalysisLook): string {
  const style = displayStyle(look);
  const styleSuffix = style !== 'NONE' ? ` + ${style}` : '';
  return `${String(rank).padStart(2, '0')} ${look.unit}${styleSuffix} — ${formatScorePercent(look.score)}`;
}

export function alternativeBlock(rank: number, look: AnalysisLook): string {
  return [
    `ALTERNATIVE ${String(rank).padStart(2, '0')}`,
    `TEXTURE = ${look.unit}`,
    `COLOR = ${look.color}`,
    `LENGTH = ${displayLength(look)}`,
    `MATCH SCORE = ${formatScorePercent(look.score)}`,
  ].join('\n');
}

export function threeMonthAltBlock(look: AnalysisLook): string {
  return [look.unit, look.color, displayLength(look), formatScorePercent(look.score)].join('\n');
}
