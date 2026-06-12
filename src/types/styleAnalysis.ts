/** Shared style-analysis chart types — consult inspo chart + PSA selfie picks. */

import type { UnitId } from '../utils/productOptions';

export type StyleAnalysisComparisonTier = 1 | 4;

/** One cell in a consult or PSA comparison chart. */
export type StyleAnalysisChartCell = {
  id: string;
  /** Hero inspo match vs comparison variant. */
  role: 'inspo_match' | 'comparison';
  unitKey: UnitId;
  unitLabel: string;
  length?: string;
  density?: string;
  texture?: string;
  color?: string;
  hairline?: string;
  styling?: string;
  partSelection?: 'MIDDLE' | 'LEFT' | 'RIGHT';
  /** Rendered try-on / composite image URL when generation completes. */
  imageUrl?: string;
  /** Short label under thumb (e.g. "24\" · JET BLACK · LAYERS"). */
  subtitle?: string;
  /** Consult tier stars or PSA rank hint. */
  stars?: number;
  /** BAW deep link when ready. */
  buildAWigPath?: string;
};

export type StyleAnalysisChart = {
  kind: 'consult_inspo' | 'psa_selfie';
  title: string;
  subtitle?: string;
  /** Non-refundable consult add-on tier when applicable. */
  comparisonTier?: StyleAnalysisComparisonTier;
  cells: StyleAnalysisChartCell[];
  createdAt?: string;
};

/** PSA ranked pick — upsell-oriented unit + BAW config. */
export type PsaSelfieStylePick = {
  rank: number;
  unitKey?: UnitId;
  unitLabel: string;
  length: string;
  density: string;
  texture: string;
  color: string;
  hairline: string;
  styling: string;
  partSelection: 'MIDDLE' | 'LEFT' | 'RIGHT';
  why: string;
  buildAWigPath: string;
  stars?: number;
};

export type PsaSelfieStyleAnalysisResult = {
  clientSummary: string;
  faceShape?: string;
  undertone?: string;
  maxPicks: number;
  subscriptionTier: string | null;
  picks: PsaSelfieStylePick[];
};
