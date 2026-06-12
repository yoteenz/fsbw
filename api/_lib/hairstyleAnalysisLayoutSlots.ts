/** Pixel slots for 2048×2560 hairstyle analysis templates (mirrors src/utils/hairstyleAnalysisTemplateLayouts.ts). */

export type PixelRect = { left: number; top: number; width: number; height: number };

export const HAIRSTYLE_ANALYSIS_CANVAS = { width: 2048, height: 2560 } as const;

export function pixelRectFromPercent(
  left: string,
  top: string,
  width: string,
  height: string
): PixelRect {
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

/** Value boxes below OVERALL SCORE / MATCH RATING labels (calibrated on IMG_2447 @ 2048×2560). */
const pctRect = pixelRectFromPercent;

export const TOP_SCORE_SLOT = pctRect('54.7%', '16%', '9.7%', '5.8%');
export const RATING_SLOT = pctRect('69.3%', '16%', '9.7%', '5.8%');

const SPEC_TOPS = [24.0, 26.6, 29.2, 31.8, 34.4, 37.0, 39.6, 42.2];
const SPEC_IDS = [
  'specTexture',
  'specColor',
  'specLength',
  'specLace',
  'specDensity',
  'specParting',
  'specHairline',
  'specStyle',
] as const;

export function topMatchSpecSlots(): Array<{ id: (typeof SPEC_IDS)[number]; rect: PixelRect }> {
  return SPEC_IDS.map((id, i) => ({
    id,
    rect: pctRect('72%', `${SPEC_TOPS[i]}%`, '21%', '2.3%'),
  }));
}

function matchRowScoreSlot(blockTop: number): PixelRect {
  return pctRect('60.5%', `${blockTop + 6.4}%`, '30%', '1.7%');
}

export function threeMonthMatchScoreSlots(): PixelRect[] {
  return [48.0, 60.5, 73.0].map(matchRowScoreSlot);
}

export function sixMonthPortfolioScoreSlots(): PixelRect[] {
  return [48.5, 57.0, 65.5, 74.0, 82.5].map(matchRowScoreSlot);
}

export function twelveMonthAltScoreSlots(): PixelRect[] {
  const colLefts = [52.0, 64.5, 77.0];
  const rowTops = [34.5, 46.0, 57.5];
  const rects: PixelRect[] = [];
  for (const blockTop of rowTops) {
    for (const left of colLefts) {
      rects.push(pctRect(`${left}%`, `${blockTop + 8.9}%`, '11%', '1.5%'));
    }
  }
  return rects;
}
