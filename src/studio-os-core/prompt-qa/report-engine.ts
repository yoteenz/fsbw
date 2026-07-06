import { getOrganizationPromptRegistryProfile } from '../prompt-registry/store';
import type { PromptAuditReport, PromptQaFinding } from './types';
import { mapCategoryToSource } from './audit-engine';
import { PROMPT_SOURCE_LABELS } from './constants';

function buildVerdict(productionReady: boolean, qualityScore: number, confidence: number): string {
  if (productionReady) {
    return `Production-ready — Prompt Quality ${qualityScore}% · Estimated AI Confidence ${confidence}%. Profession Brain asset protected.`;
  }
  return `Not production-ready — Prompt Quality ${qualityScore}% · resolve conflict report and improvement suggestions before deployment.`;
}

export function buildPromptAuditReports(findings: PromptQaFinding[], organizationId: string, now: string): PromptAuditReport[] {
  const registry = getOrganizationPromptRegistryProfile(organizationId);
  const prompts = registry?.prompts ?? [];

  const promptIds = [...new Set(findings.map((f) => f.promptId))];
  const fallbackPrompts = promptIds.map((id) => {
    const fromRegistry = prompts.find((p) => p.promptId === id);
    if (fromRegistry) return fromRegistry;
    const finding = findings.find((f) => f.promptId === id)!;
    return {
      promptId: id,
      name: finding.promptName,
      category: 'system',
      qualityScorePct: 82,
    };
  });

  const auditTargets = prompts.length > 0 ? prompts.slice(0, 12) : fallbackPrompts;

  return auditTargets.map((prompt) => {
    const promptFindings = findings.filter((f) => f.promptId === prompt.promptId);
    const criticalCount = promptFindings.filter((f) => f.severity === 'critical').length;
    const warningCount = promptFindings.filter((f) => f.severity === 'warning').length;
    const source = mapCategoryToSource(prompt.category);

    const baseQuality = 'qualityScorePct' in prompt ? prompt.qualityScorePct : 82;
    const promptQualityScore = Math.max(42, Math.min(99, baseQuality - criticalCount * 10 - warningCount * 4));
    const maintainabilityScore = Math.max(45, 94 - promptFindings.filter((f) => f.issueType.includes('maintainability') || f.issueType === 'duplicate-instructions').length * 12);
    const scalabilityScore = Math.max(48, 92 - promptFindings.filter((f) => f.issueType.includes('scalability') || f.issueType === 'overly-complex-prompts').length * 10);
    const clarityScore = Math.max(50, 96 - promptFindings.filter((f) => f.issueType === 'ambiguous-instructions' || f.issueType === 'missing-context').length * 14);
    const estimatedAiConfidence = Math.max(40, Math.round((promptQualityScore + clarityScore) / 2 - criticalCount * 5));

    const conflicts = promptFindings
      .filter((f) => f.severity === 'critical' || f.issueType.includes('conflict') || f.issueType.includes('contradict'))
      .map((f) => f.conflictReport);

    const productionReady = promptQualityScore >= 80 && clarityScore >= 78 && criticalCount === 0;
    const improvements = promptFindings.slice(0, 4).map((f) => f.suggestedImprovement);

    return {
      id: `audit-${prompt.promptId}`,
      promptId: prompt.promptId,
      promptName: prompt.name,
      source,
      sourceLabel: PROMPT_SOURCE_LABELS[source],
      promptQualityScore,
      maintainabilityScore,
      scalabilityScore,
      clarityScore,
      estimatedAiConfidence,
      conflictReport: conflicts.length > 0 ? conflicts.join(' · ') : 'No critical conflicts detected in latest audit.',
      improvementSuggestions:
        improvements.length > 0 ? improvements : ['Maintain current prompt quality — re-audit after next version change.'],
      productionReady,
      qaVerdict: buildVerdict(productionReady, promptQualityScore, estimatedAiConfidence),
      findingsCount: promptFindings.length,
      auditedAt: now,
    };
  }).sort((a, b) => a.promptQualityScore - b.promptQualityScore);
}

export function summarizePromptQa(profile: {
  overallQaScore: number;
  promptsAudited: number;
  findingsOpen: number;
  promptsNotProductionReady: number;
  averageAiConfidence: number;
}): string {
  return `Prompt QA™ ${profile.overallQaScore}% overall · ${profile.promptsAudited} prompts audited · ${profile.findingsOpen} findings · ${profile.promptsNotProductionReady} not production-ready · avg AI confidence ${profile.averageAiConfidence}%.`;
}

export function buildDockQaLine(profile: {
  overallQaScore: number;
  findingsOpen: number;
  promptsNotProductionReady: number;
  auditReports: PromptAuditReport[];
}): string {
  const worst = profile.auditReports.find((r) => !r.productionReady);
  const worstLine = worst ? ` Focus: ${worst.promptName} (${worst.promptQualityScore}% quality).` : '';
  return `Prompt QA ${profile.overallQaScore}% · ${profile.findingsOpen} findings · ${profile.promptsNotProductionReady} blocked from production.${worstLine}`;
}

export function explainPromptFinding(finding: PromptQaFinding): string {
  return `${finding.description} Conflict: ${finding.conflictReport} Fix: ${finding.suggestedImprovement}`;
}

export function explainVersionChange(entry: import('./types').PromptVersionEntry): string {
  return `What changed: ${entry.whatChanged} Why: ${entry.whyChanged} Approved by: ${entry.approvedBy ?? 'Pending'} Impact: ${entry.expectedImpact} Rollback: ${entry.rollbackOption}`;
}
