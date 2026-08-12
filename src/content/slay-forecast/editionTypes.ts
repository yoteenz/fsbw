import type { ForecastOutcomeStatus, ForecastSignalStatus } from './types';
import type {
  ForecastFinalStatus,
  ForecastObservation,
  ForecastPulse,
  WeeklyForecastLifecycleStatus,
} from './weeklyForecastTypes';

/** Editorial cadence is edition-based — not hardcoded to weekly. */
export type ForecastEditionStatus = 'published' | 'current' | 'upcoming' | 'developing';

export type ForecastBroadcastPhase =
  | 'idle'
  | 'opening'
  | 'hold'
  | 'clearing'
  | 'closing'
  | 'end';

export type ForecastSignalDirection = 'rising' | 'accelerating' | 'steady' | 'cooling' | 'fading';

export type ForecastEditionSignalCategory =
  | 'texture'
  | 'color'
  | 'lace'
  | 'silhouette'
  | 'install'
  | 'styling'
  | 'part'
  | 'volume';

export type ForecastOverlayZone =
  | 'broadcast-left'
  | 'broadcast-right'
  | 'broadcast-bottom'
  | 'broadcast-top-accent';

export type ForecastRadarSignalStatus = 'early' | 'forming' | 'watching';

export type ForecastEditionSignal = {
  id: string;
  category: ForecastEditionSignalCategory;
  categoryLabel: string;
  label: string;
  value: string;
  direction: ForecastSignalDirection;
  momentum: ForecastSignalStatus;
  shortDescription?: string;
  relatedTrendReportId?: string;
  /** Maps to full ForecastSignal in linked season for detail pages. */
  linkedSignalId?: string;
  overlayZone?: ForecastOverlayZone;
  outcome?: {
    forecastLabel: string;
    observedLabel?: string;
    result: ForecastOutcomeStatus | 'hit' | 'partial' | 'early' | 'missed' | 'still-developing';
    resultLabel?: string;
  };
};

export type ForecastRadarSignal = {
  id: string;
  label: string;
  status: ForecastRadarSignalStatus;
};

export type ForecastEditionTranscript = {
  opening: string;
  closing: string;
};

export type ForecastEdition = {
  id: string;
  slug: string;
  periodStart: string;
  periodEnd: string;
  displayDate: string;
  displayPeriod: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  year: number;
  status: ForecastEditionStatus;
  headline: string;
  shortForecast: string;
  optionalSubheadline?: string;
  /** PSA broadcast MP4 — empty until founder uploads MiniMax clip. */
  broadcastVideo?: string;
  broadcastPoster: string;
  duration: number;
  openingCueEnd: number;
  forecastRevealCue: number;
  closingCue: number;
  completeCue: number;
  signals: ForecastEditionSignal[];
  radarSignals?: ForecastRadarSignal[];
  relatedTrendReportIds: string[];
  /** Linked season for full signal detail + archive continuity. */
  linkedSeasonId?: string;
  publishedAt: string;
  transcript?: ForecastEditionTranscript;
  /** Dev/demo UX fixtures — not production intelligence until approved in Trend Desk. */
  isDemoFixture?: boolean;

  /** ONE weekly editorial call — primary headline prediction. */
  primaryForecastLabel?: string;
  primaryForecastAction?: string;
  outlook?: string;
  momentum?: ForecastSignalStatus;
  lifecycleStatus?: WeeklyForecastLifecycleStatus;
  finalStatus?: ForecastFinalStatus;
  finalStatusLabel?: string;
  /** Supporting evidence — not separate forecasts. */
  observations?: ForecastObservation[];
  /** Mid-week developing coverage — never replaces the weekly forecast. */
  pulses?: ForecastPulse[];
  /** Explore dashboard one-liner — distinct from broadcast shortForecast when set. */
  dashboardSummary?: string;
  /** Caption beneath the 7-day Forecast Pulse strip. */
  weeklyPulseCaption?: string;
  /** Editorial confidence read for dashboard metrics. */
  confidenceLabel?: 'HIGH' | 'MODERATE' | 'BUILDING';
  openingLine?: string;
  closingLine?: string;
  isCurrent?: boolean;
  finalizedAt?: string;
};

export type ForecastEditionGroup = {
  id: string;
  label: string;
  year: number;
  editionIds: string[];
};
