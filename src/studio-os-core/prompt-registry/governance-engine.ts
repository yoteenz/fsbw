import { buildPromptCatalog } from './prompt-catalog';
import type { PromptGovernanceFinding } from './types';

/** Prompt governance — no hidden prompt text; prompts are code. */
export function runPromptGovernanceAudit(): PromptGovernanceFinding[] {
  const findings: PromptGovernanceFinding[] = [];
  const catalog = buildPromptCatalog();

  const unregistered = catalog.filter((p) => !p.registered);
  if (unregistered.length > 0) {
    findings.push({
      id: 'unregistered-prompts',
      severity: 'critical',
      message: `${unregistered.length} prompt(s) not registered — AI must not execute hidden text.`,
      recommendation: 'Register all prompts via registerPrompt() before deployment.',
    });
  }

  const noOwner = catalog.filter((p) => !p.owner || p.owner === 'Unknown');
  if (noOwner.length > 0) {
    findings.push({
      id: 'missing-owner',
      severity: 'warning',
      message: `${noOwner.length} prompt(s) missing owner assignment.`,
      recommendation: 'Assign department owner for accountability and version approval.',
    });
  }

  const draftActive = catalog.filter((p) => p.status === 'draft' && p.qualityScorePct >= 85);
  for (const p of draftActive) {
    findings.push({
      id: `draft-ready-${p.promptId}`,
      severity: 'info',
      promptId: p.promptId,
      message: `${p.name} is draft but quality score ${p.qualityScorePct}% — ready for approval.`,
      recommendation: 'Run prompt test and submit for version approval.',
    });
  }

  const lowQuality = catalog.filter((p) => p.qualityScorePct < 75 && p.status === 'active');
  for (const p of lowQuality) {
    findings.push({
      id: `low-quality-${p.promptId}`,
      severity: 'warning',
      promptId: p.promptId,
      message: `${p.name} quality score ${p.qualityScorePct}% below threshold.`,
      recommendation: 'Review version history and run prompt testing before production use.',
    });
  }

  const noFallback = catalog.filter((p) => p.promptType === 'system' && !p.fallbackPromptId && p.status === 'active');
  if (noFallback.length > 3) {
    findings.push({
      id: 'missing-fallbacks',
      severity: 'info',
      message: `${noFallback.length} active system prompts without fallback prompt defined.`,
      recommendation: 'Define fallbackPromptId for graceful degradation via Model Orchestrator.',
    });
  }

  findings.push({
    id: 'first-class-prompts',
    severity: 'info',
    message: `${catalog.filter((p) => p.registered).length} registered prompts — versioned, searchable, testable.`,
    recommendation: 'Prompts are first-class platform assets — never embed hidden prompt text in features.',
  });

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function computeRegistrationCoveragePct(): number {
  const catalog = buildPromptCatalog();
  const registered = catalog.filter((p) => p.registered).length;
  return Math.round((registered / Math.max(1, catalog.length)) * 100);
}
