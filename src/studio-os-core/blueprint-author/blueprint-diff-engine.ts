import type { ConstructionPlan, ConstructionPlanAssetRef } from './construction-plan-schema';

export const BLUEPRINT_DIFF_ENGINE_VERSION = 'blueprint-diff-engine.v1';

export type BlueprintDiffCategory =
  | 'asset-version'
  | 'material'
  | 'socket'
  | 'transparency'
  | 'scale'
  | 'lighting'
  | 'architecture'
  | 'missing-asset';

export type BlueprintDiffEntry = {
  category: BlueprintDiffCategory;
  expected: string;
  actual: string;
  assetId: string | null;
  socketId: string | null;
  severity: 'critical' | 'warning' | 'info';
  repairHint: string;
};

export type BlueprintDiffResult = {
  planId: string;
  hasDrift: boolean;
  entries: BlueprintDiffEntry[];
  criticalCount: number;
};

export function diffAssetVersion(input: {
  expected: ConstructionPlanAssetRef;
  actualVersion: string;
}): BlueprintDiffEntry | null {
  if (input.expected.version === input.actualVersion) return null;
  return {
    category: 'asset-version',
    expected: `${input.expected.assetId}.${input.expected.version}`,
    actual: `${input.expected.assetId}.${input.actualVersion}`,
    assetId: input.expected.assetId,
    socketId: input.expected.socketId,
    severity: 'critical',
    repairHint: `Upgrade ${input.expected.assetId} to ${input.expected.version}`,
  };
}

export function diffMaterial(input: {
  expectedMaterialId: string;
  actualMaterialLabel: string;
}): BlueprintDiffEntry | null {
  const actualLower = input.actualMaterialLabel.toLowerCase();
  const expectedLower = input.expectedMaterialId.toLowerCase();
  if (actualLower.includes(expectedLower.replace(/-/g, ' ')) || actualLower.includes(expectedLower)) {
    return null;
  }
  if (
    actualLower.includes('generic') ||
    (actualLower.includes('marble') && !actualLower.includes('founder'))
  ) {
    return {
      category: 'material',
      expected: input.expectedMaterialId,
      actual: input.actualMaterialLabel,
      assetId: null,
      socketId: null,
      severity: 'critical',
      repairHint: 'Rebuild material layer with approved organization material',
    };
  }
  return null;
}

export function diffTransparency(input: {
  assetId: string;
  expected: 'alpha' | 'opaque' | 'glass';
  actual: 'alpha' | 'opaque' | 'glass' | 'unknown' | 'full-scene';
}): BlueprintDiffEntry | null {
  if (input.actual === 'full-scene') {
    return {
      category: 'transparency',
      expected: input.expected,
      actual: 'full-scene-render',
      assetId: input.assetId,
      socketId: null,
      severity: 'critical',
      repairHint: 'Reject full-scene render; requeue isolated asset job',
    };
  }
  if (input.actual === input.expected || input.actual === 'unknown') return null;
  return {
    category: 'transparency',
    expected: input.expected,
    actual: input.actual,
    assetId: input.assetId,
    socketId: null,
    severity: 'warning',
    repairHint: `Correct transparency to ${input.expected}`,
  };
}

export function diffBlueprintAgainstActual(input: {
  plan: ConstructionPlan;
  actualAssets: Array<{
    assetId: string;
    version: string;
    socketId: string | null;
    materialLabel: string;
    transparency: 'alpha' | 'opaque' | 'glass' | 'unknown' | 'full-scene';
  }>;
}): BlueprintDiffResult {
  const entries: BlueprintDiffEntry[] = [];

  const allExpected = [
    ...input.plan.heroAssets,
    ...input.plan.furnitureSet.assets,
    ...input.plan.decorSet.assets,
  ];

  for (const expected of allExpected) {
    const actual = input.actualAssets.find((a) => a.assetId === expected.assetId);
    if (!actual) {
      entries.push({
        category: 'missing-asset',
        expected: `${expected.assetId}.${expected.version}`,
        actual: 'missing',
        assetId: expected.assetId,
        socketId: expected.socketId,
        severity: 'critical',
        repairHint: `Generate ${expected.assetId} for socket ${expected.socketId}`,
      });
      continue;
    }

    const versionDiff = diffAssetVersion({ expected, actualVersion: actual.version });
    if (versionDiff) entries.push(versionDiff);

    if (actual.socketId !== expected.socketId) {
      entries.push({
        category: 'socket',
        expected: expected.socketId,
        actual: actual.socketId ?? 'none',
        assetId: expected.assetId,
        socketId: expected.socketId,
        severity: 'critical',
        repairHint: `Reposition ${expected.assetId} to socket ${expected.socketId}`,
      });
    }

    for (const matId of input.plan.materialSet.materialIds) {
      const matDiff = diffMaterial({
        expectedMaterialId: matId,
        actualMaterialLabel: actual.materialLabel,
      });
      if (matDiff) entries.push(matDiff);
    }

    const transparencyExpected = expected.tier === 'hero' ? 'alpha' : 'opaque';
    const transDiff = diffTransparency({
      assetId: expected.assetId,
      expected: transparencyExpected,
      actual: actual.transparency,
    });
    if (transDiff) entries.push(transDiff);
  }

  const criticalCount = entries.filter((e) => e.severity === 'critical').length;
  return {
    planId: input.plan.planId,
    hasDrift: entries.length > 0,
    entries,
    criticalCount,
  };
}
