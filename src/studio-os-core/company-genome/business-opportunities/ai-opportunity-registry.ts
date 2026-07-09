import type { AiHorizon, AiOpportunity } from '../business-types';

export function listAiOpportunities(opportunities: AiOpportunity[]): AiOpportunity[] {
  return [...opportunities].sort((a, b) => b.readinessScore - a.readinessScore);
}

export function getAiOpportunity(opportunities: AiOpportunity[], id: string): AiOpportunity | null {
  return opportunities.find((o) => o.id === id) ?? null;
}

export function getAiOpportunitiesByHorizon(opportunities: AiOpportunity[], horizon: AiHorizon): AiOpportunity[] {
  return opportunities.filter((o) => o.horizon === horizon);
}

export function getAiOpportunitiesForSystem(opportunities: AiOpportunity[], systemId: string): AiOpportunity[] {
  return opportunities.filter((o) => o.systemIds.includes(systemId));
}
