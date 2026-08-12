/**
 * Canonical Slay Forecast continuity asset registry — paths resolved from DB/API, not scattered in components.
 * @see api/_lib/slayForecastBroadcast/continuity.ts
 */

export type SlayForecastContinuityAssets = {
  versionSlug: string;
  versionNumber: number;
  studioMasterImage: string | null;
  restingVideo: string | null;
  restingFirstFrame: string | null;
  restingLastFrame: string | null;
  restingPoster: string | null;
  version: string;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type SlayForecastBroadcastPackageStatus =
  | 'draft'
  | 'ready_for_review'
  | 'approved'
  | 'published';

export type SlayForecastBroadcastPackage = {
  id: string;
  editionSlug: string;
  continuityVersionId: string | null;
  openingAsset: string | null;
  restingAsset: string | null;
  closingAsset: string | null;
  /** Preferred: single continuous 15s MiniMax take. */
  fullBroadcastAsset?: string | null;
  broadcastTimeline: {
    openingEnd: number;
    signals: Array<{ signalId: string; revealAt: number; emphasisAt?: number }>;
    closingStart: number;
    restingLoopDurationSec?: number;
    seamCrossfadeMs?: number;
  };
  overlayData: unknown[];
  scriptVersion: number | null;
  publishedAt: string | null;
  status?: SlayForecastBroadcastPackageStatus;
};

/** Local fallback poster when no published package exists. */
export { SLAY_FORECAST_STUDIO_POSTER } from '../../constants/slayForecastBroadcast';
