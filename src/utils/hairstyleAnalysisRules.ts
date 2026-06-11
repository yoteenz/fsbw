import {
  allowedColorsForUnit,
  HAIRSTYLE_ANALYSIS_TEMPLATE_URLS,
  hexForHairColor,
  UNIT_NAMES,
} from '../data/hairstyleCatalog';
import type { PsaSelfieStylePick } from '../types/styleAnalysis';
import type {
  AnalysisLook,
  AnalysisTier,
  HairstyleAnalysis,
  TemplateSlotConfig,
  UnitName,
} from '../types/hairstyleAnalysis';

export const ADDITIONAL_LOOKS_BY_TIER: Record<AnalysisTier, number> = {
  free: 0,
  three_month: 3,
  six_month: 6,
  twelve_month: 9,
  black: 9,
};

const TOP_MATCH_LINE_SLOTS = [
  { left: '68%', top: '27.8%', width: '28%', height: '3.2%' },
  { left: '68%', top: '31.8%', width: '28%', height: '3.2%' },
  { left: '68%', top: '35.8%', width: '28%', height: '3.2%' },
  { left: '68%', top: '39.8%', width: '28%', height: '3.2%' },
];

const WHY_LINE_SLOTS_FREE = [
  { left: '68%', top: '74.5%', width: '28%', height: '2.8%' },
  { left: '68%', top: '77.8%', width: '28%', height: '2.8%' },
  { left: '68%', top: '81.1%', width: '28%', height: '2.8%' },
  { left: '68%', top: '84.4%', width: '28%', height: '2.8%' },
  { left: '68%', top: '87.7%', width: '28%', height: '2.8%' },
];

const SHARED_TOP_SLOTS: Pick<
  TemplateSlotConfig,
  'clientImage' | 'topScore' | 'rating' | 'topMatchLines'
> = {
  clientImage: { left: '5.4%', top: '14.2%', width: '47.5%', height: '68.5%' },
  topScore: { left: '72%', top: '19.2%', width: '10%', height: '3.5%' },
  rating: { left: '84%', top: '19.2%', width: '10%', height: '3.5%' },
  topMatchLines: TOP_MATCH_LINE_SLOTS,
};

function additionalRowSlots(
  startTop: number,
  count: number,
  rowGap = 10.4
): TemplateSlotConfig['additionalLooks'] {
  return Array.from({ length: count }, (_, i) => {
    const top = startTop + i * rowGap;
    return {
      image: { left: '60.2%', top: `${top}%`, width: '9.2%', height: '7.4%' },
      text: { left: '72%', top: `${top + 0.2}%`, width: '26%', height: '7.4%' },
    };
  });
}

function additionalGridSlots(
  rows: number,
  cols: number,
  originTop: number,
  rowGap: number,
  colImageLeft: number[],
  colTextLeft: number[]
): TemplateSlotConfig['additionalLooks'] {
  const slots: NonNullable<TemplateSlotConfig['additionalLooks']> = [];
  let rank = 0;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const top = originTop + r * rowGap;
      slots.push({
        image: {
          left: `${colImageLeft[c]}%`,
          top: `${top}%`,
          width: '8.5%',
          height: '6.8%',
        },
        text: {
          left: `${colTextLeft[c]}%`,
          top: `${top + 0.2}%`,
          width: '10%',
          height: '6.8%',
        },
      });
      rank += 1;
      if (rank >= rows * cols) break;
    }
  }
  return slots;
}

export const TEMPLATE_SLOTS: Record<AnalysisTier, TemplateSlotConfig> = {
  free: {
    ...SHARED_TOP_SLOTS,
    whyLines: WHY_LINE_SLOTS_FREE,
  },
  three_month: {
    ...SHARED_TOP_SLOTS,
    additionalLooks: additionalRowSlots(44.5, 3),
    whyLines: WHY_LINE_SLOTS_FREE.map((slot) => ({ ...slot, top: `${parseFloat(slot.top) + 1.5}%` })),
  },
  six_month: {
    ...SHARED_TOP_SLOTS,
    additionalLooks: additionalRowSlots(40.5, 6, 7.2),
    whyLines: WHY_LINE_SLOTS_FREE.map((slot) => ({ ...slot, top: `${parseFloat(slot.top) + 8}%` })),
  },
  twelve_month: {
    ...SHARED_TOP_SLOTS,
    additionalLooks: additionalGridSlots(3, 3, 38.5, 7.8, [5.8, 34.5, 63.2], [15.5, 44.2, 72.9]),
    whyLines: WHY_LINE_SLOTS_FREE.map((slot) => ({ ...slot, top: `${parseFloat(slot.top) + 8}%` })),
  },
  black: {
    ...SHARED_TOP_SLOTS,
    additionalLooks: additionalGridSlots(3, 3, 38.5, 7.8, [5.8, 34.5, 63.2], [15.5, 44.2, 72.9]),
    whyLines: WHY_LINE_SLOTS_FREE.map((slot) => ({ ...slot, top: `${parseFloat(slot.top) + 8}%` })),
  },
};

export function normalizeAnalysisTier(tier: AnalysisTier): Exclude<AnalysisTier, 'black'> {
  return tier === 'black' ? 'twelve_month' : tier;
}

