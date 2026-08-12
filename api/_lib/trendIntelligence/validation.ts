import type { ForecastCallRow } from './types.js';

export class TrendIntelligenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrendIntelligenceValidationError';
  }
}

export function assertProductionPublishAllowed(params: {
  isDemo: boolean;
  evidenceSnapshotIds: string[];
  approvedBy?: string | null;
  nodeEnv?: string;
}): void {
  const env = params.nodeEnv ?? process.env.NODE_ENV ?? 'development';
  if (env !== 'production') return;

  if (params.isDemo) {
    throw new TrendIntelligenceValidationError(
      'Demo/fixture intelligence cannot be published in production.',
    );
  }

  if (!params.approvedBy) {
    throw new TrendIntelligenceValidationError('Published intelligence requires editorial approval.');
  }

  if (!params.evidenceSnapshotIds || params.evidenceSnapshotIds.length === 0) {
    throw new TrendIntelligenceValidationError(
      'Published forecast calls must reference at least one evidence snapshot.',
    );
  }
}

export function validateForecastCallForApproval(call: Pick<ForecastCallRow, 'prediction' | 'rationale'>): void {
  if (!call.prediction?.trim()) {
    throw new TrendIntelligenceValidationError('Forecast prediction is required.');
  }
  if (!call.rationale?.trim()) {
    throw new TrendIntelligenceValidationError('Forecast rationale is required.');
  }
}

export function canonicalizeSourceUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url.trim();
  }
}
