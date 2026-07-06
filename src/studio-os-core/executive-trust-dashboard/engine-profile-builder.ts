import { getOrganizationAiRedTeamProfile } from '../ai-red-team/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationQaHeadquartersProfile } from '../qa-headquarters/store';
import { getOrganizationQaInspectorProfile } from '../qa-inspector/store';
import {
  buildSystemTrustIndicators,
  computeOverallConfidence,
  computeOverallHealthScore,
  computeOverallTrustScore,
  computeTrustTrend,
} from './trust-indicator-engine';
import {
  buildDockTrustLine,
  buildExecutiveTrustSummary,
  buildTrustHistory,
} from './summary-engine';
import type { OrganizationExecutiveTrustDashboardProfile, SystemTrustIndicator } from './types';

function applyQaHeadquartersBoost(
  indicators: SystemTrustIndicator[],
  qaHq: ReturnType<typeof getOrganizationQaHeadquartersProfile>
): SystemTrustIndicator[] {
  if (!qaHq) return indicators;
  return indicators.map((ind) => {
    const hqMatch = qaHq.trustScores.find((t) => {
      const map: Partial<Record<SystemTrustIndicator['systemId'], string>> = {
        'studio-intelligence': 'studio-intelligence',
        'profession-brains': 'profession-brain',
        automations: 'automations',
        marketplace: 'marketplace',
        'expert-marketplace': 'expert-marketplace',
        documentation: 'documentation',
        integrations: 'integrations',
        security: 'security',
        performance: 'performance',
        'customer-experience': 'user-experience',
      };
      return t.systemId === map[ind.systemId];
    });
    if (!hqMatch) return ind;
    return {
      ...ind,
      trustScore: Math.round((ind.trustScore + hqMatch.scorePct) / 2),
      trend: hqMatch.trend,
      status: hqMatch.status,
    };
  });
}

export function buildOrganizationExecutiveTrustDashboardProfile(
  organizationId: string
): OrganizationExecutiveTrustDashboardProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const qaHq = getOrganizationQaHeadquartersProfile(organizationId);
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const redTeam = getOrganizationAiRedTeamProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  let indicators = buildSystemTrustIndicators(now);
  indicators = applyQaHeadquartersBoost(indicators, qaHq);

  if (confidence) {
    const brainInd = indicators.find((i) => i.systemId === 'profession-brains');
    if (brainInd) {
      brainInd.confidence = Math.round((brainInd.confidence + confidence.overallConfidenceScore) / 2);
    }
  }

  if (inspector) {
    indicators = indicators.map((ind) => {
      const relatedFindings = inspector.findings.filter((f) =>
        f.affectedSystems.some((s) => ind.label.toLowerCase().includes(s.toLowerCase().split(' ')[0]))
      );
      if (relatedFindings.length === 0) return ind;
      return { ...ind, recentIssues: Math.max(ind.recentIssues, relatedFindings.length) };
    });
  }

  if (redTeam && redTeam.criticalFindings > 0) {
    const secInd = indicators.find((i) => i.systemId === 'security');
    if (secInd) {
      secInd.riskLevel = 'high';
      secInd.recentIssues = Math.max(secInd.recentIssues, redTeam.criticalFindings);
    }
  }

  const overallTrustScore = computeOverallTrustScore(indicators);
  const overallHealthScore = computeOverallHealthScore(indicators);
  const overallConfidence = computeOverallConfidence(indicators);
  const trustTrend = computeTrustTrend(indicators);
  const executiveSummary = buildExecutiveTrustSummary(indicators, overallTrustScore, trustTrend);

  const profile: OrganizationExecutiveTrustDashboardProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallTrustScore,
    overallHealthScore,
    overallConfidence,
    trustTrend,
    systemsAtRisk: indicators.filter((i) => i.status === 'at-risk').length,
    totalRecentIssues: indicators.reduce((sum, i) => sum + i.recentIssues, 0),
    systemIndicators: indicators,
    executiveSummary,
    trustHistory: buildTrustHistory(overallTrustScore),
    dockTrustLine: '',
    trustIsFirstClassMetric: true,
    lastSyncedAt: now,
  };

  profile.dockTrustLine = buildDockTrustLine(profile);
  return profile;
}
