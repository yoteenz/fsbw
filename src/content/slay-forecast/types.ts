export type ForecastSignalStatus = 'emerging' | 'rising' | 'accelerating' | 'holding' | 'cooling';

export type ForecastOutcomeStatus =
  | 'confirmed'
  | 'partially-confirmed'
  | 'still-developing'
  | 'did-not-materialize';

export type ForecastSeasonStatus = 'current' | 'archived';

export type ForecastSignalCategory =
  | 'texture'
  | 'color'
  | 'lace'
  | 'style'
  | 'install'
  | 'maintenance'
  | 'customization'
  | 'culture';

export type ForecastSignalAssets = {
  hero?: string;
  thumbnail?: string;
};

export type ForecastSignal = {
  id: string;
  slug: string;
  seasonId: string;
  number: number;
  category: ForecastSignalCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  status: ForecastSignalStatus;
  assets: ForecastSignalAssets;
  reasoning: string[];
  relatedSignalIds?: string[];
  relatedTrendReportPackId?: string;
  relatedMasteryId?: string;
  relatedContentPackId?: string;
  relatedContentLabel?: string;
  publishedAt: string;
  updatedAt: string;
};

export type ForecastSecondarySignal = {
  id: string;
  title: string;
  status: ForecastSignalStatus;
  thumbnail?: string;
  /** Normalized 0–1 sparkline points for mini movement graphic. */
  sparkline?: number[];
};

export type ForecastRealityEntry = {
  id: string;
  seasonId: string;
  seasonLabel: string;
  signalTitle: string;
  originalStatus: ForecastSignalStatus;
  outcomeStatus: ForecastOutcomeStatus;
  originalLabel: string;
  currentLabel: string;
  beforeAsset?: string;
  currentAsset?: string;
  outcomeSummary?: string;
};

export type ForecastSeason = {
  id: string;
  slug: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  year: number;
  title: string;
  subtitle: string;
  descriptor: string;
  publishedAt: string;
  updatedAt: string;
  status: ForecastSeasonStatus;
  heroAsset?: string;
  signals: ForecastSignal[];
  secondarySignals: ForecastSecondarySignal[];
  forecastReality: ForecastRealityEntry[];
  relatedTrendReportPackIds?: string[];
  editorialExplainer?: string;
};
