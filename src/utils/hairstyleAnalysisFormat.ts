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
  const p = look.part.replace(/\s*PART\s*$/i, '').trim().toUpperCase();
  return p.includes('PART') ? p : `${p} PART`;
}

export function displayStyle(look: AnalysisLook): string {
  return look.styling
    .replace(/^STYLING:\s*/i, '')
    .replace(/^NONE$/i, 'NONE')
    .toUpperCase();
}

export function displayLength(look: AnalysisLook): string {
  return look.length.toUpperCase().includes('INCH') ? look.length.toUpperCase() : `${look.length.toUpperCase()} INCHES`;
}

export function compactPortfolioLine(rank: number, look: AnalysisLook): string {
  const styleSuffix =
    displayStyle(look) !== 'NONE' && displayStyle(look) !== 'LAYERS'
      ? ` + ${displayStyle(look)}`
      : displayStyle(look) === 'LAYERS'
        ? ' + LAYERS'
        : '';
  return `${String(rank).padStart(2, '0')} ${look.unit}${styleSuffix} — ${formatScorePercent(look.score)}`;
}

export function alternativeBlock(rank: number, look: AnalysisLook): string {
  return [
    `ALTERNATIVE ${String(rank).padStart(2, '0')}`,
    `TEXTURE = ${look.unit}`,
    `COLOR = ${look.color}`,
    `HEX = ${look.hex}`,
    `LENGTH = ${displayLength(look)}`,
    `MATCH SCORE = ${formatScorePercent(look.score)}`,
  ].join('\n');
}

export function threeMonthAltBlock(look: AnalysisLook): string {
  return [look.unit, look.color, displayLength(look), formatScorePercent(look.score)].join('\n');
}
