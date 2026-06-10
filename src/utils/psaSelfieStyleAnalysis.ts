/**
 * PSA selfie style analysis — premium members only.
 * Pick count scales with subscription term: 3mo → 4, 6mo → 6, 12mo → 10 (all six units eligible).
 */
import { getEffectiveSubscriptionTier } from './adminAuth';
import type { PsaSelfieStylePick } from '../types/styleAnalysis';
import type { UnitId } from './productOptions';
import { getWigUnitProductRoute } from './wigUnitProductRoutes';

export const PSA_SELFIE_STYLE_CHIP = 'FIND MY BEST LOOKS';

export const PSA_SELFIE_PICKS_BY_SUBSCRIPTION_TIER: Record<string, number> = {
  '3months': 4,
  '6months': 6,
  '12months': 10,
};

export const PSA_SELFIE_DEFAULT_PICKS = 4;

export function psaSelfieMaxPicksForUser(user: {
  subscriptionTier?: string;
  membershipType?: string;
} | null): number {
  const tier = getEffectiveSubscriptionTier(user);
  if (tier && PSA_SELFIE_PICKS_BY_SUBSCRIPTION_TIER[tier] != null) {
    return PSA_SELFIE_PICKS_BY_SUBSCRIPTION_TIER[tier];
  }
  return PSA_SELFIE_DEFAULT_PICKS;
}

export function psaSelfieMaxPicksFromStorage(): number {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return PSA_SELFIE_DEFAULT_PICKS;
    return psaSelfieMaxPicksForUser(JSON.parse(raw) as { subscriptionTier?: string; membershipType?: string });
  } catch {
    return PSA_SELFIE_DEFAULT_PICKS;
  }
}

const UNIT_IDS: UnitId[] = [
  'noir',
  'blanco',
  'soft-wave',
  'beach-wave',
  'soft-curl',
  'ocean-curl',
];

const UNIT_LABELS: Record<UnitId, string> = {
  noir: 'NOIR',
  blanco: 'BLANCO',
  'soft-wave': 'SOFT WAVE',
  'beach-wave': 'BEACH WAVE',
  'soft-curl': 'SOFT CURL',
  'ocean-curl': 'OCEAN CURL',
};

export function buildPsaBawPath(unitKey: UnitId, color?: string, styling?: string): string {
  const base = getWigUnitProductRoute(UNIT_LABELS[unitKey]).replace(
    /^\/(straight|wavy|curly)\//,
    '/build-a-wig/'
  );
  const params = new URLSearchParams();
  if (color) params.set('color', color);
  if (styling) params.set('styling', styling);
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

/** Client-side fallback when API unavailable — rotates six units for UI smoke tests. */
export function buildPsaSelfieFallbackPicks(maxPicks: number): PsaSelfieStylePick[] {
  const picks: PsaSelfieStylePick[] = [];
  for (let i = 0; i < Math.min(maxPicks, UNIT_IDS.length); i++) {
    const unitKey = UNIT_IDS[i % UNIT_IDS.length];
    const unitLabel = UNIT_LABELS[unitKey];
    const color = unitKey === 'blanco' ? 'PLATINUM' : 'OFF BLACK';
    picks.push({
      rank: i + 1,
      unitKey,
      unitLabel,
      length: '24"',
      density: unitKey === 'blanco' ? '250%' : '200%',
      texture: 'SILKY',
      color,
      hairline: 'NATURAL',
      styling: 'NONE',
      partSelection: 'MIDDLE',
      why: `BALANCED FOR YOUR FACE & VIBE — ${unitLabel} IS A STRONG MATCH.`,
      buildAWigPath: buildPsaBawPath(unitKey, color, 'NONE'),
      stars: i < 2 ? 5 : i < 4 ? 4 : 3,
    });
  }
  return picks;
}

export function isPsaSelfieStyleChip(text: string): boolean {
  const t = text.trim().toUpperCase();
  return t === PSA_SELFIE_STYLE_CHIP || t.includes('FIND MY BEST LOOK');
}
