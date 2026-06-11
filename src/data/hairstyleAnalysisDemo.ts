import { hexForHairColor } from './hairstyleCatalog';
import type { AnalysisLook, AnalysisTier, HairstyleAnalysis } from '../types/hairstyleAnalysis';
import { additionalLooksLimit, resolveTemplateUrl } from '../utils/hairstyleAnalysisRules';

export const DEMO_CLIENT_PREVIEW_URL = '/assets/natural front.png';

const KATEENA_TOP: AnalysisLook = {
  id: 'look-01',
  rank: 1,
  unit: 'NOIR',
  color: 'JET BLACK',
  hex: hexForHairColor('JET BLACK'),
  length: '24 INCHES',
  lace: '13X6 HD',
  density: '250%',
  hairline: 'NATURAL',
  part: 'MIDDLE',
  styling: 'SOFT FACE FRAMING LAYERS',
  score: 98,
  rating: 5,
};

const THREE_MONTH_ALTS: AnalysisLook[] = [
  {
    id: 'look-02',
    rank: 2,
    unit: 'SOFT WAVE',
    color: 'ESPRESSO',
    hex: hexForHairColor('ESPRESSO'),
    length: '26 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'LEFT',
    styling: 'LAYERS',
    score: 95,
    rating: 5,
  },
  {
    id: 'look-03',
    rank: 3,
    unit: 'BEACH WAVE',
    color: 'CHESTNUT',
    hex: hexForHairColor('CHESTNUT'),
    length: '24 INCHES',
    lace: '13X4 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'LAYERS',
    score: 93,
    rating: 4.5,
  },
  {
    id: 'look-04',
    rank: 4,
    unit: 'SOFT CURL',
    color: 'JET BLACK',
    hex: hexForHairColor('JET BLACK'),
    length: '22 INCHES',
    lace: '13X4 HD',
    density: '300%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'DEFINE',
    score: 91,
    rating: 4.5,
  },
];

const SIX_MONTH_ALTS: AnalysisLook[] = [
  THREE_MONTH_ALTS[0],
  THREE_MONTH_ALTS[1],
  THREE_MONTH_ALTS[2],
  {
    id: 'look-05',
    rank: 5,
    unit: 'OCEAN CURL',
    color: 'OFF BLACK',
    hex: hexForHairColor('OFF BLACK'),
    length: '24 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'RIGHT',
    styling: 'DEFINE',
    score: 89,
    rating: 4,
  },
  {
    id: 'look-06',
    rank: 6,
    unit: 'BLANCO',
    color: 'PLATINUM',
    hex: hexForHairColor('PLATINUM'),
    length: '20 INCHES',
    lace: '13X4 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'LAYERS',
    score: 88,
    rating: 4,
  },
  {
    id: 'look-07',
    rank: 7,
    unit: 'BEACH WAVE',
    color: 'CHESTNUT',
    hex: hexForHairColor('CHESTNUT'),
    length: '24 INCHES',
    lace: '13X4 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'LAYERS',
    score: 86,
    rating: 4,
  },
];

