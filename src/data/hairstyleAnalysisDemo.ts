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
  styling: 'FLAT IRON',
  score: 98,
  rating: 5,
};

const THREE_MONTH_ALTS: AnalysisLook[] = [
  {
    id: 'look-02',
    rank: 2,
    unit: 'SOFT WAVE',
    color: 'OFF BLACK',
    hex: hexForHairColor('OFF BLACK'),
    length: '26 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'LEFT',
    styling: 'FLAT IRON',
    score: 95,
    rating: 5,
  },
  {
    id: 'look-03',
    rank: 3,
    unit: 'BLANCO',
    color: 'PLATINUM',
    hex: hexForHairColor('PLATINUM'),
    length: '24 INCHES',
    lace: '13X6 HD',
    density: '250%',
    hairline: 'NATURAL',
    part: 'MIDDLE',
    styling: 'CRIMPS',
    score: 93,
    rating: 4.5,
  },
  {
    id: 'look-04',
    rank: 4,
    unit: 'OCEAN CURL',
    color: 'CHERRY',
    hex: hexForHairColor('CHERRY'),
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

/** Every-detail-matters rows: one facial feature + one catalog spec per sentence (verbatim in Fal prompt). */
const WHY_DETAIL_LINES = [
  "NOIR'S SILKY STRAIGHT TEXTURE FRAMES YOUR HEART-SHAPED FACE WHILE JET BLACK BRINGS OUT YOUR ALMOND-SHAPED EYES.",
  'FLAT IRON FINISH KEEPS YOUR JAWLINE SHARP WITHOUT ADDING WIDTH AT YOUR NARROWER CHIN.',
  '24 INCH LENGTH HITS MID-CHEST TO BALANCE YOUR LONGER FACE AND HIGH FOREHEAD.',
  'MIDDLE PART OPENS YOUR FOREHEAD AND LINES UP WITH YOUR NATURAL BROW SYMMETRY.',
  '250% DENSITY GIVES ENOUGH FULLNESS FOR YOUR HEART-SHAPED FACE WITHOUT OVERWHELMING YOUR FEATURES.',
];

function altsForTier(tier: AnalysisTier): AnalysisLook[] {
  if (tier === 'free') return [];
  return THREE_MONTH_ALTS.slice(0, additionalLooksLimit(tier)).map((l, i) => ({
    ...l,
    rank: i + 2,
  }));
}

export function buildKateenaDemoAnalysis(
  tier: AnalysisTier,
  clientPreviewUrl = DEMO_CLIENT_PREVIEW_URL
): HairstyleAnalysis {
  const clientName = tier === 'free' ? 'KATEENA' : 'KATEENA ARMSTRONG';
  const whyItWorks = WHY_DETAIL_LINES;

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
