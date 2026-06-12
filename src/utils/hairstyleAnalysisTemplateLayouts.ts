import type { AnalysisTier, TemplateFieldDef, TextSlot } from '../types/hairstyleAnalysis';

function normalizeTier(tier: AnalysisTier): Exclude<AnalysisTier, 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

/** Calibrated against Supabase templates (2048×2560, 4:5). Values only — labels are baked into PNG. */
const CLIENT_IMAGE = { left: '4%', top: '14%', width: '44.5%', height: '68.5%' };
const CLIENT_NAME: TextSlot = { left: '7%', top: '11%', width: '32%', height: '2.5%' };
const TOP_SCORE: TextSlot = { left: '56%', top: '15.8%', width: '10%', height: '3.5%' };
const RATING: TextSlot = { left: '71%', top: '15.8%', width: '12%', height: '3.5%' };

const SPEC_LEFT = '72%';
const SPEC_WIDTH = '21%';
const SPEC_HEIGHT = '2.3%';
const SPEC_TOPS = [24.0, 26.6, 29.2, 31.8, 34.4, 37.0, 39.6, 42.2];

function specSlot(index: number): TextSlot {
  return {
    left: SPEC_LEFT,
    top: `${SPEC_TOPS[index]}%`,
    width: SPEC_WIDTH,
    height: SPEC_HEIGHT,
  };
}

function specFields(): TemplateFieldDef[] {
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
  return ids.map((id, i) => ({
    id,
    label: id,
    kind: 'text' as const,
    slot: specSlot(i),
  }));
}

function whyLine(top: number): TextSlot {
  return { left: '56%', top: `${top}%`, width: '38%', height: '2.3%' };
}

function freeFields(): TemplateFieldDef[] {
  return [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topScore', label: 'Match score', kind: 'text', slot: TOP_SCORE },
    { id: 'rating', label: 'Star rating', kind: 'text', slot: RATING },
    ...specFields(),
    ...[0, 1, 2, 3, 4].map((i) => ({
      id: `whyLine-${i}`,
      label: `Why ${i + 1}`,
      kind: 'text' as const,
      slot: whyLine(74.5 + i * 2.5),
    })),
  ];
}

/** 3-month: TOP MATCH specs + MATCH 02–04 rows (thumb + 4 values each). */
function threeMonthFields(): TemplateFieldDef[] {
  const fields: TemplateFieldDef[] = [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topScore', label: 'Match score', kind: 'text', slot: TOP_SCORE },
    { id: 'rating', label: 'Star rating', kind: 'text', slot: RATING },
    ...specFields(),
  ];

  const matchTops = [48.0, 60.5, 73.0];
  matchTops.forEach((blockTop, i) => {
    const prefix = `match${i + 2}`;
    fields.push({
      id: `${prefix}-thumb`,
      label: `Match ${i + 2} thumb`,
      kind: 'image',
      slot: {
        left: '52%',
        top: `${blockTop + 0.5}%`,
        width: '7%',
        height: '5.5%',
      },
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
        label: `Match ${i + 2} ${key}`,
        kind: 'text',
        slot: {
          left: valueLeft,
          top: `${blockTop + offset}%`,
          width: valueWidth,
          height: valueHeight,
        },
      });
    });
  });

  return fields;
}

/** 6-month: TOP MATCH specs + STYLE PORTFOLIO alt 01–05 (thumb + 4 values each). */
function sixMonthFields(): TemplateFieldDef[] {
  const fields: TemplateFieldDef[] = [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topScore', label: 'Match score', kind: 'text', slot: TOP_SCORE },
    { id: 'rating', label: 'Star rating', kind: 'text', slot: RATING },
    ...specFields(),
  ];

  const altTops = [48.5, 57.0, 65.5, 74.0, 82.5];
  altTops.forEach((blockTop, i) => {
    const prefix = `portfolio-${i}`;
    fields.push({
      id: `${prefix}-thumb`,
      label: `Portfolio ${i + 1} thumb`,
      kind: 'image',
      slot: {
        left: '52.2%',
        top: `${blockTop + 0.5}%`,
        width: '7%',
        height: '5.5%',
      },
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
        label: `Portfolio ${i + 1} ${key}`,
        kind: 'text',
        slot: {
          left: valueLeft,
          top: `${blockTop + offset}%`,
          width: valueWidth,
          height: valueHeight,
        },
      });
    });
  });

  return fields;
}

/** 12-month: TOP MATCH specs + 3×3 alt grid + why lines. */
function twelveMonthFields(): TemplateFieldDef[] {
  const fields: TemplateFieldDef[] = [
    { id: 'clientName', label: 'Client name', kind: 'text', slot: CLIENT_NAME },
    { id: 'clientImage', label: 'Client preview', kind: 'image', slot: CLIENT_IMAGE },
    { id: 'topScore', label: 'Match score', kind: 'text', slot: TOP_SCORE },
    { id: 'rating', label: 'Star rating', kind: 'text', slot: RATING },
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
        label: `Alternative ${altIndex + 1} thumb`,
        kind: 'image',
        slot: {
          left: `${left}%`,
          top: `${blockTop + 0.5}%`,
          width: '7%',
          height: '4.5%',
        },
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
          label: `Alternative ${altIndex + 1} ${key}`,
          kind: 'text',
          slot: {
            left: `${left}%`,
            top: `${blockTop + offset}%`,
            width: '11%',
            height: '1.5%',
          },
        });
      });
      altIndex += 1;
    }
  }

  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((i) => {
    fields.push({
      id: `whyLine-${i}`,
      label: `Why ${i + 1}`,
      kind: 'text',
      slot: whyLine(70.5 + i * 1.9),
    });
  });

  return fields;
}

const FIELD_BUILDERS: Record<Exclude<AnalysisTier, 'black'>, () => TemplateFieldDef[]> = {
  free: freeFields,
  three_month: threeMonthFields,
  six_month: sixMonthFields,
  twelve_month: twelveMonthFields,
};

export function getTemplateFields(tier: AnalysisTier): TemplateFieldDef[] {
  return FIELD_BUILDERS[normalizeTier(tier)]();
}
