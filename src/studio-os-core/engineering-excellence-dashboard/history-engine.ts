import { EXCELLENCE_PERIOD_LABELS, EXCELLENCE_PERIODS } from './constants';
import type { ExcellencePeriod, HistoricalExcellencePoint } from './types';

const PERIOD_DELTAS: Record<ExcellencePeriod, number> = {
  daily: 0,
  weekly: 2,
  monthly: 5,
  quarterly: 11,
  yearly: 18,
  'organization-lifetime': 24,
};

const PERIOD_OFFSETS_MS: Record<ExcellencePeriod, number> = {
  daily: 86400000,
  weekly: 7 * 86400000,
  monthly: 30 * 86400000,
  quarterly: 90 * 86400000,
  yearly: 365 * 86400000,
  'organization-lifetime': 730 * 86400000,
};

export function buildHistoricalExcellence(
  overallScore: number,
  now: string
): HistoricalExcellencePoint[] {
  return EXCELLENCE_PERIODS.map((period, idx) => {
    const delta = PERIOD_DELTAS[period];
    const historicalScore = Math.max(58, overallScore - delta);
    const priorScore = idx > 0 ? Math.max(55, overallScore - PERIOD_DELTAS[EXCELLENCE_PERIODS[idx - 1] ?? period]) : historicalScore;
    const deltaFromPrior = historicalScore - priorScore;

    return {
      id: `history-${period}`,
      period,
      periodLabel: EXCELLENCE_PERIOD_LABELS[period],
      engineeringScore: historicalScore,
      deltaFromPrior,
      summary:
        deltaFromPrior > 0
          ? `Engineering quality improving — +${deltaFromPrior}% vs prior ${EXCELLENCE_PERIOD_LABELS[EXCELLENCE_PERIODS[idx - 1] ?? period]}.`
          : deltaFromPrior < 0
            ? `Quality dip detected — investigate regression and performance trends.`
            : `Stable engineering excellence maintained.`,
      recordedAt: new Date(Date.now() - PERIOD_OFFSETS_MS[period]).toISOString() || now,
    };
  });
}

export function getHistoricalPointForPeriod(
  history: HistoricalExcellencePoint[],
  period: ExcellencePeriod
): HistoricalExcellencePoint | null {
  return history.find((h) => h.period === period) ?? null;
}
