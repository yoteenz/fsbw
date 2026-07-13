import type { AssetDnaRecord } from './asset-dna';
import type { TargetedRepairPlan } from './targeted-repair';
import { planTargetedRepair } from './targeted-repair';
import type { ClassifiedFailure } from './failure-classification';

export const IMMUNE_DNA_REPAIR_VERSION = 'immune-dna-repair.v1';

export type DnaDriftEntry = {
  attribute: string;
  expected: string;
  actual: string;
  severity: 'critical' | 'warning';
};

export type DnaDiffResult = {
  assetId: string;
  hasDrift: boolean;
  entries: DnaDriftEntry[];
};

export type ImmuneDnaRepairDecision = {
  assetId: string;
  drift: DnaDriftEntry;
  repairAttribute: string;
  targetedPlan: TargetedRepairPlan;
  manufactureReplacement: boolean;
  roomRemainsOperational: true;
  blueprintAuthoritative: true;
};

export function diffExpectedVsActualDna(input: {
  expected: AssetDnaRecord;
  actual: Partial<{
    silhouette: string;
    transparency: string;
    materialLabel: string;
    scale: string;
    assetRevision: string;
  }>;
}): DnaDiffResult {
  const entries: DnaDriftEntry[] = [];

  if (input.actual.silhouette && input.actual.silhouette !== input.expected.visualDna.silhouette) {
    entries.push({
      attribute: 'silhouette',
      expected: input.expected.visualDna.silhouette,
      actual: input.actual.silhouette,
      severity: 'warning',
    });
  }

  if (input.actual.transparency && input.actual.transparency !== input.expected.visualDna.transparency) {
    entries.push({
      attribute: 'transparency',
      expected: input.expected.visualDna.transparency,
      actual: input.actual.transparency,
      severity: 'critical',
    });
  }

  if (input.actual.materialLabel?.toLowerCase().includes('generic')) {
    entries.push({
      attribute: 'material',
      expected: input.expected.materialIds.join(','),
      actual: input.actual.materialLabel,
      severity: 'critical',
    });
  }

  if (input.actual.assetRevision && input.actual.assetRevision !== input.expected.assetRevision) {
    entries.push({
      attribute: 'asset-revision',
      expected: input.expected.assetRevision,
      actual: input.actual.assetRevision,
      severity: 'critical',
    });
  }

  return {
    assetId: input.expected.assetId,
    hasDrift: entries.length > 0,
    entries,
  };
}

export function planImmuneDnaRecovery(input: {
  dnaDiff: DnaDiffResult;
  failures: ClassifiedFailure[];
}): ImmuneDnaRepairDecision[] {
  if (!input.dnaDiff.hasDrift && input.failures.length === 0) return [];

  const decisions: ImmuneDnaRepairDecision[] = [];

  for (const drift of input.dnaDiff.entries) {
    const failure: ClassifiedFailure = {
      failureClass:
        drift.attribute === 'silhouette'
          ? 'silhouette-failure'
          : drift.attribute === 'material'
            ? 'organization-asset-drift'
            : drift.attribute === 'transparency'
              ? 'transparency-failure'
              : 'unknown',
      severity: drift.severity,
      jobId: 'immune',
      assetId: input.dnaDiff.assetId,
      inspectionCheckId: null,
      detail: `${drift.attribute} drift`,
      repairable: true,
    };
    const targetedPlan = planTargetedRepair(failure);
    decisions.push({
      assetId: input.dnaDiff.assetId,
      drift,
      repairAttribute: drift.attribute,
      targetedPlan,
      manufactureReplacement: targetedPlan.fullRegenerationRequired,
      roomRemainsOperational: true,
      blueprintAuthoritative: true,
    });
  }

  return decisions;
}

export function formatImmuneDnaQuery(assetId: string): string {
  return `Expected DNA vs Actual DNA for ${assetId}?`;
}
