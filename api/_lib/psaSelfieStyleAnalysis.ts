/**
 * PSA selfie style analysis — premium-only ranked unit picks (upsell-oriented).
 * Pick caps: 3mo → 4, 6mo → 6, 12mo → 10.
 */
import { searchPsaProducts } from './psaKnowledge.js';

export const PSA_SELFIE_PICKS_BY_TIER: Record<string, number> = {
  '3months': 4,
  '6months': 6,
  '12months': 10,
};

export function psaSelfieMaxPicks(subscriptionTier: string | null | undefined): number {
  const t = (subscriptionTier ?? '').trim().toLowerCase();
  if (t && PSA_SELFIE_PICKS_BY_TIER[t] != null) return PSA_SELFIE_PICKS_BY_TIER[t];
  return 4;
}

const UNIT_CATALOG_BLOCK = searchPsaProducts('')
  .slice(0, 6)
  .map((p) => `- ${p.name}: ${p.summary ?? p.texture}`)
  .join('\n');

export function buildPsaSelfieStyleAnalysisInstructions(maxPicks: number): string {
  return `You are the Frontal Slayer / Build-a-Wig PSA style analyst.

Analyze the member selfie. Recommend ONLY these six catalog units (no invented wigs):
NOIR, BLANCO, SOFT WAVE, BEACH WAVE, SOFT CURL, OCEAN CURL.

Return exactly ${maxPicks} ranked picks customized to upsell — face shape, undertone, vibe, lifestyle.
Each pick must use real BAW options:
- length (16"–40"), density, texture (SILKY/KINKY/YAKI), color (BLANCO: GOLDEN/PLATINUM/ASH only; others: catalog colors),
- hairline (NATURAL/PEAK/LAGOS/LAGOS + PEAK), styling, parting (MIDDLE/LEFT/RIGHT).

Catalog:
${UNIT_CATALOG_BLOCK}

Respond with JSON only:
{
  "clientSummary": "two sentences",
  "faceShape": "",
  "undertone": "",
  "picks": [
    {
      "rank": 1,
      "unitLabel": "NOIR",
      "length": "24\\"",
      "density": "200%",
      "texture": "SILKY",
      "color": "OFF BLACK",
      "hairline": "NATURAL",
      "styling": "NONE",
      "partSelection": "MIDDLE",
      "why": "one line",
      "stars": 5
    }
  ]
}`;
}

export type PsaSelfieAnalysisPick = {
  rank: number;
  unitLabel: string;
  length: string;
  density: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  partSelection: string;
  why: string;
  stars?: number;
};

export type PsaSelfieAnalysisPayload = {
  clientSummary: string;
  faceShape?: string;
  undertone?: string;
  picks: PsaSelfieAnalysisPick[];
};

const UNIT_SLUG: Record<string, string> = {
  NOIR: 'noir',
  BLANCO: 'blanco',
  'SOFT WAVE': 'soft-wave',
  'BEACH WAVE': 'beach-wave',
  'SOFT CURL': 'soft-curl',
  'OCEAN CURL': 'ocean-curl',
};

export function unitKeyFromLabel(label: string): string {
  const u = label.trim().toUpperCase();
  return UNIT_SLUG[u] ?? 'noir';
}

export function buildBawPathFromPick(pick: PsaSelfieAnalysisPick): string {
  const unitKey = unitKeyFromLabel(pick.unitLabel);
  const params = new URLSearchParams();
  if (pick.color) params.set('color', pick.color.replace(/\s+/g, ' ').trim());
  if (pick.styling) params.set('styling', pick.styling);
  const q = params.toString();
  return `/build-a-wig/${unitKey}${q ? `?${q}` : ''}`;
}

export function parsePsaSelfieAnalysisJson(text: string): PsaSelfieAnalysisPayload | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as PsaSelfieAnalysisPayload;
    if (!parsed || !Array.isArray(parsed.picks)) return null;
    return parsed;
  } catch {
    return null;
  }
}
