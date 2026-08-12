import type { ForecastSignalStatus } from './types';
import type { ForecastEditionSignal, ForecastEditionSignalCategory } from './editionTypes';

/** Editorial lifecycle — distinct from legacy edition publish status. */
export type WeeklyForecastLifecycleStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'developing'
  | 'final'
  | 'archived';

export type ForecastFinalStatus =
  | 'arrived'
  | 'strengthened'
  | 'held'
  | 'cooled'
  | 'still_developing';

export type ForecastPulseType =
  | 'momentum_update'
  | 'spotted_in_the_wild'
  | 'forecast_watch'
  | 'how_to_wear_it'
  | 'forecast_check';

export type ForecastPulseStatus = 'draft' | 'published';

/** Lightweight weekly update — never a replacement forecast. */
export type ForecastPulse = {
  id: string;
  type: ForecastPulseType;
  headline: string;
  body: string;
  publishedAt: string;
  momentumChange?: ForecastSignalStatus;
  status: ForecastPulseStatus;
};

/** Supporting evidence for the ONE weekly forecast — not a separate forecast. */
export type ForecastObservation = {
  id: string;
  label: string;
  description?: string;
  category: ForecastEditionSignalCategory;
  categoryLabel: string;
  momentum: ForecastSignalStatus;
  evidenceStrength?: 'low' | 'medium' | 'high';
  displayOrder?: number;
  overlayZone?: ForecastEditionSignal['overlayZone'];
  relatedTrendReportId?: string;
  /** Maps to season signal for evidence detail — not a separate weekly forecast. */
  linkedSignalId?: string;
};

export type WeeklySlayForecastCommerceLink = {
  id: string;
  label: string;
  href: string;
  kind: 'build-a-wig' | 'shop' | 'slay-board';
};

/** Canonical weekly package — {@link ForecastEdition} implements this shape. */
export type WeeklySlayForecast = {
  id: string;
  slug: string;
  weekStart: string;
  weekEnd: string;
  headline: string;
  primaryForecastLabel: string;
  primaryForecastAction: string;
  openingLine?: string;
  closingLine?: string;
  summary: string;
  outlook: string;
  momentum: ForecastSignalStatus;
  lifecycleStatus: WeeklyForecastLifecycleStatus;
  finalStatus?: ForecastFinalStatus;
  finalStatusLabel?: string;
  broadcastVideoUrl?: string;
  broadcastPosterUrl: string;
  observations: ForecastObservation[];
  pulses: ForecastPulse[];
  relatedTrendReportIds: string[];
  commerceConnections?: WeeklySlayForecastCommerceLink[];
  publishedAt: string;
  finalizedAt?: string;
  isCurrent?: boolean;
};

export const FORECAST_PULSE_TYPE_LABELS: Record<ForecastPulseType, string> = {
  momentum_update: 'MOMENTUM UPDATE',
  spotted_in_the_wild: 'SPOTTED IN THE WILD',
  forecast_watch: 'FORECAST WATCH',
  how_to_wear_it: 'HOW TO WEAR IT',
  forecast_check: 'FORECAST CHECK',
};

export const FORECAST_FINAL_STATUS_LABELS: Record<ForecastFinalStatus, string> = {
  arrived: 'ARRIVED ↑',
  strengthened: 'STRENGTHENED ↑',
  held: 'HELD →',
  cooled: 'COOLED ↓',
  still_developing: 'STILL DEVELOPING →',
};
