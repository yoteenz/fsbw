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

export type TemplateFieldKind = 'text' | 'image' | 'fadeDebug';

/** One populate target on a static template (value-only overlay). */
export type TemplateFieldDef = {
  id: string;
  label: string;
  kind: TemplateFieldKind;
  slot: TextSlot | PercentRect;
  multiline?: boolean;
};

export type SlotLayoutOverrides = Record<string, Partial<PercentRect>>;

export type TextContentOverrides = Record<string, string>;

export type TextFontStyle = {
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string | number;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: string;
};

export type TextFontStyleOverrides = Record<string, Partial<TextFontStyle>>;

/** @deprecated Use getTemplateFields() — kept for layout JSON export compatibility. */
export type AdditionalLookSlot = {
  image: PercentRect;
  text: TextSlot;
};

/** @deprecated Use getTemplateFields() */
export type TemplateSlotConfig = {
  clientImage: PercentRect;
  topScore: PercentRect;
  rating: PercentRect;
  topMatchLines: TextSlot[];
  additionalLooks?: AdditionalLookSlot[];
  whyLines: TextSlot[];
};
