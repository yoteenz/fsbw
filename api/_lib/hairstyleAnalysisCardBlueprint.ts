/**
 * Code-built hairstyle analysis card — single source of truth for chrome + dynamic slots.
 * 2048×2560. Do NOT composite onto Supabase IMG_* PNGs; render chrome from this blueprint.
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

export type PanelDef = {
  id: string;
  rect: PixelRect;
  variant: 'frosted' | 'photo-frame' | 'thumb-frame';
};

export type StaticLabelDef = {
  text: string;
  rect: PixelRect;
  style: 'futura-black' | 'futura-red' | 'covered-red';
  align?: 'left' | 'center';
};

export type RoseMarkerDef = {
  id: string;
  rect: PixelRect;
};

export type CardBlueprint = {
  tier: HairstyleAnalysisCardTier;
  panels: PanelDef[];
  staticLabels: StaticLabelDef[];
  roses: RoseMarkerDef[];
  fields: LayoutFieldDef[];
};

function r(left: number, top: number, width: number, height: number): PixelRect {
  return { left, top, width, height };
}

/** Shared chrome + top-match block (all tiers). */
const CLIENT_PHOTO = r(82, 358, 911, 1754);
const CLIENT_NAME = r(143, 282, 656, 64);
const TOP_SCORE = r(1120, 410, 199, 149);
const RATING = r(1420, 410, 199, 149);

const SPEC_VALUE_LEFT = 1475;
const SPEC_VALUE_WIDTH = 430;
const SPEC_VALUE_HEIGHT = 59;
const SPEC_LABEL_LEFT = 1060;
const SPEC_LABEL_WIDTH = 400;
const SPEC_ROW_HEIGHT = 59;
const SPEC_FIRST_TOP = 615;
const SPEC_ROW_STEP = 67;

const SPEC_LABELS = [
  'TEXTURE:',
  'COLOR:',
  'LENGTH:',
  'LACE:',
  'DENSITY:',
  'PARTING:',
  'HAIRLINE:',
  'STYLE:',
] as const;

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

function specRows(): { labels: StaticLabelDef[]; fields: LayoutFieldDef[] } {
  const labels: StaticLabelDef[] = [];
  const fields: LayoutFieldDef[] = [];
  SPEC_IDS.forEach((id, i) => {
    const top = SPEC_FIRST_TOP + i * SPEC_ROW_STEP;
    labels.push({
      text: SPEC_LABELS[i]!,
      rect: r(SPEC_LABEL_LEFT, top, SPEC_LABEL_WIDTH, SPEC_ROW_HEIGHT),
      style: 'futura-black',
    });
    fields.push({ id, kind: 'text', rect: r(SPEC_VALUE_LEFT, top, SPEC_VALUE_WIDTH, SPEC_VALUE_HEIGHT) });
  });
  return { labels, fields };
}

function baseChrome(): Pick<CardBlueprint, 'panels' | 'staticLabels' | 'roses' | 'fields'> {
  const spec = specRows();
  return {
    panels: [
      { id: 'client-photo', rect: r(64, 330, 947, 1800), variant: 'photo-frame' },
      { id: 'score-panel', rect: r(1024, 300, 960, 280), variant: 'frosted' },
      { id: 'spec-panel', rect: r(1024, 590, 960, 560), variant: 'frosted' },
    ],
    staticLabels: [
      { text: 'FRONTAL SLAYER', rect: r(0, 48, CARD_CANVAS.width, 72), style: 'covered-red', align: 'center' },
      { text: 'HAIRSTYLE ANALYSIS', rect: r(0, 128, CARD_CANVAS.width, 56), style: 'futura-black', align: 'center' },
      { text: 'TOP MATCH', rect: r(1060, 548, 420, 52), style: 'futura-red' },
      { text: 'OVERALL SCORE', rect: r(1088, 348, 260, 48), style: 'futura-black' },
      { text: 'MATCH RATING', rect: r(1388, 348, 260, 48), style: 'futura-black' },
      ...spec.labels,
    ],
    roses: [{ id: 'client-pill-rose', rect: r(108, 292, 40, 40) }],
    fields: [
      { id: 'clientName', kind: 'text', rect: CLIENT_NAME },
      { id: 'clientImage', kind: 'image', rect: CLIENT_PHOTO },
      { id: 'topScore', kind: 'text', rect: TOP_SCORE },
      { id: 'rating', kind: 'text', rect: RATING },
      ...spec.fields,
    ],
  };
}

