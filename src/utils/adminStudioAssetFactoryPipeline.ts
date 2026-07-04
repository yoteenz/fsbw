import type { BlueprintDefinition } from './adminStudioBlueprintManagerDemo';
import { computeFactoryReadiness } from './adminStudioBlueprintManagerCompute';
import type { FactoryDepartmentId, FactoryJobStatus, QaCheckResult } from './adminStudioAssetFactoryDemo';
import { FACTORY_DEPARTMENTS, QA_CHECK_LABELS } from './adminStudioAssetFactoryDemo';
import { getDefaultProviderForAssetType } from './adminStudioAssetFactoryProviders';
import {
  MASTER_STUDIO_QA_FAIL_LABEL,
  MASTER_STUDIO_QA_LABELS,
  STUDIO_FACTORY_GENERATION_ORDER,
  runMasterStudioSeparationQa,
} from './adminStudioSetSeparation';

export type GenerationPlan = {
  blueprintId: string;
  blueprintName: string;
  requiredImages: string[];
  requiredVideos: string[];
  requiredVariants: string[];
  /** Studio blueprints — ordered manufacturing steps. */
  studioGenerationOrder?: readonly string[];
  estimatedTimeMin: number;
  estimatedCredits: number;
  estimatedStorageMb: number;
  estimatedCost: string;
  dependencies: string[];
  promptStackPreview: string[];
  eligible: boolean;
  eligibilityNote: string;
};

export type FactoryVariantOutput = {
  variantId: string;
  variantName: string;
  previewSrc?: string;
  status: 'pending' | 'generating' | 'complete' | 'failed';
  error?: string;
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
  /** Live Fal pipeline — Asset Director → Factory → Supabase delivery */
  livePipeline?: boolean;
  studioId?: string;
  variantOutputs?: FactoryVariantOutput[];
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
    studioGenerationOrder: bp.identity.category === 'studio' ? STUDIO_FACTORY_GENERATION_ORDER : undefined,
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

export function createFactoryJob(
  bp: BlueprintDefinition,
  variations: string[] = [],
  options?: { livePipeline?: boolean; studioId?: string; variantTargets?: Array<{ variantId: string; variantName: string }> }
): FactoryJob {
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
    livePipeline: options?.livePipeline,
    studioId: options?.studioId,
    variantOutputs: options?.variantTargets?.map((t) => ({
      variantId: t.variantId,
      variantName: t.variantName,
      status: 'pending' as const,
    })),
  };
}

export function advanceJobDepartment(job: FactoryJob): FactoryJob {
  const nextIndex = job.departmentIndex + 1;
  if (nextIndex >= FACTORY_DEPARTMENTS.length) {
    const qaResults = runQaChecks(
      job.blueprintId.includes('studio') || job.blueprintName.toUpperCase().includes('STUDIO') ? 'studio' : undefined,
      job.variantOutputs?.[0]?.variantName
    );
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

function runQaChecks(bpCategory?: string, variantName?: string): QaCheckResult[] {
  const base = QA_CHECK_LABELS.map((label, i) => ({
    id: `qa-${i}`,
    label,
    passed: i !== 6,
  }));

  if (bpCategory !== 'studio') return base;

  const masterChecks = runMasterStudioSeparationQa(variantName ?? 'MASTER BASE', 'master-studio');
  const masterFailed = masterChecks.some((c) => !c.passed);
  const layerQa: QaCheckResult[] = MASTER_STUDIO_QA_LABELS.map((label, i) => ({
    id: `qa-master-${i}`,
    label,
    passed: masterChecks[i]?.passed ?? true,
  }));

  if (masterFailed) {
    layerQa.push({
      id: 'qa-master-fail',
      label: MASTER_STUDIO_QA_FAIL_LABEL,
      passed: false,
    });
  }

  return [...layerQa, ...base];
}

export function getApprovedBlueprintsForFactory(
  blueprints: BlueprintDefinition[]
): BlueprintDefinition[] {
  return blueprints.filter((b) => b.status === 'approved' || b.id === 'bp-weather-studio');
}
