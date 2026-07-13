import type { ConstructionPlan } from './construction-plan-schema';
import type { AiWorkerOutput } from './ai-worker-contract';
import { assertAssetInSocket } from './asset-socket-system';
import { assertNoGenericMaterialInvention } from './material-reference-system';

export const QUALITY_VERIFICATION_VERSION = 'quality-verification.v1';

export type QualityCheckId =
  | 'correct-size'
  | 'correct-socket'
  | 'correct-material-ids'
  | 'correct-silhouette'
  | 'correct-transparency'
  | 'correct-boundaries'
  | 'correct-scale'
  | 'correct-orientation'
  | 'correct-lighting-compatibility'
  | 'correct-geometry';

export type QualityCheckResult = {
  checkId: QualityCheckId;
  passed: boolean;
  detail: string;
};

export type QualityVerificationResult = {
  jobId: string;
  assetId: string | null;
  approved: boolean;
  checks: QualityCheckResult[];
  failedChecks: QualityCheckId[];
};

export function verifyWorkerOutputAgainstBlueprint(input: {
  plan: ConstructionPlan;
  workerOutput: AiWorkerOutput;
  expectedAssetVersion: string;
  expectedMaterialLabel?: string;
}): QualityVerificationResult {
  const checks: QualityCheckResult[] = [];
  const { plan, workerOutput, expectedAssetVersion } = input;

  checks.push({
    checkId: 'correct-socket',
    passed: workerOutput.actualSocketId === null || plan.assetSockets.some((s) => s.socketId === workerOutput.actualSocketId),
    detail: workerOutput.actualSocketId ? `Socket ${workerOutput.actualSocketId}` : 'No socket (architecture/lighting)',
  });

  if (workerOutput.actualSocketId && workerOutput.assetId) {
    const allAssets = [
      ...plan.heroAssets,
      ...plan.furnitureSet.assets,
      ...plan.decorSet.assets,
    ];
    const assetRef = allAssets.find((a) => a.assetId === workerOutput.assetId);
    const assetClass = assetRef?.assetClass ?? 'signature-landmark';
    const socketCheck = assertAssetInSocket({
      assetClass,
      socketId: workerOutput.actualSocketId,
      sockets: plan.assetSockets,
    });
    checks.push({
      checkId: 'correct-boundaries',
      passed: socketCheck.ok,
      detail: socketCheck.ok ? 'Socket compatible' : socketCheck.reason,
    });
  }

  checks.push({
    checkId: 'correct-scale',
    passed: workerOutput.actualVersion === expectedAssetVersion,
    detail: `Expected ${expectedAssetVersion}, got ${workerOutput.actualVersion}`,
  });

  const materialIdsMatch = workerOutput.actualMaterialIds.every((id) =>
    plan.materialSet.materialIds.includes(id as import('../studio-world-architecture-v2/material-library').StudioWorldMaterialId)
  );
  checks.push({
    checkId: 'correct-material-ids',
    passed: materialIdsMatch,
    detail: materialIdsMatch ? 'Material IDs match blueprint' : 'Material ID mismatch',
  });

  if (input.expectedMaterialLabel) {
    const genericCheck = assertNoGenericMaterialInvention({ actualMaterialLabel: input.expectedMaterialLabel });
    checks.push({
      checkId: 'correct-material-ids',
      passed: genericCheck.ok,
      detail: genericCheck.ok ? 'No generic material invention' : `Generic material: ${!genericCheck.ok ? genericCheck.forbidden : ''}`,
    });
  }

  checks.push({
    checkId: 'correct-transparency',
    passed:
      workerOutput.transparencyStatus === 'alpha' ||
      workerOutput.transparencyStatus === 'opaque' ||
      workerOutput.transparencyStatus === 'glass',
    detail: `Transparency: ${workerOutput.transparencyStatus}`,
  });

  checks.push({
    checkId: 'correct-geometry',
    passed: workerOutput.success && workerOutput.sourceUrl !== null,
    detail: workerOutput.success ? 'Geometry produced' : 'Generation failed',
  });

  checks.push({
    checkId: 'correct-lighting-compatibility',
    passed: workerOutput.qualityScore >= 0.7,
    detail: `Quality score: ${workerOutput.qualityScore}`,
  });

  const failedChecks = checks.filter((c) => !c.passed).map((c) => c.checkId);
  const approved = failedChecks.length === 0 && workerOutput.success;

  return {
    jobId: workerOutput.jobId,
    assetId: workerOutput.assetId,
    approved,
    checks,
    failedChecks,
  };
}