const TWELVE_MONTH_ALTS: AnalysisLook[] = [
  THREE_MONTH_ALTS[0],
  THREE_MONTH_ALTS[1],
  {
    id: 'look-04-12',
    rank: 3,
    unit: 'SOFT CURL',
    color: 'JET BLACK',
    hex: hexForHairColor('JET BLACK'),
    length: '22 INCHES',
    lace: '13X4 HD',
    density: '300%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'DEFINE',
    score: 92,
    rating: 4.5,
  },
  {
    id: 'look-05-12',
    rank: 4,
    unit: 'OCEAN CURL',
    color: 'OFF BLACK',
    hex: hexForHairColor('OFF BLACK'),
    length: '24 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'RIGHT',
    styling: 'DEFINE',
    score: 91,
    rating: 4,
  },
  {
    id: 'look-06-12',
    rank: 5,
    unit: 'NOIR',
    color: 'HONEY',
    hex: hexForHairColor('HONEY'),
    length: '24 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'NONE',
    score: 89,
    rating: 4,
  },
  {
    id: 'look-07-12',
    rank: 6,
    unit: 'SOFT WAVE',
    color: 'AUBURN',
    hex: hexForHairColor('AUBURN'),
    length: '26 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'LEFT',
    styling: 'LAYERS',
    score: 88,
    rating: 4,
  },
  {
    id: 'look-08-12',
    rank: 7,
    unit: 'BEACH WAVE',
    color: 'COPPER',
    hex: hexForHairColor('COPPER'),
    length: '24 INCHES',
    lace: '13X4 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'LAYERS',
    score: 87,
    rating: 4,
  },
  {
    id: 'look-09-12',
    rank: 8,
    unit: 'SOFT CURL',
    color: 'CHERRY',
    hex: hexForHairColor('CHERRY'),
    length: '22 INCHES',
    lace: '13X4 HD',
    density: '300%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'DEFINE',
    score: 86,
    rating: 4,
  },
  {
    id: 'look-10-12',
    rank: 9,
    unit: 'BLANCO',
    color: 'PLATINUM',
    hex: hexForHairColor('PLATINUM'),
    length: '24 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'DEFINE',
    score: 85,
    rating: 4,
  },
];

const WHY_FREE = [
  'BALANCES FACIAL PROPORTIONS',
  'SOFT LAYERS ADD MOVEMENT',
  'JET BLACK CREATES CONTRAST',
  'PERFECT FOR BIRTHDAY & SPECIAL OCCASIONS',
  'CREATES A LUXURY SILHOUETTE',
];

const WHY_TWELVE = [
  'BALANCES FACIAL PROPORTIONS',
  'SOFT LAYERS ADD MOVEMENT',
  'CREATES NATURAL HARMONY',
  'ENHANCES FACE SHAPE',
  'MAXIMIZES STYLING VERSATILITY',
  'CREATES A LUXURY SILHOUETTE',
  'PERFECT FOR SPECIAL OCCASIONS',
  'PHOTOGRAPHS BEAUTIFULLY',
  'HIGHLY CUSTOMIZABLE',
  'DESIGNED FOR LONG TERM WEAR',
];

function altsForTier(tier: AnalysisTier): AnalysisLook[] {
  const limit = additionalLooksLimit(tier);
  if (tier === 'twelve_month' || tier === 'black') {
    return TWELVE_MONTH_ALTS.slice(0, limit).map((l, i) => ({ ...l, rank: i + 2 }));
  }
  if (tier === 'six_month') {
    return SIX_MONTH_ALTS.slice(0, limit).map((l, i) => ({ ...l, rank: i + 2 }));
  }
  if (tier === 'three_month') {
    return THREE_MONTH_ALTS.slice(0, limit).map((l, i) => ({ ...l, rank: i + 2 }));
  }
  return [];
}

export function buildKateenaDemoAnalysis(
  tier: AnalysisTier,
  clientPreviewUrl = DEMO_CLIENT_PREVIEW_URL
): HairstyleAnalysis {
  const clientName = tier === 'twelve_month' || tier === 'black' ? 'KATEENA ARMSTRONG' : 'KATEENA';
  const whyItWorks =
    tier === 'twelve_month' || tier === 'black'
      ? WHY_TWELVE
      : tier === 'free'
        ? WHY_FREE
        : [];

  return {
    id: `kateena-demo-${tier}`,
    clientName,
    tier,
    templateUrl: resolveTemplateUrl(tier),
    clientPreviewUrl,
    topMatch: { ...KATEENA_TOP, imageUrl: clientPreviewUrl },
    additionalLooks: altsForTier(tier),
    whyItWorks,
    createdAt: new Date().toISOString(),
  };
}
