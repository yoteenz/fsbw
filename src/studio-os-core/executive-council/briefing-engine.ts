import type { ExecutiveBriefing, ExecutiveContribution } from './org-types';

function uniqueDepartments(contributions: ExecutiveContribution[]): string[] {
  return [...new Set(contributions.map((c) => c.department))];
}

function avgConfidence(contributions: ExecutiveContribution[]): number {
  if (contributions.length === 0) return 0;
  return Math.round(
    contributions.reduce((sum, c) => sum + c.confidencePct, 0) / contributions.length
  );
}

export function synthesizeExecutiveBriefing(
  query: string,
  contributions: ExecutiveContribution[]
): ExecutiveBriefing {
  const participants = contributions.map((c) => c.executiveName);
  const avg = avgConfidence(contributions);
  const cautious = contributions.filter((c) => c.stance === 'caution').length;
  const supportive = contributions.filter((c) => c.stance === 'support').length;

  const recommendations: string[] = [];
  const risks: string[] = [];
  const tradeoffs: string[] = [];
  const actionPlan: string[] = [];
  const expectedOutcomes: string[] = [];

  for (const c of contributions) {
    if (c.opportunities[0]) recommendations.push(`${c.executiveName}: ${c.opportunities[0]}`);
    if (c.concerns[0]) risks.push(`${c.department}: ${c.concerns[0]}`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Convene cross-functional review before committing resources');
  }
  if (risks.length === 0) {
    risks.push('Insufficient cross-functional validation — expand executive participation');
  }

  tradeoffs.push(
    cautious > supportive
      ? 'Conservative path preserves trust and capacity at the cost of near-term velocity'
      : 'Accelerated path captures opportunity with elevated operational and experience risk'
  );
  tradeoffs.push('Phased pilot balances learning speed against organizational shock');

  actionPlan.push(
    'Chief Concierge distributes unified briefing to founder for final decision',
    'Assign executive owners per affected department',
    'Define success metrics and 30-day review checkpoint',
    'Document outcome in Decision History for Memory Engine compounding'
  );

  if (/revenue|growth|increase/.test(query.toLowerCase())) {
    expectedOutcomes.push('Measured revenue lift with retention and margin guardrails');
    expectedOutcomes.push('Cross-functional alignment on sustainable growth criteria');
    actionPlan.unshift('Validate demand and unit economics before scaling spend');
  } else {
    expectedOutcomes.push('Clear executive consensus with documented dissent preserved');
    expectedOutcomes.push('Organizational memory enriched for future similar decisions');
  }

  const summary =
    `${participants.length} Digital Executives evaluated "${query}". ` +
    `Council confidence ${avg}% · ${supportive} supportive · ${cautious} cautious perspectives. ` +
    'Founder retains final authority — this is collaborative guidance, not isolated AI advice.';

  const chiefConciergeSummary =
    `Executive Briefing — ${participants.join(', ')} contributed. ` +
    `Primary recommendation: ${recommendations[0]?.replace(/^[^:]+:\s*/, '') ?? 'Proceed with phased validation'}. ` +
    `Top risk to monitor: ${risks[0]?.replace(/^[^:]+:\s*/, '') ?? 'Cross-functional misalignment'}. ` +
    'Many minds. One briefing.';

  return {
    id: `briefing-${Date.now()}`,
    query,
    createdAt: new Date().toISOString(),
    summary,
    recommendations: recommendations.slice(0, 6),
    risks: risks.slice(0, 6),
    tradeoffs,
    departmentsAffected: uniqueDepartments(contributions),
    expectedOutcomes,
    confidenceLevels: contributions.map((c) => ({
      area: c.department,
      confidencePct: c.confidencePct,
    })),
    actionPlan,
    participants,
    chiefConciergeSummary,
    contributions,
  };
}
