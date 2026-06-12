import {
  HAIRSTYLE_ANALYSIS_CANVAS,
  RATING_SLOT,
  TOP_SCORE_SLOT,
  type PixelRect,
} from './hairstyleAnalysisLayoutSlots.js';
import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';

export type PercentSlotOverride = {
  left?: string;
  top?: string;
  width?: string;
  height?: string;
};

export type CompositeLayoutOverrides = Record<string, PercentSlotOverride>;

type PercentRect = {
  left: string;
  top: string;
  width: string;
  height: string;
};

function normalizeTier(tier: FalHairstyleAnalysis['tier']): Exclude<FalHairstyleAnalysis['tier'], 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

function pctRect(left: string, top: string, width: string, height: string): PixelRect {
  const W = HAIRSTYLE_ANALYSIS_CANVAS.width;
  const H = HAIRSTYLE_ANALYSIS_CANVAS.height;
  const lp = Number(left.replace('%', ''));
  const tp = Number(top.replace('%', ''));
  const wp = Number(width.replace('%', ''));
  const hp = Number(height.replace('%', ''));
  return {
    left: Math.round((W * lp) / 100),
    top: Math.round((H * tp) / 100),
    width: Math.round((W * wp) / 100),
    height: Math.round((H * hp) / 100),
  };
}

function mergePercentRect(base: PercentRect, override?: PercentSlotOverride): PercentRect {
  return {
    left: override?.left ?? base.left,
    top: override?.top ?? base.top,
    width: override?.width ?? base.width,
    height: override?.height ?? base.height,
  };
}

const TOP_SCORE_PERCENT: PercentRect = { left: '54.7%', top: '16%', width: '9.7%', height: '5.8%' };
const RATING_PERCENT: PercentRect = { left: '69.3%', top: '16%', width: '9.7%', height: '5.8%' };

function matchRowScorePercent(blockTop: number): PercentRect {
  return { left: '60.5%', top: `${blockTop + 6.4}%`, width: '30%', height: '1.7%' };
}

function defaultScoreSlotPercents(tier: FalHairstyleAnalysis['tier']): Record<string, PercentRect> {
  const key = normalizeTier(tier);
  const out: Record<string, PercentRect> = {
    topScore: TOP_SCORE_PERCENT,
    rating: RATING_PERCENT,
  };

  if (key === 'three_month') {
    [48.0, 60.5, 73.0].forEach((blockTop, i) => {
      out[`match${i + 2}-score`] = matchRowScorePercent(blockTop);
    });
    return out;
  }

  if (key === 'six_month') {
    [48.5, 57.0, 65.5, 74.0, 82.5].forEach((blockTop, i) => {
      out[`portfolio-${i}-score`] = matchRowScorePercent(blockTop);
    });
    return out;
  }

  const colLefts = [52.0, 64.5, 77.0];
  const rowTops = [34.5, 46.0, 57.5];
  let altIndex = 0;
  for (const blockTop of rowTops) {
    for (const left of colLefts) {
      out[`alt-${altIndex}-score`] = {
        left: `${left}%`,
        top: `${blockTop + 8.9}%`,
        width: '11%',
        height: '1.5%',
      };
      altIndex += 1;
    }
  }
  return out;
}

export function resolveCompositeSlotRect(
  slotId: string,
  tier: FalHairstyleAnalysis['tier'],
  overrides?: CompositeLayoutOverrides
): PixelRect | null {
  const defaults = defaultScoreSlotPercents(tier)[slotId];
  if (!defaults) return null;
  const merged = mergePercentRect(defaults, overrides?.[slotId]);
  return pctRect(merged.left, merged.top, merged.width, merged.height);
}

export function resolveTopScoreSlot(overrides?: CompositeLayoutOverrides): PixelRect {
  return resolveCompositeSlotRect('topScore', 'free', overrides) ?? TOP_SCORE_SLOT;
}

export function resolveRatingSlot(overrides?: CompositeLayoutOverrides): PixelRect {
  return resolveCompositeSlotRect('rating', 'free', overrides) ?? RATING_SLOT;
}

export function matchScoreSlotIds(tier: FalHairstyleAnalysis['tier']): string[] {
  const defaults = defaultScoreSlotPercents(tier);
  return Object.keys(defaults).filter((id) => id.endsWith('-score') && id !== 'topScore');
}

export function parseCompositeLayoutOverrides(raw: unknown): CompositeLayoutOverrides | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: CompositeLayoutOverrides = {};
  for (const [slotId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const slot = value as Record<string, unknown>;
    const entry: PercentSlotOverride = {};
    for (const key of ['left', 'top', 'width', 'height'] as const) {
      const v = slot[key];
      if (typeof v === 'string' && v.trim()) entry[key] = v.trim();
    }
    if (Object.keys(entry).length > 0) out[slotId] = entry;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
