/** Display helpers for hairstyle analysis prompts + server composite (keep aligned with src/utils/hairstyleAnalysisFormat.ts). */

export function formatScorePercent(score: number): string {
  return `${Math.round(score)}%`;
}

export function displayLength(length: string): string {
  const u = length.toUpperCase();
  return u.includes('INCH') ? u : `${u} INCHES`;
}

export function displayLace(lace: string): string {
  return lace.replace(/\s*LACE\s*$/i, '').replace(/\s*HD\s*$/i, ' HD').trim().toUpperCase();
}

export function displayDensity(density: string): string {
  return density.replace(/\s*DENSITY\s*$/i, '').trim();
}

export function displayHairline(hairline: string): string {
  return hairline.replace(/\s*HAIRLINE\s*$/i, '').trim().toUpperCase();
}

/** Part value only — template label already says PART. */
export function displayPart(part: string): string {
  return part
    .replace(/\s*PART\s*$/i, '')
    .replace(/^PART\s+/i, '')
    .trim()
    .toUpperCase();
}

/** Salon styling ids as shown on Build-a-Wig (LAYERS, FLAT IRON, CRIMPS, etc.). */
export function displayStyle(styling: string): string {
  const s = styling
    .replace(/^STYLING:\s*/i, '')
    .trim()
    .toUpperCase();
  if (s === 'SOFT FACE FRAMING LAYERS') return 'LAYERS';
  return s;
}
