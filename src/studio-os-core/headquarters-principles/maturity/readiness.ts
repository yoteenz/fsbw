import {
  PLATFORM_EXPANSION_MIN_STAGE_INDEX,
  PLATFORM_EXPANSION_READINESS_THRESHOLD,
} from '../constants';
import { PLATFORM_MATURITY_STAGE_LABELS, getStageIndex } from './stages';
import type {
  InternalValidationStatus,
  ReadinessDimensionId,
  ReadinessDimensionScore,
  SubsystemMaturityRecord,
  UsageLevel,
} from '../types';

export const READINESS_DIMENSION_DEFS: Array<{
  id: ReadinessDimensionId;
  label: string;
  weight: number;
}> = [
  { id: 'founder-adoption', label: 'Founder adoption', weight: 15 },
  { id: 'daily-usage', label: 'Daily usage', weight: 15 },
  { id: 'business-impact', label: 'Business impact', weight: 12 },
  { id: 'technical-stability', label: 'Technical stability', weight: 14 },
  { id: 'architectural-completeness', label: 'Architectural completeness', weight: 12 },
  { id: 'integration-quality', label: 'Integration quality', weight: 12 },
  { id: 'user-delight', label: 'User delight', weight: 10 },
  { id: 'documentation-completeness', label: 'Documentation completeness', weight: 10 },
];

const USAGE_SCORE: Record<UsageLevel, number> = {
  none: 10,
  occasional: 45,
  daily: 78,
  embedded: 95,
};

const VALIDATION_SCORE: Record<InternalValidationStatus, number> = {
  pending: 20,
  'in-progress': 55,
  passed: 92,
  failed: 15,
};

export function buildReadinessDimensions(input: {
  founderUsage: UsageLevel;
  companyUsage: UsageLevel;
  internalValidation: InternalValidationStatus;
  stageIndex: number;
  dependencyCount: number;
  hasCodexArticle: boolean;
  hasDocs: boolean;
}): ReadinessDimensionScore[] {
  const stageBoost = input.stageIndex * 8;
  const integrationPenalty = Math.min(25, input.dependencyCount * 4);

  return READINESS_DIMENSION_DEFS.map((def) => {
    let score = 40 + stageBoost;

    switch (def.id) {
      case 'founder-adoption':
        score = USAGE_SCORE[input.founderUsage];
        break;
      case 'daily-usage':
        score = Math.round((USAGE_SCORE[input.founderUsage] + USAGE_SCORE[input.companyUsage]) / 2);
        break;
      case 'business-impact':
        score = 35 + stageBoost + (input.companyUsage === 'embedded' ? 20 : 0);
        break;
      case 'technical-stability':
        score = VALIDATION_SCORE[input.internalValidation];
        break;
      case 'architectural-completeness':
        score = 30 + stageBoost + (input.hasCodexArticle ? 15 : 0);
        break;
      case 'integration-quality':
        score = Math.max(20, 70 - integrationPenalty + stageBoost / 2);
        break;
      case 'user-delight':
        score = 35 + stageBoost + (input.founderUsage === 'embedded' ? 25 : 10);
        break;
      case 'documentation-completeness':
        score = input.hasDocs ? 55 + stageBoost : 25 + stageBoost / 2;
        break;
      default:
        break;
    }

    return {
      id: def.id,
      label: def.label,
      score: Math.min(100, Math.max(0, Math.round(score))),
      weight: def.weight,
    };
  });
}

export function computeReadinessScore(dimensions: ReadinessDimensionScore[]): number {
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  return Math.round(weighted / totalWeight);
}

export function evaluateExpansionEligibility(
  record: SubsystemMaturityRecord,
  dependencyRecords: SubsystemMaturityRecord[]
): { eligible: boolean; blockers: string[] } {
  const blockers: string[] = [];

  if (getStageIndex(record.currentStage) < PLATFORM_EXPANSION_MIN_STAGE_INDEX) {
    blockers.push(
      `Must reach ${PLATFORM_MATURITY_STAGE_LABELS['company-capability']} before external expansion.`
    );
  }

  if (record.platformReadiness < PLATFORM_EXPANSION_READINESS_THRESHOLD) {
    blockers.push(
      `Readiness score ${record.platformReadiness} is below constitutional threshold ${PLATFORM_EXPANSION_READINESS_THRESHOLD}.`
    );
  }

  if (record.internalValidation !== 'passed') {
    blockers.push('Internal validation must pass before platform expansion.');
  }

  if (record.founderUsage === 'none' || record.founderUsage === 'occasional') {
    blockers.push('Founder usage must be daily or embedded.');
  }

  for (const depId of record.dependencies) {
    const dep = dependencyRecords.find((d) => d.subsystemId === depId);
    if (!dep) {
      blockers.push(`Missing dependency record: ${depId}`);
      continue;
    }
    if (getStageIndex(dep.currentStage) < 1) {
      blockers.push(`Dependency ${dep.title} has not reached Founder Workflow.`);
    }
  }

  return { eligible: blockers.length === 0, blockers };
}

export function getLowestReadinessDimension(
  dimensions: ReadinessDimensionScore[]
): ReadinessDimensionScore | undefined {
  return [...dimensions].sort((a, b) => a.score - b.score)[0];
}
