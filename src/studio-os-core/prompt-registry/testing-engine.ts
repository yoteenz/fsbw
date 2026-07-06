import { buildPromptCatalog } from './prompt-catalog';
import type { PromptTestResult, SupportedModel } from './types';

function testResult(partial: Pick<PromptTestResult, 'testId' | 'promptId' | 'promptName' | 'version'> & Partial<PromptTestResult>): PromptTestResult {
  const quality = partial.qualityScorePct ?? partial.responseQualityPct ?? 88;
  return {
    testedAt: partial.testedAt ?? new Date().toISOString(),
    responseQualityPct: partial.responseQualityPct ?? quality,
    consistencyPct: partial.consistencyPct ?? 90,
    latencyMs: partial.latencyMs ?? 820,
    costUsd: partial.costUsd ?? 0.012,
    tokenUsage: partial.tokenUsage ?? 1240,
    hallucinationRiskPct: partial.hallucinationRiskPct ?? 8,
    trustCompliancePct: partial.trustCompliancePct ?? 94,
    knowledgeCoveragePct: partial.knowledgeCoveragePct ?? 87,
    outputStructurePct: partial.outputStructurePct ?? 92,
    qualityScorePct: quality,
    model: partial.model ?? 'gpt-4o',
    passed: partial.passed ?? quality >= 80,
    ...partial,
  };
}

/** Seed prompt test results — measure quality, consistency, latency, cost, tokens. */
export function buildSeedTestResults(): PromptTestResult[] {
  const catalog = buildPromptCatalog();
  const results: PromptTestResult[] = [];

  for (const p of catalog.slice(0, 10)) {
    results.push(
      testResult({
        testId: `test-${p.promptId}-latest`,
        promptId: p.promptId,
        promptName: p.name,
        version: p.version,
        qualityScorePct: p.qualityScorePct,
        responseQualityPct: p.qualityScorePct,
        consistencyPct: Math.min(99, p.qualityScorePct + 2),
        latencyMs: 650 + Math.floor(Math.random() * 400),
        costUsd: 0.008 + Math.random() * 0.02,
        tokenUsage: 900 + Math.floor(Math.random() * 600),
        hallucinationRiskPct: Math.max(3, 100 - p.qualityScorePct),
        trustCompliancePct: Math.min(99, p.qualityScorePct + 4),
        knowledgeCoveragePct: Math.min(99, p.qualityScorePct - 2),
        outputStructurePct: Math.min(99, p.qualityScorePct + 1),
        model: p.supportedModels[0] ?? 'gpt-4o',
        testedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      })
    );
  }

  const draft = catalog.find((p) => p.status === 'draft');
  if (draft) {
    results.push(
      testResult({
        testId: `test-${draft.promptId}-failed`,
        promptId: draft.promptId,
        promptName: draft.name,
        version: draft.version,
        qualityScorePct: 62,
        responseQualityPct: 58,
        consistencyPct: 71,
        hallucinationRiskPct: 28,
        trustCompliancePct: 74,
        knowledgeCoveragePct: 65,
        outputStructurePct: 70,
        passed: false,
        model: 'gpt-4o',
      })
    );
  }

  return results.sort((a, b) => b.testedAt.localeCompare(a.testedAt));
}

export type PromptTestMetrics = {
  responseQualityPct: number;
  consistencyPct: number;
  latencyMs: number;
  costUsd: number;
  tokenUsage: number;
  hallucinationRiskPct: number;
  trustCompliancePct: number;
  knowledgeCoveragePct: number;
  outputStructurePct: number;
  qualityScorePct: number;
};

/** Simulate prompt test before deployment. */
export function runPromptTest(
  promptId: string,
  version: string,
  model: SupportedModel = 'gpt-4o'
): PromptTestResult {
  const entry = buildPromptCatalog().find((p) => p.promptId === promptId);
  const base = entry?.qualityScorePct ?? 85;
  const draftPenalty = entry?.status === 'draft' ? -15 : 0;

  const metrics: PromptTestMetrics = {
    responseQualityPct: Math.min(99, base + draftPenalty + Math.floor(Math.random() * 6)),
    consistencyPct: Math.min(99, base + draftPenalty + 2),
    latencyMs: 720 + Math.floor(Math.random() * 300),
    costUsd: 0.01 + Math.random() * 0.015,
    tokenUsage: 1100 + Math.floor(Math.random() * 500),
    hallucinationRiskPct: Math.max(4, 100 - base + draftPenalty),
    trustCompliancePct: Math.min(99, base + draftPenalty + 5),
    knowledgeCoveragePct: Math.min(99, base + draftPenalty - 3),
    outputStructurePct: Math.min(99, base + draftPenalty + 1),
    qualityScorePct: 0,
  };
  metrics.qualityScorePct = Math.round(
    (metrics.responseQualityPct +
      metrics.consistencyPct +
      metrics.trustCompliancePct +
      metrics.knowledgeCoveragePct +
      metrics.outputStructurePct -
      metrics.hallucinationRiskPct) /
      5
  );

  return testResult({
    testId: `test-${promptId}-${Date.now()}`,
    promptId,
    promptName: entry?.name ?? promptId,
    version,
    ...metrics,
    model,
    passed: metrics.qualityScorePct >= 80,
    testedAt: new Date().toISOString(),
  });
}

export function getLatestTestForPrompt(promptId: string, results: PromptTestResult[]): PromptTestResult | undefined {
  return results.find((r) => r.promptId === promptId);
}

export function computeAverageQualityScore(results: PromptTestResult[]): number {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((s, r) => s + r.qualityScorePct, 0) / results.length);
}
