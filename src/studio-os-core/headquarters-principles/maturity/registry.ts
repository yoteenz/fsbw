import type { SubsystemMaturitySeed } from '../bootstrap/seeds';
import {
  buildReadinessDimensions,
  computeReadinessScore,
  evaluateExpansionEligibility,
} from './readiness';
import { getStageIndex } from './stages';
import type { PlatformMaturityStage, SubsystemMaturityRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function buildSubsystemMaturityRecord(
  seed: SubsystemMaturitySeed,
  allSeeds: SubsystemMaturitySeed[]
): SubsystemMaturityRecord {
  const stageIndex = getStageIndex(seed.currentStage);
  const dimensions = buildReadinessDimensions({
    founderUsage: seed.founderUsage,
    companyUsage: seed.companyUsage,
    internalValidation: seed.internalValidation,
    stageIndex,
    dependencyCount: seed.dependencies.length,
    hasCodexArticle: seed.codexArticleIds.length > 0,
    hasDocs: Boolean(seed.hasDocs),
  });

  const platformReadiness = computeReadinessScore(dimensions);
  const dependencyRecords = seed.dependencies
    .map((id) => allSeeds.find((s) => s.subsystemId === id))
    .filter(Boolean)
    .map((s) =>
      buildSubsystemMaturityRecord(s!, allSeeds)
    );

  const draft: SubsystemMaturityRecord = {
    subsystemId: seed.subsystemId,
    title: seed.title,
    description: seed.description,
    currentStage: seed.currentStage,
    internalValidation: seed.internalValidation,
    founderUsage: seed.founderUsage,
    companyUsage: seed.companyUsage,
    platformReadiness,
    readinessDimensions: dimensions,
    dependencies: seed.dependencies,
    expansionEligible: false,
    expansionBlockers: [],
    codexArticleIds: seed.codexArticleIds,
    routePath: seed.routePath,
    moduleKey: seed.moduleKey,
    updatedAt: now(),
  };

  const gate = evaluateExpansionEligibility(draft, dependencyRecords);
  return {
    ...draft,
    expansionEligible: gate.eligible,
    expansionBlockers: gate.blockers,
  };
}

export function listSubsystemMaturityRecords(
  records: SubsystemMaturityRecord[]
): SubsystemMaturityRecord[] {
  return [...records].sort((a, b) => b.platformReadiness - a.platformReadiness);
}

export function getSubsystemMaturityRecord(
  records: SubsystemMaturityRecord[],
  subsystemId: string
): SubsystemMaturityRecord | undefined {
  return records.find((r) => r.subsystemId === subsystemId);
}

export function listExpansionCandidates(records: SubsystemMaturityRecord[]): SubsystemMaturityRecord[] {
  return records.filter(
    (r) =>
      r.currentStage === 'company-capability' ||
      (r.currentStage === 'founder-workflow' && r.platformReadiness >= 60)
  );
}

export function advanceSubsystemStage(
  record: SubsystemMaturityRecord,
  targetStage: PlatformMaturityStage,
  seeds: SubsystemMaturitySeed[]
): SubsystemMaturityRecord {
  const seed = seeds.find((s) => s.subsystemId === record.subsystemId);
  if (!seed) return record;
  const updatedSeed: SubsystemMaturitySeed = {
    ...seed,
    currentStage: targetStage,
    internalValidation: record.internalValidation,
    founderUsage: record.founderUsage,
    companyUsage: record.companyUsage,
  };
  return buildSubsystemMaturityRecord(updatedSeed, seeds);
}