function freeBlueprint(): CardBlueprint {
  const base = baseChrome();
  const whyTops = [1907, 1971, 2035, 2099, 2163];
  const whyRoses: RoseMarkerDef[] = [];
  const whyFields: LayoutFieldDef[] = [];

  whyTops.forEach((top, i) => {
    whyRoses.push({ id: `why-rose-${i}`, rect: r(1060, top + 8, 36, 36) });
    whyFields.push({ id: `whyLine-${i}`, kind: 'text', rect: r(1108, top, 860, SPEC_ROW_HEIGHT) });
  });

  return {
    tier: 'free',
    panels: [{ id: 'why-panel', rect: r(1024, 1820, 960, 420), variant: 'frosted' }, ...base.panels],
    staticLabels: [
      ...base.staticLabels,
      { text: 'EVERY DETAIL MATTERS', rect: r(1060, 1863, 520, 40), style: 'futura-red' },
    ],
    roses: [...base.roses, ...whyRoses],
    fields: [...base.fields, ...whyFields],
  };
}

function matchRowBlock(
  prefix: string,
  matchLabel: string,
  blockTop: number
): { panels: PanelDef[]; labels: StaticLabelDef[]; fields: LayoutFieldDef[] } {
  const thumb = r(1065, blockTop + 13, 143, 141);
  const valueLeft = 1239;
  const valueWidth = 614;
  const valueHeight = 44;
  const rowLabels: Array<[string, number]> = [
    ['TEXTURE:', 26],
    ['COLOR:', 71],
    ['LENGTH:', 116],
    ['MATCH SCORE:', 161],
  ];
  const rowKeys = ['texture', 'color', 'length', 'score'] as const;

  const labels: StaticLabelDef[] = [
    { text: matchLabel, rect: r(1060, blockTop, 400, 48), style: 'futura-red' },
  ];
  const fields: LayoutFieldDef[] = [{ id: `${prefix}-thumb`, kind: 'image', rect: thumb }];

  rowLabels.forEach(([label, offset], i) => {
    labels.push({
      text: label,
      rect: r(valueLeft, blockTop + offset, 200, valueHeight),
      style: 'futura-black',
    });
    fields.push({
      id: `${prefix}-${rowKeys[i]}`,
      kind: 'text',
      rect: r(valueLeft + 210, blockTop + offset, valueWidth - 210, valueHeight),
    });
  });

  return {
    panels: [{ id: `${prefix}-panel`, rect: r(1024, blockTop - 8, 960, 280), variant: 'frosted' }],
    labels,
    fields,
  };
}

function threeMonthBlueprint(): CardBlueprint {
  const base = baseChrome();
  const blocks = [
    matchRowBlock('match2', 'MATCH 02', 1229),
    matchRowBlock('match3', 'MATCH 03', 1549),
    matchRowBlock('match4', 'MATCH 04', 1869),
  ];

  return {
    tier: 'three_month',
    panels: [...base.panels, ...blocks.flatMap((b) => b.panels)],
    staticLabels: [...base.staticLabels, ...blocks.flatMap((b) => b.labels)],
    roses: base.roses,
    fields: [...base.fields, ...blocks.flatMap((b) => b.fields)],
  };
}

function portfolioRowBlock(
  prefix: string,
  portfolioLabel: string,
  blockTop: number
): { panels: PanelDef[]; labels: StaticLabelDef[]; fields: LayoutFieldDef[] } {
  const block = matchRowBlock(prefix, portfolioLabel, blockTop);
  return block;
}

