/**
 * Overlay slot map for hairstyle analysis cards (2048×2560).
 * Chrome (marble, acrylic, glow, footer, BUILD THIS LOOK) = Supabase reference PNG per tier.
 * This file defines **value + photo slots only** — labels/icons are baked into the reference template.
 */

import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import {
  normalizeHairstyleAnalysisCardTier,
  type HairstyleAnalysisCardTier,
} from './hairstyleAnalysisTemplates.js';

export const CARD_CANVAS = { width: 2048, height: 2560 } as const;

export type PixelRect = { left: number; top: number; width: number; height: number };

export type LayoutFieldKind = 'text' | 'image';

export type LayoutFieldDef = {
  id: string;
  kind: LayoutFieldKind;
  rect: PixelRect;
};

function px(leftPct: number, topPct: number, wPct: number, hPct: number): PixelRect {
  const W = CARD_CANVAS.width;
  const H = CARD_CANVAS.height;
  return {
    left: Math.round((W * leftPct) / 100),
    top: Math.round((H * topPct) / 100),
    width: Math.round((W * wPct) / 100),
    height: Math.round((H * hPct) / 100),
  };
}

/** Calibrated to empty Supabase templates — values only (labels on PNG). */
const CLIENT_IMAGE = px(4, 14, 44.5, 68.5);
const CLIENT_NAME = px(7, 11, 32, 2.5);
const TOP_SCORE = px(54.7, 16, 9.7, 5.8);
const RATING = px(69.3, 16, 9.7, 5.8);

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

function specFields(): LayoutFieldDef[] {
  return SPEC_IDS.map((id, i) => ({
    id,
    kind: 'text' as const,
    rect: px(72, SPEC_TOPS[i]!, 21, 2.3),
  }));
}

function whyLine(index: number, topPct: number): LayoutFieldDef {
  return { id: `whyLine-${index}`, kind: 'text', rect: px(56, topPct, 38, 2.3) };
}

function baseFields(): LayoutFieldDef[] {
  return [
    { id: 'clientName', kind: 'text', rect: CLIENT_NAME },
    { id: 'clientImage', kind: 'image', rect: CLIENT_IMAGE },
    { id: 'topScore', kind: 'text', rect: TOP_SCORE },
    { id: 'rating', kind: 'text', rect: RATING },
    ...specFields(),
  ];
}

function freeFields(): LayoutFieldDef[] {
  return [
    ...baseFields(),
    ...[0, 1, 2, 3, 4].map((i) => whyLine(i, 74.5 + i * 2.5)),
  ];
}

function matchRowFields(prefix: string, blockTop: number): LayoutFieldDef[] {
  const fields: LayoutFieldDef[] = [
    {
      id: `${prefix}-thumb`,
      kind: 'image',
      rect: px(52, blockTop + 0.5, 7, 5.5),
    },
  ];
  (
    [
      ['texture', 1.0],
      ['color', 2.8],
      ['length', 4.6],
      ['score', 6.4],
    ] as const
  ).forEach(([key, offset]) => {
    fields.push({
      id: `${prefix}-${key}`,
      kind: 'text',
      rect: px(60.5, blockTop + offset, 30, 1.7),
    });
  });
  return fields;
}

function threeMonthFields(): LayoutFieldDef[] {
  return [...baseFields(), ...matchRowFields('match2', 48.0), ...matchRowFields('match3', 60.5), ...matchRowFields('match4', 73.0)];
}

function sixMonthFields(): LayoutFieldDef[] {
  const tops = [48.5, 57.0, 65.5, 74.0, 82.5];
  const fields = [...baseFields()];
  tops.forEach((top, i) => {
    fields.push({
      id: `portfolio-${i}-thumb`,
      kind: 'image',
      rect: px(52.2, top + 0.5, 7, 5.5),
    });
    (
      [
        ['texture', 1.0],
        ['color', 2.8],
        ['length', 4.6],
        ['score', 6.4],
      ] as const
    ).forEach(([key, offset]) => {
      fields.push({
        id: `portfolio-${i}-${key}`,
        kind: 'text',
        rect: px(60.5, top + offset, 30, 1.6),
      });
    });
  });
  return fields;
}

function twelveMonthFields(): LayoutFieldDef[] {
  const fields = [...baseFields()];
  const colLefts = [52.0, 64.5, 77.0];
  const rowTops = [34.5, 46.0, 57.5];
  let altIndex = 0;
  for (const blockTop of rowTops) {
    for (const left of colLefts) {
      const prefix = `alt-${altIndex}`;
      fields.push({
        id: `${prefix}-thumb`,
        kind: 'image',
        rect: px(left, blockTop + 0.5, 7, 4.5),
      });
      (
        [
          ['color', 5.5],
          ['length', 7.2],
          ['score', 8.9],
        ] as const
      ).forEach(([key, offset]) => {
        fields.push({
          id: `${prefix}-${key}`,
          kind: 'text',
          rect: px(left, blockTop + offset, 11, 1.5),
        });
      });
      altIndex += 1;
    }
  }
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((i) => {
    fields.push(whyLine(i, 70.5 + i * 1.9));
  });
  return fields;
}

const FIELD_BUILDERS: Record<HairstyleAnalysisCardTier, () => LayoutFieldDef[]> = {
  free: freeFields,
  three_month: threeMonthFields,
  six_month: sixMonthFields,
  twelve_month: twelveMonthFields,
};

export function getCardBlueprint(tier: HairstyleAnalysisCardTier): { fields: LayoutFieldDef[] } {
  return { fields: FIELD_BUILDERS[tier]() };
}

export function getLayoutFieldsFromBlueprint(analysis: FalHairstyleAnalysis): LayoutFieldDef[] {
  return getCardBlueprint(normalizeHairstyleAnalysisCardTier(analysis.tier)).fields;
}

export function topScoreAndRatingSlots(): { topScore: PixelRect; rating: PixelRect } {
  return { topScore: TOP_SCORE, rating: RATING };
}

export function pixelRectToPercent(rect: PixelRect): {
  left: string;
  top: string;
  width: string;
  height: string;
} {
  const { width: W, height: H } = CARD_CANVAS;
  return {
    left: `${((rect.left / W) * 100).toFixed(2)}%`,
    top: `${((rect.top / H) * 100).toFixed(2)}%`,
    width: `${((rect.width / W) * 100).toFixed(2)}%`,
    height: `${((rect.height / H) * 100).toFixed(2)}%`,
  };
}

/** Text/value slots to lightly clear before compositing (covers dotted placeholders on reference PNG). */
export function clearableValueRects(analysis: FalHairstyleAnalysis): PixelRect[] {
  return getLayoutFieldsFromBlueprint(analysis)
    .filter((f) => f.kind === 'text' && f.id !== 'rating')
    .map((f) => f.rect);
}
