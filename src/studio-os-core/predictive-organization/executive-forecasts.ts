import { getOrganizationAnticipationProfile } from '../anticipation-engine/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { FORECAST_HORIZONS, FORECAST_HORIZON_LABELS } from './constants';
import type { ExecutiveForecast, OrganizationPrediction, PredictiveIntelligenceSnapshot } from './types';

function riskFromScore(score: number): ExecutiveForecast['riskLevel'] {
  if (score >= 80) return 'low';
  if (score >= 65) return 'moderate';
  if (score >= 50) return 'elevated';
  return 'high';
}

function buildForecast(
  organizationId: string,
  horizon: (typeof FORECAST_HORIZONS)[number],
  summary: string,
  probabilityPct: number,
  riskLevel: ExecutiveForecast['riskLevel']
): ExecutiveForecast {
  return {
    id: `forecast-${organizationId}-${horizon}`,
    horizon,
    label: FORECAST_HORIZON_LABELS[horizon],
    summary,
    probabilityPct,
    riskLevel,
    improvesWithLearning: true,
  };
}

export function buildExecutiveForecasts(
  organizationId: string,
  snapshots: PredictiveIntelligenceSnapshot[],
  predictions: OrganizationPrediction[]
): ExecutiveForecast[] {
  const pulse = getOrganizationPulseProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const anticipation = getOrganizationAnticipationProfile(organizationId);

  const revenue = snapshots.find((s) => s.domain === 'revenue-trends');
  const seasonality = snapshots.find((s) => s.domain === 'seasonality');
  const criticalCount = predictions.filter((p) => p.severity === 'critical' || p.severity === 'high').length;

  const forecasts: ExecutiveForecast[] = [
    buildForecast(
      organizationId,
      '30-day',
      seasonality?.trend === 'rising'
        ? 'Our busiest quarter begins in approximately 30 days — capacity planning recommended.'
        : `30-day outlook stable · organization pulse ${pulse?.overallPulseScore ?? 72}%.`,
      seasonality?.trend === 'rising' ? 82 : pulse?.overallPulseScore ?? 72,
      riskFromScore(pulse?.overallPulseScore ?? 72)
    ),
    buildForecast(
      organizationId,
      '90-day',
      predictions.find((p) => p.category === 'hiring')
        ? '90-day forecast: hiring likely within 60 days · department capacity expansion probable.'
        : '90-day trajectory aligned with historical growth patterns — monitor marketing and customer signals.',
      74,
      criticalCount >= 2 ? 'elevated' : 'moderate'
    ),
    buildForecast(
      organizationId,
      'annual',
      revenue
        ? `Annual outlook: revenue trend ${revenue.trend} · ${revenue.summary.slice(0, 60)}…`
        : 'Annual outlook building from first year of organizational intelligence.',
      revenue?.confidencePct ?? 70,
      'moderate'
    ),
    buildForecast(
      organizationId,
      'growth-probability',
      pulse && pulse.overallPulseScore >= 75
        ? `Growth probability ${Math.min(88, pulse.overallPulseScore + 8)}% — momentum indicators favorable.`
        : 'Growth probability moderate — address weak health areas to unlock acceleration.',
      Math.min(88, (pulse?.overallPulseScore ?? 68) + 5),
      riskFromScore(pulse?.overallPulseScore ?? 68)
    ),
    buildForecast(
      organizationId,
      'risk-forecast',
      criticalCount > 0
        ? `${criticalCount} high-severity prediction(s) active — risk forecast elevated.`
        : 'Risk forecast low — no critical predictions in current window.',
      Math.max(40, 100 - criticalCount * 15),
      criticalCount >= 2 ? 'high' : criticalCount === 1 ? 'elevated' : 'low'
    ),
    buildForecast(
      organizationId,
      'department-readiness',
      health
        ? `Department readiness ${health.executiveHealthScore}% · ${health.weakAreas[0]?.label ?? 'all areas stable'}.`
        : 'Department readiness baseline established from health index.',
      health?.executiveHealthScore ?? 72,
      riskFromScore(health?.executiveHealthScore ?? 72)
    ),
    buildForecast(
      organizationId,
      'automation-readiness',
      anticipation
        ? `Automation readiness ${Math.min(90, anticipation.preparationsReady * 12 + 40)}% · ${anticipation.preparationsReady} preparations ready.`
        : 'Automation readiness emerging from workflow pattern analysis.',
      Math.min(90, (anticipation?.preparationsReady ?? 2) * 12 + 40),
      'moderate'
    ),
    buildForecast(
      organizationId,
      'knowledge-expansion',
      confidence
        ? `Knowledge expansion ${confidence.overallConfidenceScore}% confidence · ${confidence.brainsNeedingTeaching} brain(s) need teaching.`
        : 'Knowledge expansion tracked through Profession Brain maturity.',
      confidence?.overallConfidenceScore ?? 73,
      confidence && confidence.brainsNeedingTeaching > 0 ? 'elevated' : 'low'
    ),
  ];

  return FORECAST_HORIZONS.map(
    (horizon) => forecasts.find((f) => f.horizon === horizon) ?? buildForecast(organizationId, horizon, 'Forecast building…', 65, 'moderate')
  );
}

export function summarizeExecutiveForecasts(forecasts: ExecutiveForecast[]): string {
  const thirty = forecasts.find((f) => f.horizon === '30-day');
  const risk = forecasts.find((f) => f.horizon === 'risk-forecast');
  return [thirty?.summary, risk ? `Risk: ${risk.riskLevel.toUpperCase()}.` : ''].filter(Boolean).join(' ');
}
