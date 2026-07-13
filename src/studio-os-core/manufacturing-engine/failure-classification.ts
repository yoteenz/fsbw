import type { InspectionCheckId } from './manufacturing-inspection';
import type { FactoryWorkerOutput } from './ai-factory-workers';

export const FAILURE_CLASSIFICATION_VERSION = 'failure-classification.v1';

export type FailureClass =
  | 'geometry-failure'
  | 'material-failure'
  | 'lighting-failure'
  | 'transparency-failure'
  | 'silhouette-failure'
  | 'isolation-failure'
  | 'perspective-failure'
  | 'scale-failure'
  | 'reflection-failure'
  | 'background-failure'
  | 'architecture-leakage'
  | 'prompt-drift'
  | 'model-drift'
  | 'texture-drift'
  | 'reference-drift'
  | 'organization-asset-drift'
  | 'unknown';

export type ClassifiedFailure = {
  failureClass: FailureClass;
  severity: 'critical' | 'warning' | 'info';
  jobId: string;
  assetId: string;
  inspectionCheckId: InspectionCheckId | null;
  detail: string;
  repairable: boolean;
};

const CHECK_TO_FAILURE: Partial<Record<InspectionCheckId, FailureClass>> = {
  'silhouette-match': 'silhouette-failure',
  'geometry-match': 'geometry-failure',
  'transparency-match': 'transparency-failure',
  'scale-match': 'scale-failure',
  'reflection-match': 'reflection-failure',
  'material-match': 'material-failure',
  'marble-match': 'organization-asset-drift',
  'background-clean': 'background-failure',
  'no-architecture': 'architecture-leakage',
  'no-room-fragments': 'architecture-leakage',
};

export function classifyInspectionFailures(input: {
  jobId: string;
  assetId: string;
  failedChecks: InspectionCheckId[];
  output: FactoryWorkerOutput;
}): ClassifiedFailure[] {
  const failures: ClassifiedFailure[] = [];

  for (const checkId of input.failedChecks) {
    const failureClass = CHECK_TO_FAILURE[checkId] ?? 'unknown';
    failures.push({
      failureClass,
      severity: failureClass === 'architecture-leakage' ? 'critical' : 'warning',
      jobId: input.jobId,
      assetId: input.assetId,
      inspectionCheckId: checkId,
      detail: `Failed ${checkId}`,
      repairable: true,
    });
  }

  if (input.output.errors.includes('silhouette-drift')) {
    failures.push({
      failureClass: 'silhouette-failure',
      severity: 'warning',
      jobId: input.jobId,
      assetId: input.assetId,
      inspectionCheckId: 'silhouette-match',
      detail: 'Silhouette drift detected',
      repairable: true,
    });
  }

  return failures;
}

export function classifyFailureLabel(failureClass: FailureClass): string {
  return failureClass.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
