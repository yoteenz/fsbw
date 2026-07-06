import { TRUST_DASHBOARD_SYSTEMS } from './constants';
import type { SystemTrustIndicator, TrustDashboardSystemId, TrustRiskLevel, TrustTrend } from './types';

const SYSTEM_META: Record<
  TrustDashboardSystemId,
  {
    label: string;
    trustScore: number;
    healthScore: number;
    confidence: number;
    trend: TrustTrend;
    riskLevel: TrustRiskLevel;
    recentIssues: number;
    recommendedAction: string;
  }
> = {
  'studio-intelligence': {
    label: 'Studio Intelligence™',
    trustScore: 83,
    healthScore: 86,
    confidence: 81,
    trend: 'stable',
    riskLevel: 'medium',
    recentIssues: 1,
    recommendedAction: 'Ground recommendations in Knowledge Confidence citations before next advisory.',
  },
  'profession-brains': {
    label: 'Profession Brains™',
    trustScore: 91,
    healthScore: 89,
    confidence: 88,
    trend: 'stable',
    riskLevel: 'low',
    recentIssues: 1,
    recommendedAction: 'Harmonize Legal and Tax brain boundaries · run Red Team contradiction probe.',
  },
  'knowledge-graph': {
    label: 'Knowledge Graph™',
    trustScore: 88,
    healthScore: 90,
    confidence: 86,
    trend: 'rising',
    riskLevel: 'low',
    recentIssues: 2,
    recommendedAction: 'Prune 2 orphaned nodes · sync after next brain revision.',
  },
  automations: {
    label: 'Automations™',
    trustScore: 79,
    healthScore: 76,
    confidence: 74,
    trend: 'declining',
    riskLevel: 'high',
    recentIssues: 3,
    recommendedAction: 'Resolve 2 conflicting automations · test simultaneous trigger in Digital Twin.',
  },
  marketplace: {
    label: 'Marketplace™',
    trustScore: 86,
    healthScore: 84,
    confidence: 85,
    trend: 'stable',
    riskLevel: 'low',
    recentIssues: 1,
    recommendedAction: 'Review 1 pending submission in QA Inspector before publish.',
  },
  'expert-marketplace': {
    label: 'Expert Marketplace™',
    trustScore: 92,
    healthScore: 91,
    confidence: 90,
    trend: 'rising',
    riskLevel: 'low',
    recentIssues: 0,
    recommendedAction: 'Maintain current trust compliance · no action required.',
  },
  documentation: {
    label: 'Documentation™',
    trustScore: 84,
    healthScore: 82,
    confidence: 80,
    trend: 'rising',
    riskLevel: 'medium',
    recentIssues: 3,
    recommendedAction: 'Merge duplicate onboarding guides · update 3 outdated pages.',
  },
  integrations: {
    label: 'Integrations™',
    trustScore: 76,
    healthScore: 74,
    confidence: 72,
    trend: 'declining',
    riskLevel: 'high',
    recentIssues: 2,
    recommendedAction: 'Re-register expiring OAuth token · fix dead Stripe webhook.',
  },
  security: {
    label: 'Security™',
    trustScore: 94,
    healthScore: 93,
    confidence: 92,
    trend: 'stable',
    riskLevel: 'low',
    recentIssues: 1,
    recommendedAction: 'Close reporting module permission loophole flagged by Red Team.',
  },
  'customer-experience': {
    label: 'Customer Experience™',
    trustScore: 85,
    healthScore: 83,
    confidence: 82,
    trend: 'rising',
    riskLevel: 'medium',
    recentIssues: 2,
    recommendedAction: 'Run Customer Simulation on booking flow · restore cancellation policy above fold.',
  },
  performance: {
    label: 'Performance™',
    trustScore: 81,
    healthScore: 79,
    confidence: 78,
    trend: 'stable',
    riskLevel: 'medium',
    recentIssues: 3,
    recommendedAction: 'Optimize 3 screens exceeding 2s load threshold.',
  },
  accessibility: {
    label: 'Accessibility™',
    trustScore: 82,
    healthScore: 80,
    confidence: 79,
    trend: 'rising',
    riskLevel: 'medium',
    recentIssues: 2,
    recommendedAction: 'Fix 12 assets missing alt text · keyboard navigation on time picker.',
  },
  compliance: {
    label: 'Compliance™',
    trustScore: 90,
    healthScore: 91,
    confidence: 89,
    trend: 'stable',
    riskLevel: 'low',
    recentIssues: 0,
    recommendedAction: 'Policy Engine enforced · continue quarterly compliance review.',
  },
};

function resolveStatus(trustScore: number): SystemTrustIndicator['status'] {
  if (trustScore >= 90) return 'trusted';
  if (trustScore >= 75) return 'monitoring';
  return 'at-risk';
}

function isoOffset(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export function buildSystemTrustIndicators(_now: string): SystemTrustIndicator[] {
  return TRUST_DASHBOARD_SYSTEMS.map((systemId, idx) => {
    const meta = SYSTEM_META[systemId];
    return {
      systemId,
      label: meta.label,
      trustScore: meta.trustScore,
      healthScore: meta.healthScore,
      confidence: meta.confidence,
      trend: meta.trend,
      riskLevel: meta.riskLevel,
      recentIssues: meta.recentIssues,
      lastValidation: isoOffset(idx % 3),
      lastSimulation: isoOffset(idx % 5 + 1),
      recommendedAction: meta.recommendedAction,
      status: resolveStatus(meta.trustScore),
    };
  });
}

export function computeOverallTrustScore(indicators: SystemTrustIndicator[]): number {
  const avg = indicators.reduce((sum, i) => sum + i.trustScore, 0) / indicators.length;
  return Math.round(avg);
}

export function computeOverallHealthScore(indicators: SystemTrustIndicator[]): number {
  const avg = indicators.reduce((sum, i) => sum + i.healthScore, 0) / indicators.length;
  return Math.round(avg);
}

export function computeOverallConfidence(indicators: SystemTrustIndicator[]): number {
  const avg = indicators.reduce((sum, i) => sum + i.confidence, 0) / indicators.length;
  return Math.round(avg);
}

export function computeTrustTrend(indicators: SystemTrustIndicator[]): TrustTrend {
  const declining = indicators.filter((i) => i.trend === 'declining').length;
  const rising = indicators.filter((i) => i.trend === 'rising').length;
  if (declining >= 3) return 'declining';
  if (rising >= 4) return 'rising';
  return 'stable';
}

export { SYSTEM_META, TRUST_DASHBOARD_SYSTEMS };
