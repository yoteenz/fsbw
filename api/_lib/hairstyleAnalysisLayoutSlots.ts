/** Pixel slots for 2048×2560 hairstyle analysis templates (mirrors src/utils/hairstyleAnalysisTemplateLayouts.ts). */

export type PixelRect = { left: number; top: number; width: number; height: number };

/** Clip `inner` to fit inside `outer` (absolute canvas coordinates). */
export function intersectPixelRects(outer: PixelRect, inner: PixelRect): PixelRect | null {
  const left = Math.max(outer.left, inner.left);
  const top = Math.max(outer.top, inner.top);
  const right = Math.min(outer.left + outer.width, inner.left + inner.width);
  const bottom = Math.min(outer.top + outer.height, inner.top + inner.height);
  if (right <= left || bottom <= top) return null;
  return { left, top, width: right - left, height: bottom - top };
}

/** `rect` position relative to `container` origin (for panel-local composite). */
export function pixelRectRelativeTo(container: PixelRect, rect: PixelRect): PixelRect {
  return {
    left: rect.left - container.left,
    top: rect.top - container.top,
    width: rect.width,
    height: rect.height,
  };
}

export const HAIRSTYLE_ANALYSIS_CANVAS = { width: 2048, height: 2560 } as const;

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

/** Value boxes below OVERALL SCORE / MATCH RATING labels (calibrated on IMG_2549 @ 2048×2560). */
export const TOP_SCORE_SLOT = pctRect('54.7%', '16%', '9.7%', '5.8%');
export const RATING_SLOT = pctRect('69.3%', '16%', '9.7%', '5.8%');

/** Main client preview photo window (mirrors src/utils/hairstyleAnalysisTemplateLayouts.ts). */
export const CLIENT_IMAGE_SLOT = pctRect('4%', '14%', '44.5%', '68.5%');

/** Inner client photo window — bottom fade mask target (debug square default). */
export const CLIENT_PHOTO_FADE_PERCENT = {
  left: '5.76%',
  top: '18.44%',
  width: '40.97%',
  height: '62.70%',
} as const;

export const CLIENT_PHOTO_FADE_SLOT = pctRect(
  CLIENT_PHOTO_FADE_PERCENT.left,
  CLIENT_PHOTO_FADE_PERCENT.top,
  CLIENT_PHOTO_FADE_PERCENT.width,
  CLIENT_PHOTO_FADE_PERCENT.height
);

/** Derive fade rect from outer client panel when only clientImage is overridden. */
export function clientPhotoFadeRect(outer: PixelRect = CLIENT_IMAGE_SLOT): PixelRect {
  const insetX = Math.round(outer.width * 0.04);
  const insetTop = Math.round(outer.height * 0.065);
  const insetBottom = Math.round(outer.height * 0.02);
  return {
    left: outer.left + insetX,
    top: outer.top + insetTop,
    width: outer.width - insetX * 2,
    height: outer.height - insetTop - insetBottom,
  };
}

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

export type MatchRowValueSlot = {
  id: string;
  rect: PixelRect;
  fill: string;
};

/** MATCH 02–04 value slots (texture, color, length, score) — debug overlay / layout reference. */
export function premiumMatchRowValueSlots(): MatchRowValueSlot[] {
  const matchTops = [48.0, 60.5, 73.0];
  const slots: MatchRowValueSlot[] = [];
  for (let i = 0; i < matchTops.length; i++) {
    const blockTop = matchTops[i];
    const prefix = `match${i + 2}`;
    const fields = [
      { key: 'texture', offset: 1.0, fill: '#1a1a1a' },
      { key: 'color', offset: 2.8, fill: '#1a1a1a' },
      { key: 'length', offset: 4.6, fill: '#1a1a1a' },
      { key: 'score', offset: 6.4, fill: '#808080' },
    ] as const;
    for (const field of fields) {
      slots.push({
        id: `${prefix}-${field.key}`,
        rect: pctRect('60.5%', `${blockTop + field.offset}%`, '30%', '1.7%'),
        fill: field.fill,
      });
    }
  }
  return slots;
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
