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

/** One-decimal match rating label above stars (e.g. 5.0, 4.7). */
export function formatMatchRatingDecimal(rating: number): string {
  const clamped = Math.min(5, Math.max(0, Number(rating) || 0));
  return clamped.toFixed(1);
}

/** MATCH RATING stars: 95%+ → 5 filled; below 95% → 4 filled (left four), rightmost empty. */
export function matchRatingFilledStarsFromScore(score: number): number {
  return Math.round(score) >= 95 ? 5 : 4;
}

export function displayLength(length: string): string {
  const u = length.toUpperCase();
  return u.includes('INCH') ? u : `${u} INCHES`;
}

/** Free-tier TOP MATCH panel footer (centered black). */
export const FREE_TOP_MATCH_PANEL_FOOTER = 'YOUR BUILD SPECS ARE LOCKED IN PLACE.';

/** Inch count with quote for EDM panel build summary (e.g. 22"). */
export function formatLengthInchesShort(length: string): string {
  const match = displayLength(length).match(/(\d+)/);
  return match ? `${match[1]}"` : displayLength(length);
}

/** Free-tier every-detail-matters panel footer: UNIT · 22" · COLOR */
export function formatEdmPanelBuildSummary(unit: string, color: string, length: string): string {
  return `${unit.trim().toUpperCase()} · ${formatLengthInchesShort(length)} · ${color.trim().toUpperCase()}`;
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

/** Locked for Fal cards until PEAK/LAGOS render reliably on both templates. */
export const HAIRSTYLE_ANALYSIS_LOCKED_HAIRLINE = 'NATURAL HAIRLINE';

export function withLockedHairstyleAnalysisHairline<T extends { hairline: string }>(look: T): T {
  return { ...look, hairline: HAIRSTYLE_ANALYSIS_LOCKED_HAIRLINE };
}

/** Part value only — template label already says PART. */
export function displayPart(part: string): string {
  return part
    .replace(/\s*PART\s*$/i, '')
    .replace(/^PART\s+/i, '')
    .trim()
    .toUpperCase();
}

export type AnalysisPartKey = 'MIDDLE' | 'LEFT' | 'RIGHT';

export function normalizeAnalysisPartKey(part: string): AnalysisPartKey {
  const p = displayPart(part);
  if (p === 'LEFT' || p === 'RIGHT') return p;
  return 'MIDDLE';
}

/**
 * Fal front-portrait part placement — mirror rule from BAW salon UI:
 * UI LEFT → groove on image RIGHT; UI RIGHT → groove on image LEFT.
 */
export function partPlacementPromptLine(part: string): string {
  const key = normalizeAnalysisPartKey(part);
  if (key === 'MIDDLE') {
    return '**MIDDLE part:** visible **center** part groove at crown/forehead midline.';
  }
  if (key === 'LEFT') {
    return '**LEFT part (UI “L”):** part groove on **image RIGHT** — **right third** of forehead/scalp. **FORBIDDEN:** part on **image LEFT** (that is RIGHT part / UI “R”).';
  }
  return '**RIGHT part (UI “R”):** part groove on **image LEFT** — **left third** of forehead/scalp. **FORBIDDEN:** part on **image RIGHT** (that is LEFT part / UI “L”).';
}

export function partPlacementCompact(part: string): string {
  const key = normalizeAnalysisPartKey(part);
  if (key === 'MIDDLE') return 'MIDDLE part @ crown center';
  if (key === 'LEFT') return 'LEFT part → image RIGHT scalp';
  return 'RIGHT part → image LEFT scalp';
}

/** Inch count from catalog length string (e.g. "16", "34 INCHES"). */
export function parseLengthInches(length: string): number | null {
  const match = displayLength(length).match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export type LengthBodyLandmark =
  | 'collarbone'
  | 'above_waist'
  | 'waist'
  | 'below_waist'
  | 'hip'
  | 'upper_thigh'
  | 'mid_thigh'
  | 'knee';

/** Where manifest hair **ends** should land on the client's visible body (front portrait). */
export function lengthBodyLandmark(inches: number | null): LengthBodyLandmark {
  if (inches === null) return 'waist';
  if (inches <= 16) return 'collarbone';
  if (inches === 17) return 'above_waist';
  if (inches <= 24) return 'waist';
  if (inches === 25) return 'below_waist';
  if (inches <= 28) return 'hip';
  if (inches <= 31) return 'upper_thigh';
  if (inches <= 33) return 'mid_thigh';
  return 'knee';
}

/**
 * Fal hair-generation lock — manifest LENGTH inches control where hair **ends** terminate on the body.
 * Aligns with Every Detail Matters length copy (collarbone → waist → hip → thigh → knee).
 */
export function lengthBodyPlacementPromptLine(length: string): string {
  const inches = parseLengthInches(length);
  const len = displayLength(length);
  const landmark = lengthBodyLandmark(inches);

  if (landmark === 'collarbone') {
    return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** terminate at the **collarbone / clavicle line** on the client's visible torso — short hem, not waist- or hip-long. **FORBIDDEN:** ends at waist, hip, or thigh when manifest is ${len}.`;
  }
  if (landmark === 'above_waist') {
    return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** fall **above the natural waist** — between collarbone and waist (lower ribcage / upper torso), clearly shorter than waist-length. **FORBIDDEN:** collarbone-short or full waist-length when manifest is ${len}.`;
  }
  if (landmark === 'waist') {
    return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** terminate at the **natural waist** (navel band) — classic waist-length hem on the visible body. **FORBIDDEN:** collarbone-short or hip-long when manifest is ${len}.`;
  }
  if (landmark === 'below_waist') {
    return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** sit **below the waist and above the hip** — longer than waist-length, not yet full hip. **FORBIDDEN:** waist-short or hip-long when manifest is ${len}.`;
  }
  if (landmark === 'hip') {
    return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** terminate at the **hip line** (hip bone / upper hip on the visible torso). **FORBIDDEN:** waist-length or thigh-length when manifest is ${len}.`;
  }
  if (landmark === 'upper_thigh') {
    return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** fall **below the hip onto the upper thigh** — long dramatic line, clearly past the hip. **FORBIDDEN:** stopping at waist or hip when manifest is ${len}.`;
  }
  if (landmark === 'mid_thigh') {
    return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** reach **mid-thigh** on the visible body — very long, low on the torso/legs in frame. **FORBIDDEN:** hip-high or waist-length when manifest is ${len}.`;
  }
  return `**${len} LENGTH — BODY PLACEMENT:** hair **ends** reach **knee level or lower** on the visible body — maximum dramatic length, very low in the portrait. **FORBIDDEN:** hip-high, waist-length, or mid-thigh when manifest is ${len} (34" must read unmistakably longer than 26"–28").`;
}

export function lengthBodyPlacementCompact(length: string): string {
  const inches = parseLengthInches(length);
  const len = displayLength(length);
  const landmark = lengthBodyLandmark(inches);
  const labels: Record<LengthBodyLandmark, string> = {
    collarbone: 'ends @ collarbone',
    above_waist: 'ends above waist',
    waist: 'ends @ waist',
    below_waist: 'ends below waist',
    hip: 'ends @ hip',
    upper_thigh: 'ends upper thigh',
    mid_thigh: 'ends mid-thigh',
    knee: 'ends knee/low',
  };
  return `${len} → ${labels[landmark]}`;
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

export function stripEveryDetailMattersDashes(line: string): string {
  return line
    .replace(/\s*[—–]\s*/g, ' ')
    .replace(/(\p{L})-(\p{L})/gu, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compactEveryDetailMattersLine(line: string): string {
  const normalized = stripEveryDetailMattersDashes(
    line.trim().toUpperCase().replace(/\s+/g, ' ').replace(/[.!?]+$/g, '')
  );
  if (!normalized) return '';
  if (normalized.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return normalized;

  const forHead = normalized.split(/\s+FOR\s+/)[0]?.trim();
  if (forHead && forHead.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return forHead;

  const toHead = normalized.split(/\s+TO\s+/)[0]?.trim();
  if (toHead && toHead.length <= EVERY_DETAIL_MATTERS_MAX_CHARS) return toHead;

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
