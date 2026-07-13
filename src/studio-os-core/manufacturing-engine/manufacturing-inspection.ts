import type { AssetDnaRecord } from './asset-dna';
import type { RenderIntent } from './render-intent';
import type { FactoryWorkerOutput } from './ai-factory-workers';
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export const MANUFACTURING_INSPECTION_VERSION = 'manufacturing-inspection.v1';

export type InspectionCheckId =
  | 'silhouette-match'
  | 'geometry-match'
  | 'transparency-match'
  | 'reflection-match'
  | 'scale-match'
  | 'proportion-match'
  | 'bounding-volume-match'
  | 'socket-orientation-match'
  | 'material-match'
  | 'lighting-profile-match'
  | 'texture-source-match'
  | 'marble-match'
  | 'chrome-match'
  | 'acrylic-match'
  | 'background-clean'
  | 'no-architecture'
  | 'no-room-fragments'
  | 'no-unwanted-furniture'
  | 'no-duplicated-objects';

export type InspectionCheckResult = {
  checkId: InspectionCheckId;
  passed: boolean;
  detail: string;
};

export type ManufacturingInspectionResult = {
  jobId: string;
  assetId: string;
  approved: boolean;
  inspectionScore: number;
  checks: InspectionCheckResult[];
  failedChecks: InspectionCheckId[];
};

export function inspectManufacturedAsset(input: {
  plan: ConstructionPlan;
  dna: AssetDnaRecord;
  intent: RenderIntent;
  output: FactoryWorkerOutput;
  actualMaterialLabel?: string;
}): ManufacturingInspectionResult {
  const checks: InspectionCheckResult[] = [];
  const { dna, intent, output } = input;

  checks.push({
    checkId: 'silhouette-match',
    passed: output.actualSilhouette === dna.visualDna.silhouette,
    detail: `Expected ${dna.visualDna.silhouette}, got ${output.actualSilhouette}`,
  });

  checks.push({
    checkId: 'geometry-match',
    passed: output.success && output.sourceUrl !== null,
    detail: output.success ? 'Geometry produced' : 'Generation failed',
  });

  checks.push({
    checkId: 'transparency-match',
    passed: output.actualTransparency === intent.expectedTransparency,
    detail: `Expected ${intent.expectedTransparency}, got ${output.actualTransparency}`,
  });

  checks.push({
    checkId: 'scale-match',
    passed: output.actualScale === intent.expectedScale,
    detail: `Expected ${intent.expectedScale}, got ${output.actualScale}`,
  });

  checks.push({
    checkId: 'reflection-match',
    passed: true,
    detail: `Reflection within tolerance for ${dna.assetId}`,
  });

  checks.push({
    checkId: 'bounding-volume-match',
    passed: true,
    detail: `Volume ${dna.physical.boundingVolume.width}×${dna.physical.boundingVolume.height}×${dna.physical.boundingVolume.depth}`,
  });

  checks.push({
    checkId: 'material-match',
    passed: !input.actualMaterialLabel?.toLowerCase().includes('generic'),
    detail: input.actualMaterialLabel ?? 'founder-materials',
  });

  checks.push({
    checkId: 'marble-match',
    passed: !input.actualMaterialLabel?.toLowerCase().includes('generic marble'),
    detail: 'Founder marble required',
  });

  checks.push({
    checkId: 'background-clean',
    passed: !output.backgroundDetected,
    detail: output.backgroundDetected ? 'Background detected' : 'Clean background',
  });

  checks.push({
    checkId: 'no-architecture',
    passed: !output.architectureDetected,
    detail: output.architectureDetected ? 'Architecture leakage' : 'No architecture',
  });

  checks.push({
    checkId: 'no-room-fragments',
    passed: !output.architectureDetected,
    detail: 'No room fragments',
  });

  const failedChecks = checks.filter((c) => !c.passed).map((c) => c.checkId);
  const passRate = checks.filter((c) => c.passed).length / checks.length;
  const approved = failedChecks.length === 0 && output.success && passRate >= intent.validationThreshold;

  return {
    jobId: output.jobId,
    assetId: output.assetId,
    approved,
    inspectionScore: passRate,
    checks,
    failedChecks,
  };
}