export function resolveTemplateUrl(tier: AnalysisTier): string {
  return HAIRSTYLE_ANALYSIS_TEMPLATE_URLS[normalizeAnalysisTier(tier)];
}

export function getTemplateSlots(tier: AnalysisTier): TemplateSlotConfig {
  return TEMPLATE_SLOTS[tier];
}

export function additionalLooksLimit(tier: AnalysisTier): number {
  return ADDITIONAL_LOOKS_BY_TIER[tier];
}

export function totalLooksForTier(tier: AnalysisTier): number {
  return 1 + additionalLooksLimit(tier);
}

export type HairstyleAnalysisValidationIssue = {
  field: string;
  message: string;
};

export function isUnitName(value: string): value is UnitName {
  return UNIT_NAMES.includes(value.trim().toUpperCase() as UnitName);
}

export function validateAnalysisLook(look: AnalysisLook): HairstyleAnalysisValidationIssue[] {
  const issues: HairstyleAnalysisValidationIssue[] = [];
  const unit = look.unit.trim().toUpperCase() as UnitName;

  if (!isUnitName(unit)) {
    issues.push({ field: 'unit', message: `Unknown unit: ${look.unit}` });
    return issues;
  }

  const color = look.color.trim().toUpperCase();
  const allowed = allowedColorsForUnit(unit);
  if (!allowed.includes(color as (typeof allowed)[number])) {
    issues.push({
      field: 'color',
      message: `${color} is not allowed for ${unit}`,
    });
  }

  if (look.score < 0 || look.score > 100) {
    issues.push({ field: 'score', message: 'Score must be 0–100' });
  }

  if (look.rating < 0 || look.rating > 5) {
    issues.push({ field: 'rating', message: 'Rating must be 0–5' });
  }

  return issues;
}

export function validateHairstyleAnalysis(
  analysis: HairstyleAnalysis
): HairstyleAnalysisValidationIssue[] {
  const issues: HairstyleAnalysisValidationIssue[] = [];
  const limit = additionalLooksLimit(analysis.tier);

  issues.push(...validateAnalysisLook(analysis.topMatch));

  if (analysis.additionalLooks.length !== limit) {
    issues.push({
      field: 'additionalLooks',
      message: `Expected ${limit} additional looks for tier ${analysis.tier}, got ${analysis.additionalLooks.length}`,
    });
  }

  analysis.additionalLooks.forEach((look, index) => {
    validateAnalysisLook(look).forEach((issue) => {
      issues.push({ field: `additionalLooks[${index}].${issue.field}`, message: issue.message });
    });
  });

  const expectedTemplate = resolveTemplateUrl(analysis.tier);
  if (analysis.templateUrl !== expectedTemplate) {
    issues.push({
      field: 'templateUrl',
      message: 'Template URL does not match tier',
    });
  }

  return issues;
}

export function psaPickToAnalysisLook(pick: PsaSelfieStylePick): AnalysisLook {
  const unit = pick.unitLabel.trim().toUpperCase() as UnitName;
  const color = pick.color.trim().toUpperCase();
  const lace = pick.texture ? `${pick.texture}` : '13X6 HD LACE';
  const styling =
    pick.styling && pick.styling !== 'NONE' ? `STYLING: ${pick.styling}` : 'STYLING: NONE';

  return {
    id: `psa-pick-${pick.rank}`,
    rank: pick.rank,
    unit: isUnitName(unit) ? unit : 'NOIR',
    color,
    hex: hexForHairColor(color),
    length: pick.length.includes('INCH') ? pick.length.toUpperCase() : `${pick.length.toUpperCase()} INCHES`,
    lace: lace.includes('LACE') ? lace.toUpperCase() : `${lace.toUpperCase()} LACE`,
    density: pick.density.includes('DENSITY') ? pick.density.toUpperCase() : `${pick.density.toUpperCase()} DENSITY`,
    hairline: pick.hairline.includes('HAIRLINE')
      ? pick.hairline.toUpperCase()
      : `${pick.hairline.toUpperCase()} HAIRLINE`,
    part: pick.partSelection.includes('PART')
      ? pick.partSelection.toUpperCase()
      : `${pick.partSelection.toUpperCase()} PART`,
    styling,
    score: Math.max(70, 100 - (pick.rank - 1) * 3),
    rating: pick.stars ?? Math.max(3, 5 - Math.floor((pick.rank - 1) / 2)),
  };
}

export function buildHairstyleAnalysisFromPsaPicks(options: {
  id: string;
  clientName: string;
  tier: AnalysisTier;
  clientPreviewUrl: string;
  picks: PsaSelfieStylePick[];
  whyItWorks?: string[];
}): HairstyleAnalysis {
  const limit = additionalLooksLimit(options.tier);
  const sorted = [...options.picks].sort((a, b) => a.rank - b.rank);
  const [top, ...rest] = sorted.map(psaPickToAnalysisLook);

  return {
    id: options.id,
    clientName: options.clientName,
    tier: options.tier,
    templateUrl: resolveTemplateUrl(options.tier),
    clientPreviewUrl: options.clientPreviewUrl,
    topMatch: top,
    additionalLooks: rest.slice(0, limit),
    whyItWorks: options.whyItWorks ?? [],
    createdAt: new Date().toISOString(),
  };
}
