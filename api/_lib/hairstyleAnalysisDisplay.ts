/** Display helpers for hairstyle analysis prompts (keep aligned with src/utils/hairstyleAnalysisFormat.ts). */

const CURLY_UNITS = new Set(['SOFT CURL', 'OCEAN CURL']);

export function isCurlyAnalysisUnit(unit: string): boolean {
  return CURLY_UNITS.has(unit.trim().toUpperCase());
}

/** Canonical BAW salon styling id for prompts + refs (no `STYLING:` prefix). */
export function normalizeAnalysisStylingId(unit: string, stylingRaw: string): string {
  let s = String(stylingRaw || '')
    .replace(/^STYLING:\s*/i, '')
    .trim()
    .toUpperCase();
  if (!s || s === 'NONE') return 'NONE';
  if (isCurlyAnalysisUnit(unit)) {
    if (s === 'CRIMPS') return 'WAND CURLS';
    if (s === 'LAYERS') return 'DEFINE';
  }
  if (s === 'SOFT FACE FRAMING LAYERS') return 'LAYERS';
  return s;
}

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
export function displayStyle(styling: string, unit = ''): string {
  return normalizeAnalysisStylingId(unit, styling);
}

/** Human label for Fal prompts (underscore salon modes → BAW ids). */
export function salonModeToBawStyleId(salonMode: string): string {
  const m = salonMode.trim().toLowerCase();
  if (m === 'flat_iron') return 'FLAT IRON';
  if (m === 'crimps') return 'CRIMPS';
  if (m === 'layers') return 'LAYERS';
  return salonMode.toUpperCase();
}

/** Max chars per every-detail-matters row @ 2048×2560 (~38% slot width) — one line, no wrap. */
export const EVERY_DETAIL_MATTERS_MAX_CHARS = 68;

export function compactEveryDetailMattersLine(line: string): string {
  const normalized = line.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!normalized) return '';
  if (normalized.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return normalized;

  const dashHead = normalized.split(/\s*[—–-]\s*/)[0]?.trim();
  if (dashHead && dashHead.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return dashHead;

  const words = normalized.split(' ');
  let out = '';
  for (const word of words) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > EVERY_DETAIL_MATTERS_MAX_CHARS) break;
    out = next;
  }
  if (out) return out;

  return normalized.slice(0, EVERY_DETAIL_MATTERS_MAX_CHARS).trim();
}

export function compactEveryDetailMattersLines(lines: string[]): string[] {
  return lines.map(compactEveryDetailMattersLine).filter(Boolean);
}