function sixMonthBlueprint(): CardBlueprint {
  const base = baseChrome();
  const tops = [1245, 1459, 1673, 1887, 2101];
  const blocks = tops.map((top, i) =>
    portfolioRowBlock(`portfolio-${i}`, `STYLE PORTFOLIO ${String(i + 1).padStart(2, '0')}`, top)
  );

  return {
    tier: 'six_month',
    panels: [...base.panels, ...blocks.flatMap((b) => b.panels)],
    staticLabels: [
      ...base.staticLabels,
      { text: 'STYLE PORTFOLIO', rect: r(1060, 1188, 480, 48), style: 'futura-red' },
      ...blocks.flatMap((b) => b.labels),
    ],
    roses: base.roses,
    fields: [...base.fields, ...blocks.flatMap((b) => b.fields)],
  };
}

function twelveMonthBlueprint(): CardBlueprint {
  const base = baseChrome();
  const colLefts = [1065, 1321, 1577];
  const rowTops = [884, 1178, 1472];
  const panels: PanelDef[] = [
    { id: 'alt-grid-panel', rect: r(1024, 850, 960, 720), variant: 'frosted' },
    { id: 'why-panel', rect: r(1024, 1600, 960, 900), variant: 'frosted' },
  ];
  const labels: StaticLabelDef[] = [
    { text: 'ALTERNATIVE MATCHES', rect: r(1060, 818, 520, 48), style: 'futura-red' },
    { text: 'EVERY DETAIL MATTERS', rect: r(1060, 1643, 520, 40), style: 'futura-red' },
  ];
  const roses: RoseMarkerDef[] = [];
  const fields: LayoutFieldDef[] = [];

  let altIndex = 0;
  for (const blockTop of rowTops) {
    for (const left of colLefts) {
      const prefix = `alt-${altIndex}`;
      fields.push({
        id: `${prefix}-thumb`,
        kind: 'image',
        rect: r(left, blockTop + 13, 143, 115),
      });
      labels.push(
        { text: 'COLOR:', rect: r(left, blockTop + 141, 120, 38), style: 'futura-black' },
        { text: 'LENGTH:', rect: r(left, blockTop + 184, 120, 38), style: 'futura-black' },
        { text: 'MATCH SCORE:', rect: r(left, blockTop + 227, 160, 38), style: 'futura-black' }
      );
      fields.push(
        { id: `${prefix}-color`, kind: 'text', rect: r(left + 125, blockTop + 141, 200, 38) },
        { id: `${prefix}-length`, kind: 'text', rect: r(left + 125, blockTop + 184, 200, 38) },
        { id: `${prefix}-score`, kind: 'text', rect: r(left + 165, blockTop + 227, 120, 38) }
      );
      altIndex += 1;
    }
  }

  const whyTops = [1715, 1790, 1865, 1940, 2015, 2090, 2165, 2240, 2315, 2390];
  whyTops.forEach((top, i) => {
    roses.push({ id: `why-rose-${i}`, rect: r(1060, top + 6, 36, 36) });
    fields.push({ id: `whyLine-${i}`, kind: 'text', rect: r(1108, top, 860, SPEC_ROW_HEIGHT) });
  });

  return {
    tier: 'twelve_month',
    panels: [...base.panels, ...panels],
    staticLabels: [...base.staticLabels, ...labels],
    roses: [...base.roses, ...roses],
    fields: [...base.fields, ...fields],
  };
}

const BLUEPRINTS: Record<HairstyleAnalysisCardTier, () => CardBlueprint> = {
  free: freeBlueprint,
  three_month: threeMonthBlueprint,
  six_month: sixMonthBlueprint,
  twelve_month: twelveMonthBlueprint,
};

export function getCardBlueprint(tier: HairstyleAnalysisCardTier): CardBlueprint {
  return BLUEPRINTS[tier]();
}

export function getCardBlueprintForAnalysis(analysis: FalHairstyleAnalysis): CardBlueprint {
  return getCardBlueprint(normalizeHairstyleAnalysisCardTier(analysis.tier));
}

export function getLayoutFieldsFromBlueprint(analysis: FalHairstyleAnalysis): LayoutFieldDef[] {
  return getCardBlueprintForAnalysis(analysis).fields;
}

export function topScoreAndRatingSlots(): { topScore: PixelRect; rating: PixelRect } {
  return { topScore: TOP_SCORE, rating: RATING };
}

/** Percent slots for React dev overlay — keep aligned with this blueprint. */
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
