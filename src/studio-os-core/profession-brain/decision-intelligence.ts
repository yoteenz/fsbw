import type { DecisionJudgmentPattern, OrganizationProfessionBrain } from './types';

export function buildJudgmentPatternsFromBrain(brain: OrganizationProfessionBrain): DecisionJudgmentPattern[] {
  const patterns: DecisionJudgmentPattern[] = [];

  for (const entry of brain.knowledgeEntries) {
    if (entry.kind === 'judgment' || entry.kind === 'decision-logic' || entry.kind === 'exception') {
      patterns.push({
        id: `judgment-${entry.id}`,
        brainId: brain.id,
        situation: entry.title,
        reasoning: entry.why,
        professionalResponse: entry.why.startsWith('When') ? entry.why : `When ${entry.title.toLowerCase()}, I first ${entry.what}`,
        notJustProcedure: entry.what,
      });
    }
  }

  if (patterns.length === 0 && brain.knowledgeEntries.length > 0) {
    const sample = brain.knowledgeEntries[0];
    patterns.push({
      id: `judgment-default-${brain.id}`,
      brainId: brain.id,
      situation: `Professional judgment in ${brain.label}`,
      reasoning: sample.why,
      professionalResponse: sample.why || `I evaluate ${sample.title} using our documented standards — not a generic checklist.`,
      notJustProcedure: `Not: "${sample.what.slice(0, 60)}…" alone — always with reasoning.`,
    });
  }

  return patterns;
}

export function formatJudgmentForConcierge(pattern: DecisionJudgmentPattern): string {
  return `${pattern.professionalResponse}\n\nBecause: ${pattern.reasoning}`;
}
