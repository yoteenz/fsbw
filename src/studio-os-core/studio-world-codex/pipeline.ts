import type { CodexReadinessInput, CodexReadinessResult } from './types';

export const CODEX_PIPELINE_STAGES = [
  'Idea',
  'Exploration',
  'Architectural Evolution',
  'Codex Article™',
  'Constitution Review™',
  'World Bible™',
  'Implementation Plan™',
  'Engineering',
  'Production',
  'Post-Launch Review',
  'Codex Update™',
] as const;

export const CANONICAL_THINKING_QUESTIONS = [
  'Why should this exist?',
  "How does it strengthen Studio World's philosophy?",
  'How does it connect to existing systems?',
  'What future systems naturally evolve from it?',
  'Could this become a reusable platform capability instead of a one-off feature?',
] as const;

export function evaluateCodexReadiness(input: CodexReadinessInput): CodexReadinessResult {
  const missing: string[] = [];

  if (!input.hasArticle) missing.push('Codex Article™');
  if (!input.hasPurpose) missing.push('Purpose / why this exists');
  if (!input.hasSystemConnections) missing.push('Affected systems and dependencies');
  if (!input.hasReusableCapabilityAssessment) missing.push('Reusable capability assessment');
  if (!input.hasImplementationStrategy) missing.push('Implementation strategy');

  return {
    readyForImplementation: missing.length === 0,
    missing,
  };
}
