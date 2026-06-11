export type AnalysisTier = 'free' | 'three_month' | 'six_month' | 'twelve_month' | 'black';

export type UnitName =
  | 'NOIR'
  | 'BLANCO'
  | 'SOFT WAVE'
  | 'BEACH WAVE'
  | 'SOFT CURL'
  | 'OCEAN CURL';

export type AnalysisLook = {
  id: string;
  rank: number;
  unit: UnitName;
  color: string;
  hex: string;
  length: string;
  lace: string;
  density: string;
  hairline: string;
  part: string;
  styling: string;
  score: number;
  rating: number;
  imageUrl?: string;
};

export type HairstyleAnalysis = {
  id: string;
  clientName: string;
  tier: AnalysisTier;
  templateUrl: string;
  clientPreviewUrl: string;
  topMatch: AnalysisLook;
  additionalLooks: AnalysisLook[];
  whyItWorks: string[];
  createdAt: string;
};

export type PercentRect = {
  left: string;
  top: string;
  width: string;
  height: string;
};

export type TextSlot = {
  left: string;
  top: string;
  width?: string;
  height?: string;
};

export type AdditionalLookSlot = {
  image: PercentRect;
  text: TextSlot;
};

export type TemplateSlotConfig = {
  clientImage: PercentRect;
  topScore: PercentRect;
  rating: PercentRect;
  /** Value-only lines beside template rose bullets (no icons rendered). */
  topMatchLines: TextSlot[];
  additionalLooks?: AdditionalLookSlot[];
  /** Value-only why lines beside template bullets. */
  whyLines: TextSlot[];
};

export type SlotLayoutOverrides = Record<string, Partial<PercentRect>>;

export type TextContentOverrides = Record<string, string>;
