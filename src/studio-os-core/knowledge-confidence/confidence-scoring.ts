import type { OrganizationProfessionBrain } from '../profession-brain/types';
import {
  CONFIDENCE_DIMENSION_LABELS,
  CONFIDENCE_DIMENSIONS,
  LOW_DIMENSION_THRESHOLD,
} from './constants';
import type { ConfidenceDimension, DimensionScore } from './types';

function clampScore(value: number): number {
  return Math.max(35, Math.min(100, Math.round(value)));
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 365;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

function shortBrainLabel(label: string): string {
  return label.replace(/\s+Brain$/i, '').trim();
}

function scoreKnowledgeCoverage(brain: OrganizationProfessionBrain): number {
  const count = brain.knowledgeEntries.length;
  const withWhy = brain.knowledgeEntries.filter((e) => e.why.length > 20).length;
  const base = Math.min(100, 40 + count * 6);
  const whyBonus = count > 0 ? (withWhy / count) * 15 : 0;
  return clampScore(base + whyBonus);
}

function scoreDecisionConfidence(brain: OrganizationProfessionBrain): number {
  const patterns = brain.judgmentPatterns.length;
  const entries = brain.knowledgeEntries.filter((e) =>
    ['decision-logic', 'judgment', 'exception'].includes(e.kind)
  ).length;
  return clampScore(45 + patterns * 12 + entries * 4);
}

function scoreDocumentationCompleteness(
  brain: OrganizationProfessionBrain,
  humanKnowledgeCount: number
): number {
  const templates = brain.knowledgeEntries.filter((e) =>
    ['template', 'policy', 'best-practice'].includes(e.kind)
  ).length;
  return clampScore(50 + templates * 8 + humanKnowledgeCount * 5);
}

function scoreRegulatoryCurrency(brain: OrganizationProfessionBrain): number {
  const regs = brain.knowledgeEntries.filter((e) => e.kind === 'regulation');
  if (regs.length === 0) return clampScore(72 + brain.maturityPct * 0.2);
  const freshest = Math.min(...regs.map((r) => daysSince(r.updatedAt)));
  if (freshest <= 30) return clampScore(95 + regs.length);
  if (freshest <= 90) return clampScore(82);
  if (freshest <= 180) return clampScore(68);
  return clampScore(52);
}

function scoreTrainingCoverage(brain: OrganizationProfessionBrain, academyCount: number): number {
  return clampScore(48 + academyCount * 14 + brain.maturityPct * 0.25);
}

function scoreWorkflowValidation(brain: OrganizationProfessionBrain): number {
  const workflows = brain.knowledgeEntries.filter((e) =>
    ['best-practice', 'template', 'shortcut'].includes(e.kind)
  ).length;
  return clampScore(50 + workflows * 9 + brain.judgmentPatterns.length * 6);
}

function scoreAutomationReadiness(brain: OrganizationProfessionBrain): number {
  return clampScore(brain.maturityPct * 0.85 + brain.knowledgeEntries.length * 2);
}

function scoreHistoricalAccuracy(brain: OrganizationProfessionBrain): number {
  const lessons = brain.knowledgeEntries.filter((e) =>
    ['lesson', 'mistake', 'exception'].includes(e.kind)
  ).length;
  return clampScore(55 + lessons * 10);
}

function scorePracticalExperience(brain: OrganizationProfessionBrain): number {
  const intuition = brain.knowledgeEntries.filter((e) =>
    ['intuition', 'judgment', 'story'].includes(e.kind)
  ).length;
  return clampScore(50 + intuition * 8 + brain.judgmentPatterns.length * 7);
}

function scoreVersionFreshness(brain: OrganizationProfessionBrain): number {
  const days = daysSince(brain.lastEvolvedAt);
  if (days <= 14) return 98;
  if (days <= 45) return 88;
  if (days <= 90) return 76;
  if (days <= 180) return 62;
  return clampScore(48);
}

function dimensionStatus(score: number): DimensionScore['status'] {
  if (score >= 85) return 'strong';
  if (score >= LOW_DIMENSION_THRESHOLD) return 'adequate';
  return 'needs-teaching';
}

export function computeBrainDimensionScores(
  brain: OrganizationProfessionBrain,
  humanKnowledgeCount: number,
  academyCount: number
): DimensionScore[] {
  const raw: Record<ConfidenceDimension, number> = {
    'knowledge-coverage': scoreKnowledgeCoverage(brain),
    'decision-confidence': scoreDecisionConfidence(brain),
    'documentation-completeness': scoreDocumentationCompleteness(brain, humanKnowledgeCount),
    'regulatory-currency': scoreRegulatoryCurrency(brain),
    'training-coverage': scoreTrainingCoverage(brain, academyCount),
    'workflow-validation': scoreWorkflowValidation(brain),
    'automation-readiness': scoreAutomationReadiness(brain),
    'historical-accuracy': scoreHistoricalAccuracy(brain),
    'practical-experience': scorePracticalExperience(brain),
    'version-freshness': scoreVersionFreshness(brain),
  };

  return CONFIDENCE_DIMENSIONS.map((dimension) => ({
    dimension,
    label: CONFIDENCE_DIMENSION_LABELS[dimension],
    scorePct: raw[dimension],
    status: dimensionStatus(raw[dimension]),
  }));
}

export function computeOverallBrainConfidence(dimensions: DimensionScore[]): number {
  if (dimensions.length === 0) return 0;
  const avg = dimensions.reduce((s, d) => s + d.scorePct, 0) / dimensions.length;
  return Math.round(avg);
}

export function buildProfessionBrainConfidenceProfile(
  brain: OrganizationProfessionBrain,
  humanKnowledgeCount: number,
  academyCount: number
): import('./types').ProfessionBrainConfidenceProfile {
  const dimensionScores = computeBrainDimensionScores(brain, humanKnowledgeCount, academyCount);
  const sorted = dimensionScores.slice().sort((a, b) => a.scorePct - b.scorePct);

  return {
    brainId: brain.id,
    brainLabel: brain.label,
    shortLabel: shortBrainLabel(brain.label),
    overallConfidenceScore: computeOverallBrainConfidence(dimensionScores),
    dimensionScores,
    strongestDimension: sorted[sorted.length - 1]?.label ?? 'Knowledge Coverage',
    weakestDimension: sorted[0]?.label ?? 'Version Freshness',
    lastAssessedAt: new Date().toISOString(),
  };
}

export function confidenceColor(score: number): string {
  if (score >= 90) return '#16A34A';
  if (score >= 75) return '#0891B2';
  if (score >= 60) return '#CA8A04';
  return '#DC2626';
}
