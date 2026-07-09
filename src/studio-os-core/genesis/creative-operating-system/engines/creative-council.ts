import type { XcosBoardMeeting, XcosExecutiveBrief, XcosTradeOff } from '../types';
import { buildExecutiveBriefs } from './executive-creative-board';
import type { XcosBoardMeetingInput } from '../types';

/** Creative Council™ — synthesize executive debate into unified recommendation */
export function synthesizeCouncilRecommendation(briefs: XcosExecutiveBrief[]): string {
  const top = [...briefs].sort((a, b) => b.confidence - a.confidence)[0];
  const dissent = briefs.filter((b) => b.risks.length > 0).slice(0, 2);
  const dissentNote =
    dissent.length > 0
      ? ` Board dissent: ${dissent.map((d) => `${d.label} flags ${d.risks[0]}`).join('; ')}.`
      : '';
  return `Unified recommendation led by ${top.label}: ${top.recommendation}.${dissentNote} Founder approval required before production authorization.`;
}

export function buildCouncilTradeOffs(briefs: XcosExecutiveBrief[]): XcosTradeOff[] {
  const brand = briefs.find((b) => b.executiveId === 'brand-director');
  const audience = briefs.find((b) => b.executiveId === 'audience-director');
  const performance = briefs.find((b) => b.executiveId === 'performance-director');

  const tradeOffs: XcosTradeOff[] = [];

  if (brand && audience) {
    tradeOffs.push({
      tradeOffId: 'brand-audience',
      summary: 'Brand expression vs audience readiness',
      optionA: brand.recommendation,
      optionB: audience.recommendation,
      recommendation: 'Lead with audience readiness while preserving brand signature systems',
    });
  }

  if (performance) {
    tradeOffs.push({
      tradeOffId: 'reach-quality',
      summary: 'Reach vs creative quality',
      optionA: 'Maximize distribution velocity',
      optionB: performance.recommendation,
      recommendation: 'Prioritize quality gates before scaling distribution',
    });
  }

  return tradeOffs;
}

export function buildCouncilEvidence(briefs: XcosExecutiveBrief[]): string[] {
  return briefs.flatMap((b) => b.evidence.slice(0, 1)).slice(0, 10);
}

export function buildCouncilRisks(briefs: XcosExecutiveBrief[]): string[] {
  return [...new Set(briefs.flatMap((b) => b.risks))].slice(0, 8);
}

export function buildExpectedOutcomes(input: XcosBoardMeetingInput): string[] {
  return [
    `Audience ${input.audience} understands ${input.topic}`,
    `Goal "${input.goal}" advanced on ${input.platform}`,
    'Production Package authorized with gate discipline',
    'Creative Memory and Institute linkage preserved',
    'Reusable assets registered in Creative Economy™',
  ];
}

export function buildCouncilAgenda(input: XcosBoardMeetingInput): string[] {
  return [
    `Review opportunity: ${input.topic}`,
    'Retrieve Brand DNA™, Audience DNA™, and prior Creative Memory™',
    'Executive domain briefs and evidence review',
    'Debate risks, trade-offs, and resource requirements',
    'Synthesize Unified Creative Recommendation™',
    'Founder decision and production authorization',
  ];
}

export function buildCouncilSessionFromInput(input: XcosBoardMeetingInput): Omit<XcosBoardMeeting, 'meetingId' | 'createdAt' | 'updatedAt'> {
  const briefs = buildExecutiveBriefs(input.brandId, input.topic, input.goal, input.audience, input.blueprintId);
  const tradeOffs = buildCouncilTradeOffs(briefs);
  const risks = buildCouncilRisks(briefs);

  return {
    packageId: input.packageId,
    blueprintId: input.blueprintId,
    brandId: input.brandId,
    topic: input.topic,
    agenda: buildCouncilAgenda(input),
    executiveBriefs: briefs,
    unifiedRecommendation: synthesizeCouncilRecommendation(briefs),
    evidence: buildCouncilEvidence(briefs),
    tradeOffs,
    risks,
    expectedOutcomes: buildExpectedOutcomes(input),
    founderDecision: 'pending',
    archivedToMemory: false,
  };
}
