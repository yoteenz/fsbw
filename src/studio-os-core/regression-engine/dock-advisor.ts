import { explainMemoryById, queryRegressionEngine } from './discovery-engine';
import { explainBrokenFeature, summarizeRegressionEngine } from './report-engine';
import {
  ensureOrganizationRegressionEngineProfile,
  getOrganizationRegressionEngineProfile,
  selectRegressionBuild,
} from './store';
import type { RegressionEngineDockAdvice } from './types';

export function resolveRegressionEngineAdvice(
  input: string,
  organizationId: string
): RegressionEngineDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationRegressionEngineProfile(organizationId) ??
    ensureOrganizationRegressionEngineProfile(organizationId);

  if (/regression|broken feature|retest|rollback|historical memory/i.test(trimmed)) {
    return {
      response: summarizeRegressionEngine(profile),
      concierge: 'Chief Concierge',
      overallRegressionScore: profile.overallRegressionScore,
      brokenFeaturesOpen: profile.brokenFeaturesOpen,
    };
  }

  if (/permission|workflow|animation|profession brain|prompt complexity/i.test(trimmed)) {
    const pattern = profile.historicalMemory.find((m) =>
      trimmed.toLowerCase().includes(m.category.replace(/-/g, ' ').split(' ')[0] ?? '')
    );
    if (pattern) {
      return { response: pattern.studioIntelligencePattern, concierge: 'Chief Concierge' };
    }
  }

  if (/recurring pattern|repeat mistake|never repeat/i.test(trimmed)) {
    const recurring = profile.historicalMemory.filter((m) => m.status === 'recurring');
    if (recurring.length > 0) {
      return {
        response: recurring.map((m) => m.studioIntelligencePattern).join(' · '),
        concierge: 'Chief Concierge',
        brokenFeaturesOpen: profile.brokenFeaturesOpen,
      };
    }
  }

  if (/rollback|production deploy|risk level/i.test(trimmed)) {
    const report = profile.buildReports.find((r) => r.riskLevel === 'critical' || r.riskLevel === 'high');
    if (report) {
      selectRegressionBuild(organizationId, report.buildId);
      return { response: report.rollbackRecommendation, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryRegressionEngine(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|regression|verify/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallRegressionScore: profile.overallRegressionScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:regression|issue|memory) (.+)/i);
  if (explainMatch) {
    const found = queryRegressionEngine(explainMatch[1], profile, 1);
    if (found[0]?.type === 'broken-feature') {
      const feature = profile.brokenFeatures.find((f) => f.id === found[0].id);
      if (feature) return { response: explainBrokenFeature(feature), concierge: 'Chief Concierge' };
    }
    if (found[0]?.type === 'memory') {
      return { response: explainMemoryById(found[0].id, profile) ?? found[0].label, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactiveRegressionSuggestion(organizationId: string): string | null {
  const profile = getOrganizationRegressionEngineProfile(organizationId);
  if (!profile) return null;
  return summarizeRegressionEngine(profile);
}

export function buildRegressionEngineOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationRegressionEngineProfile(organizationId);
  return profile.dockRegressionLine;
}
