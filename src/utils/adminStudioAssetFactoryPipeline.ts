import type { BlueprintDefinition } from './adminStudioBlueprintManagerDemo';
import { computeFactoryReadiness } from './adminStudioBlueprintManagerCompute';
import type { FactoryDepartmentId, FactoryJobStatus, QaCheckResult } from './adminStudioAssetFactoryDemo';
import { FACTORY_DEPARTMENTS, QA_CHECK_LABELS } from './adminStudioAssetFactoryDemo';
import { getDefaultProviderForAssetType } from './adminStudioAssetFactoryProviders';

export type GenerationPlan = {
  blueprintId: string;
  blueprintName: string;
  requiredImages: string[];
  requiredVideos: string[];
  requiredVariants: string[];
  estimatedTimeMin: number;
  estimatedCredits: number;
  estimatedStorageMb: number;
  estimatedCost: string;
  dependencies: string[];
  promptStackPreview: string[];
  eligible: boolean;
  eligibilityNote: string;
};

export type FactoryJob = {
  id: string;
  blueprintId: string;
  blueprintName: string;
  status: FactoryJobStatus;
  provider: string;
  progressPct: number;
  currentDepartmentId: FactoryDepartmentId | null;
  departmentIndex: number;
  creditsUsed: number;
  estimatedCost: string;
  version: number;
  createdAt: string;
  logs: string[];
  errors: string[];
  qaResults: QaCheckResult[];
  priority: number;
  variations: string[];
};

export function buildGenerationPlan(bp: BlueprintDefinition): GenerationPlan {
  const readiness = computeFactoryReadiness(bp);
  const imageCount = bp.requiredImages.length;
  const videoCount = bp.requiredVideos.length;
  const variantCount = Math.min(bp.requiredImages.length, 4);
  const estimatedCredits = imageCount * 12 + videoCount * 48 + bp.requiredCameraPresets.length * 4;
  const estimatedTimeMin = Math.max(3, Math.round(imageCount * 0.4 + videoCount * 1.2));

  const eligible = bp.status === 'approved';
  let eligibilityNote = 'READY FOR MANUFACTURING';
  if (!eligible) {
    eligibilityNote = `BLUEPRINT STATUS: ${bp.status.toUpperCase()} — APPROVE IN BLUEPRINT MANAGER FIRST`;
  } else if (!readiness.eligible) {
    eligibilityNote = `FACTORY READINESS ${readiness.overall}% — COMPLETE BLUEPRINT SPEC`;
  }

  return {
    blueprintId: bp.id,
    blueprintName: bp.identity.name,
    requiredImages: bp.requiredImages,
    requiredVideos: bp.requiredVideos,
    requiredVariants: bp.requiredImages.slice(0, variantCount),
    estimatedTimeMin,
    estimatedCredits,
    estimatedStorageMb: imageCount * 8 + videoCount * 120,
    estimatedCost: `$${(estimatedCredits * 0.05).toFixed(2)}`,
    dependencies: bp.dependencies.map((d) => d.label),
    promptStackPreview: bp.promptStack.map((p) => p.label),
    eligible: eligible && readiness.eligible,
    eligibilityNote,
  };
}

export function createFactoryJob(bp: BlueprintDefinition, variations: string[] = []): FactoryJob {
  const plan = buildGenerationPlan(bp);
  const provider = getDefaultProviderForAssetType('image');
  return {
    id: `job-${Date.now()}`,
    blueprintId: bp.id,
    blueprintName: bp.identity.name,
    status: 'queued',
    provider: provider.toUpperCase(),
    progressPct: 0,
    currentDepartmentId: null,
    departmentIndex: -1,
    creditsUsed: 0,
    estimatedCost: plan.estimatedCost,
    version: (bp.versionHistory.length || 0) + 1,
    createdAt: new Date().toISOString(),
    logs: [`JOB QUEUED · ${bp.identity.name}`],
    errors: [],
    qaResults: [],
    priority: 1,
    variations,
  };
}

export function advanceJobDepartment(job: FactoryJob): FactoryJob {
  const nextIndex = job.departmentIndex + 1;
  if (nextIndex >= FACTORY_DEPARTMENTS.length) {
    const qaResults = runQaChecks();
    const allPass = qaResults.every((q) => q.passed);
    return {
      ...job,
      departmentIndex: nextIndex,
      currentDepartmentId: 'asset-director',
      progressPct: 100,
      status: allPass ? 'completed' : 'needs-review',
      creditsUsed: job.creditsUsed + 120,
      logs: [
        ...job.logs,
        'QA COMPLETE',
        allPass ? 'ASSET DIRECTOR UPDATED' : 'NEEDS REVIEW — QA FLAG',
        'MISSION CONTROL SYNCED',
        'EXECUTIVE AI DIRECTOR NOTIFIED',
      ],
      qaResults,
    };
  }

  const dept = FACTORY_DEPARTMENTS[nextIndex];
  const progressPct = Math.round(((nextIndex + 1) / FACTORY_DEPARTMENTS.length) * 100);
  return {
    ...job,
    departmentIndex: nextIndex,
    currentDepartmentId: dept.id,
    status: 'running',
    progressPct,
    creditsUsed: job.creditsUsed + 15,
    logs: [...job.logs, `${dept.label}: ${dept.tourMessage}`],
  };
}

function runQaChecks(): QaCheckResult[] {
  return QA_CHECK_LABELS.map((label, i) => ({
    id: `qa-${i}`,
    label,
    passed: i !== 6,
  }));
}

export function getApprovedBlueprintsForFactory(
  blueprints: BlueprintDefinition[]
): BlueprintDefinition[] {
  return blueprints.filter((b) => b.status === 'approved' || b.id === 'bp-weather-studio');
}
