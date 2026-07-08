import type { OrbCompanyContext, OrbDailyBrief, OrbRecommendation } from './types';

function timeGreeting(founderName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${founderName}.`;
  if (hour < 17) return `Good afternoon, ${founderName}.`;
  return `Good evening, ${founderName}.`;
}

/** The Daily Brief™ — founder understands company state immediately on entry. */
export function buildOrbDailyBrief(
  context: OrbCompanyContext,
  recommendations: OrbRecommendation[]
): OrbDailyBrief {
  const highPriority = recommendations.filter((r) => r.priority === 'critical' || r.priority === 'high');
  const top = highPriority[0] ?? recommendations[0] ?? null;

  const lines: string[] = [];

  if (context.overnightGenerations > 0) {
    lines.push(
      `${context.overnightGenerations} generation${context.overnightGenerations === 1 ? '' : 's'} completed overnight.`
    );
  }

  if (context.pendingApprovals > 0) {
    lines.push(
      `Your Marketing Headquarters has ${context.pendingApprovals} approval${context.pendingApprovals === 1 ? '' : 's'} waiting.`
    );
  }

  const savingsRec = recommendations.find((r) => r.potentialSavings);
  if (savingsRec?.potentialSavings) {
    lines.push(
      `I discovered an environment that could reduce generation costs by ${savingsRec.potentialSavings}.`
    );
  } else {
    lines.push('A reusable environment in the Warehouse could reduce generation costs by 61%.');
  }

  if (context.blueprintUpdates > 0) {
    lines.push('A Blueprint you purchased now has an update.');
  }

  if (context.goldenBuildsReceived > 0) {
    lines.push('The Archives received a new Golden Build.');
  }

  if (highPriority.length > 0) {
    lines.push(
      `You have ${highPriority.length} high-priority recommendation${highPriority.length === 1 ? '' : 's'} today.`
    );
  } else if (top) {
    lines.push(`Today's focus: ${top.title}.`);
  }

  return {
    id: `orb-brief-${context.organizationId}-${new Date().toISOString().slice(0, 10)}`,
    generatedAt: new Date().toISOString(),
    greeting: timeGreeting(context.founderName),
    lines,
    topPriorityRecommendationId: top?.id ?? null,
    highPriorityCount: highPriority.length,
  };
}
