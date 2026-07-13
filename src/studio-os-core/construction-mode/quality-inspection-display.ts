import type { ManufacturingInspectionResult } from '../manufacturing-engine/manufacturing-inspection';
import type { ClassifiedFailure } from '../manufacturing-engine/failure-classification';
import type { TargetedRepairPlan } from '../manufacturing-engine/targeted-repair';

export const QUALITY_INSPECTION_DISPLAY_VERSION = 'quality-inspection-display.v1';

export type QualityInspectionDisplay = {
  displayVersion: typeof QUALITY_INSPECTION_DISPLAY_VERSION;
  assetId: string;
  approved: boolean;
  checks: Array<{ label: string; passed: boolean }>;
  failures: ClassifiedFailure[];
  autoRepairScheduled: boolean;
  repairPlan: TargetedRepairPlan | null;
  verdict: 'Approved' | 'Failed' | 'Repair Scheduled';
};

export function buildQualityInspectionDisplay(input: {
  inspection: ManufacturingInspectionResult;
  failures: ClassifiedFailure[];
  repairPlan: TargetedRepairPlan | null;
}): QualityInspectionDisplay {
  const checkLabels: Record<string, string> = {
    'silhouette-match': 'Silhouette',
    'geometry-match': 'Geometry',
    'transparency-match': 'Transparency',
    'scale-match': 'Scale',
    'material-match': 'Materials',
    'background-clean': 'Background',
    'no-architecture': 'Isolation',
    'marble-match': 'Marble',
  };

  const checks = input.inspection.checks.map((c) => ({
    label: checkLabels[c.checkId] ?? c.checkId,
    passed: c.passed,
  }));

  const approved = input.inspection.approved;
  const autoRepairScheduled = !approved && input.repairPlan !== null;

  return {
    displayVersion: QUALITY_INSPECTION_DISPLAY_VERSION,
    assetId: input.inspection.assetId ?? 'unknown',
    approved,
    checks,
    failures: input.failures,
    autoRepairScheduled,
    repairPlan: input.repairPlan,
    verdict: approved ? 'Approved' : autoRepairScheduled ? 'Repair Scheduled' : 'Failed',
  };
}
