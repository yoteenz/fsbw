import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildExecutiveEngineeringBrief } from './briefing-engine';
import { buildCultureCelebrations } from './culture-engine';
import {
  buildHealthPillars,
  computeOverallEngineeringScore,
} from './health-engine';
import { buildHistoricalExcellence } from './history-engine';
import { buildEngineeringKpis } from './kpi-engine';
import { buildDockExcellenceLine } from './report-engine';
import { buildManifestReconciliationMetrics } from './manifest-metrics';
import type { OrganizationEngineeringExcellenceProfile } from './types';

export function buildOrganizationEngineeringExcellenceProfile(
  organizationId: string
): OrganizationEngineeringExcellenceProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const healthPillars = buildHealthPillars(organizationId);
  const overallEngineeringScore = computeOverallEngineeringScore(healthPillars);
  const engineeringKpis = buildEngineeringKpis(organizationId, healthPillars, overallEngineeringScore);
  const executiveBrief = buildExecutiveEngineeringBrief(organizationId, healthPillars, overallEngineeringScore, now);
  const historicalExcellence = buildHistoricalExcellence(overallEngineeringScore, now);
  const cultureCelebrations = buildCultureCelebrations(healthPillars, now);

  const technicalDebtKpi = engineeringKpis.find((k) => k.kpi === 'technical-debt');
  const openRisksKpi = engineeringKpis.find((k) => k.kpi === 'open-risks');
  const criticalKpi = engineeringKpis.find((k) => k.kpi === 'critical-issues');
  const confidenceKpi = engineeringKpis.find((k) => k.kpi === 'average-release-confidence');
  const stabilityKpi = engineeringKpis.find((k) => k.kpi === 'production-stability');

  const profile: OrganizationEngineeringExcellenceProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallEngineeringScore,
    technicalDebtIndex: technicalDebtKpi ? 100 - technicalDebtKpi.numericScore : 18,
    openRisksCount: openRisksKpi ? Math.max(0, Math.round((100 - openRisksKpi.numericScore) / 8)) : 3,
    criticalIssuesCount: criticalKpi ? Math.max(0, Math.round((100 - criticalKpi.numericScore) / 12)) : 2,
    averageReleaseConfidence: confidenceKpi?.numericScore ?? 82,
    productionStabilityScore: stabilityKpi?.numericScore ?? 84,
    healthPillars,
    engineeringKpis,
    executiveBrief,
    historicalExcellence,
    cultureCelebrations,
    selectedPeriod: 'monthly',
    dockExcellenceLine: '',
    excellenceIsMindset: true,
    lastSyncedAt: now,
    manifestReconciliation: buildManifestReconciliationMetrics(),
  };

  profile.dockExcellenceLine = buildDockExcellenceLine(profile);
  return profile;
}
