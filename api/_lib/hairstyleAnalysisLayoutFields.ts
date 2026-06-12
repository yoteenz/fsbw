/**
 * Server mirror of src/utils/hairstyleAnalysisTemplateLayouts.ts — pixel rects for 2048×2560.
 */

import type { FalHairstyleAnalysis } from './hairstyleAnalysisFalPrompt.js';
import { pixelRectFromPercent, type PixelRect } from './hairstyleAnalysisLayoutSlots.js';
import { normalizeHairstyleAnalysisCardTier } from './hairstyleAnalysisTemplates.js';

export type LayoutFieldKind = 'text' | 'image';

export type LayoutFieldDef = {
  id: string;
  kind: LayoutFieldKind;
  rect: PixelRect;
};

const CLIENT_IMAGE = pixelRectFromPercent('4%', '14%', '44.5%', '68.5%');
const CLIENT_NAME = pixelRectFromPercent('7%', '11%', '32%', '2.5%');
const TOP_SCORE = pixelRectFromPercent('54.7%', '16%', '9.7%', '5.8%');
const RATING = pixelRectFromPercent('69.3%', '16%', '9.7%', '5.8%');

const SPEC_LEFT = '72%';
const SPEC_WIDTH = '21%';
const SPEC_HEIGHT = '2.3%';
const SPEC_TOPS = [24.0, 26.6, 29.2, 31.8, 34.4, 37.0, 39.6, 42.2];

function specSlot(index: number): PixelRect {
  return pixelRectFromPercent(SPEC_LEFT, `${SPEC_TOPS[index]}%`, SPEC_WIDTH, SPEC_HEIGHT);
}

function specFields(): LayoutFieldDef[] {
  const ids = [
    'specTexture',
    'specColor',
    'specLength',
    'specLace',
    'specDensity',
    'specParting',
    'specHairline',
    'specStyle',
  ] as const;
  return ids.map((id, i) => ({ id, kind: 'text' as const, rect: specSlot(i) }));
}

function whyLine(top: number): PixelRect {
  return pixelRectFromPercent('56%', `${top}%`, '38%', '2.3%');
}

function freeFields(): LayoutFieldDef[] {
  return [
    { id: 'clientName', kind: 'text', rect: CLIENT_NAME },
    { id: 'clientImage', kind: 'image', rect: CLIENT_IMAGE },
    { id: 'topScore', kind: 'text', rect: TOP_SCORE },
    { id: 'rating', kind: 'text', rect: RATING },
    ...specFields(),
    ...[0, 1, 2, 3, 4].map((i) => ({
      id: `whyLine-${i}`,
      kind: 'text' as const,
      rect: whyLine(74.5 + i * 2.5),
    })),
  ];
}

function threeMonthFields(): LayoutFieldDef[] {
  const fields: LayoutFieldDef[] = [
    { id: 'clientName', kind: 'text', rect: CLIENT_NAME },
    { id: 'clientImage', kind: 'image', rect: CLIENT_IMAGE },
    { id: 'topScore', kind: 'text', rect: TOP_SCORE },
    { id: 'rating', kind: 'text', rect: RATING },
    ...specFields(),
  ];

  const matchTops = [48.0, 60.5, 73.0];
  matchTops.forEach((blockTop, i) => {
    const prefix = `match${i + 2}`;
    fields.push({
      id: `${prefix}-thumb`,
      kind: 'image',
      rect: pixelRectFromPercent('52%', `${blockTop + 0.5}%`, '7%', '5.5%'),
    });
    const valueLeft = '60.5%';
    const valueWidth = '30%';
    const valueHeight = '1.7%';
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
        rect: pixelRectFromPercent(valueLeft, `${blockTop + offset}%`, valueWidth, valueHeight),
      });
    });
  });

  return fields;
}

function sixMonthFields(): LayoutFieldDef[] {
  const fields: LayoutFieldDef[] = [
    { id: 'clientName', kind: 'text', rect: CLIENT_NAME },
    { id: 'clientImage', kind: 'image', rect: CLIENT_IMAGE },
    { id: 'topScore', kind: 'text', rect: TOP_SCORE },
    { id: 'rating', kind: 'text', rect: RATING },
    ...specFields(),
  ];

  const altTops = [48.5, 57.0, 65.5, 74.0, 82.5];
  altTops.forEach((blockTop, i) => {
    const prefix = `portfolio-${i}`;
    fields.push({
      id: `${prefix}-thumb`,
      kind: 'image',
      rect: pixelRectFromPercent('52.2%', `${blockTop + 0.5}%`, '7%', '5.5%'),
    });
    const valueLeft = '60.5%';
    const valueWidth = '30%';
    const valueHeight = '1.6%';
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
        rect: pixelRectFromPercent(valueLeft, `${blockTop + offset}%`, valueWidth, valueHeight),
      });
    });
  });

  return fields;
}

function twelveMonthFields(): LayoutFieldDef[] {
  const fields: LayoutFieldDef[] = [
    { id: 'clientName', kind: 'text', rect: CLIENT_NAME },
    { id: 'clientImage', kind: 'image', rect: CLIENT_IMAGE },
    { id: 'topScore', kind: 'text', rect: TOP_SCORE },
    { id: 'rating', kind: 'text', rect: RATING },
    ...specFields(),
  ];

  const colLefts = [52.0, 64.5, 77.0];
  const rowTops = [34.5, 46.0, 57.5];
  let altIndex = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const prefix = `alt-${altIndex}`;
      const left = colLefts[col];
      const blockTop = rowTops[row];
      fields.push({
        id: `${prefix}-thumb`,
        kind: 'image',
        rect: pixelRectFromPercent(`${left}%`, `${blockTop + 0.5}%`, '7%', '4.5%'),
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
          rect: pixelRectFromPercent(`${left}%`, `${blockTop + offset}%`, '11%', '1.5%'),
        });
      });
      altIndex += 1;
    }
  }

  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((i) => {
    fields.push({
      id: `whyLine-${i}`,
      kind: 'text',
      rect: whyLine(70.5 + i * 1.9),
    });
  });

  return fields;
}

const FIELD_BUILDERS: Record<
  ReturnType<typeof normalizeHairstyleAnalysisCardTier>,
  () => LayoutFieldDef[]
> = {
  free: freeFields,
  three_month: threeMonthFields,
  six_month: sixMonthFields,
  twelve_month: twelveMonthFields,
};

export function getLayoutFieldsForAnalysis(analysis: FalHairstyleAnalysis): LayoutFieldDef[] {
  const tier = normalizeHairstyleAnalysisCardTier(analysis.tier);
  return FIELD_BUILDERS[tier]();
}
