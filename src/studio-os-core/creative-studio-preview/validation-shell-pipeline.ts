import { requireDepartmentPackage } from '../department-package';
import { requestStudioBuilderGenerate } from '../../services/studio/studioBuilder/api';
import {
  clearValidationPreviewSession,
  registerValidationEnvironmentShell,
  getValidationEnvironmentShell,
  verifyEphemeralShellMount,
  EPHEMERAL_VALIDATION_TTL_MS,
} from '../scene-stack/ephemeral-validation-registry';
import { logCompilerEvent } from '../../studio-os/diagnostics/world-compiler-investigation';
import {
  beginShellFoundationRun,
  completeShellFoundationRun,
  recordShellFunctionEnter,
  recordShellFunctionExit,
  recordShellGenerationNetworkFromForensic,
  recordShellStage,
  recordShellStateSnapshot,
  setShellDependencies,
  traceShellAsync,
} from '../../studio-os/diagnostics/world-compiler-investigation/shell-foundation-black-box';
import {
  buildEnvironmentShellRecipe,
  type EnvironmentShellRecipe,
  type ValidationEnvironmentShell,
} from './environment-shell';
import { renderValidationShellCanvas } from './validation-shell-canvas';
import { withValidationEphemeralAuth } from '../scene-stack/validation-render';
import type { CreativePreviewCompanyId } from './types';

export type ValidationShellPipelineResult = {
  ok: boolean;
  shell: ValidationEnvironmentShell | null;
  recipe: EnvironmentShellRecipe | null;
  stage: 'compile-preview-spec' | 'generate-shell' | 'register-ephemeral' | 'complete';
  errorCode?: string;
  errorDetail?: string;
  generationMethod?: ValidationEnvironmentShell['generationMethod'];
};

const SHELL_TTL_MS = EPHEMERAL_VALIDATION_TTL_MS;
const FILE = 'validation-shell-pipeline.ts';

async function generateShellPublicUrl(
  recipe: EnvironmentShellRecipe,
  authCtx: {
    compileRunId: string;
    previewSessionId: string;
    organizationId: string;
    departmentId: string;
    stationId: string;
    projectId: string;
  },
  workspaceId?: string
): Promise<{ publicUrl: string; method: ValidationEnvironmentShell['generationMethod'] } | null> {
  recordShellFunctionEnter('generateShellPublicUrl', FILE);
  recordShellStage('create-shell-request', 'running');

  try {
    const api = await requestStudioBuilderGenerate(
      withValidationEphemeralAuth(
        {
          departmentId: recipe.departmentId,
          packageId: requireDepartmentPackage(recipe.departmentId).packageId,
          projectId: recipe.projectId,
          productionGroupId: recipe.shellPrompt.productionGroupId,
          heroAssetId: recipe.shellPrompt.heroAssetId,
          prompt: recipe.shellPrompt.primary,
          aspectRatio: recipe.aspectRatio,
          outputFormat: recipe.renderTarget.format,
          forceGenerate: true,
        },
        {
          validationMode: true,
          compileRunId: authCtx.compileRunId,
          previewSessionId: authCtx.previewSessionId,
          organizationId: authCtx.organizationId,
          departmentId: authCtx.departmentId,
          stationId: authCtx.stationId,
          projectId: authCtx.projectId,
        }
      )
    );

    recordShellGenerationNetworkFromForensic();

    if (api.ok && api.publicUrl) {
      recordShellStage('create-shell-request', 'success', { detail: 'studio-builder-generate returned publicUrl' });
      recordShellFunctionExit('generateShellPublicUrl', FILE, { method: 'studio-builder' });
      return { publicUrl: api.publicUrl, method: 'studio-builder' };
    }
  } catch (err) {
    recordShellGenerationNetworkFromForensic();
    recordShellStage('create-shell-request', 'failed', {
      detail: err instanceof Error ? err.message : 'studio-builder-generate threw',
    });
  }

  void workspaceId;
  recordShellStage('create-shell-request', 'success', { detail: 'Falling through to preview-canvas' });
  const dataUrl = renderValidationShellCanvas(recipe);
  if (!dataUrl) {
    recordShellFunctionExit('generateShellPublicUrl', FILE, { method: null });
    return null;
  }
  recordShellFunctionExit('generateShellPublicUrl', FILE, { method: 'preview-canvas' });
  return { publicUrl: dataUrl, method: 'preview-canvas' };
}

/**
 * Experience Lab shell pipeline — never assumes a pre-existing environment-shell record.
 *
 * Compile Preview Spec → Generate Shell → Register Ephemeral → (caller) Load Shell
 */
export async function runExperienceLabValidationShellPipeline(input: {
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
  projectId: string;
  previewSessionId: string;
  compileRunId: string;
  departmentId: string;
  stationId: string;
  workspaceId?: string;
  forceRegenerate?: boolean;
  onStageChange?: (stage: ValidationShellPipelineResult['stage']) => void;
}): Promise<ValidationShellPipelineResult> {
  beginShellFoundationRun({
    compileRunId: input.compileRunId,
    previewSessionId: input.previewSessionId,
    companyId: input.companyId,
    conceptId: input.conceptId,
    departmentId: input.departmentId,
    stationId: input.stationId,
    projectId: input.projectId,
  });

  recordShellFunctionEnter('runExperienceLabValidationShellPipeline', FILE, {
    forceRegenerate: input.forceRegenerate ?? false,
  });
  recordShellStage('initialize-shell', 'running');

  let stage: ValidationShellPipelineResult['stage'] = 'compile-preview-spec';
  input.onStageChange?.(stage);
  recordShellStage('initialize-shell', 'success');
  recordShellStateSnapshot('pipeline-stage', { pipelinePhase: stage, shellStatus: 'starting' });

  if (!input.forceRegenerate) {
    recordShellStage('resolve-existing-shell', 'running');
    const existing = getValidationEnvironmentShell(input.previewSessionId);
    if (existing && existing.companyId === input.companyId && existing.conceptId === input.conceptId) {
      recordShellStage('resolve-existing-shell', 'success', { detail: 'Reused existing ephemeral shell' });
      completeShellFoundationRun(true, 'existing shell reused');
      recordShellFunctionExit('runExperienceLabValidationShellPipeline', FILE, { reused: true });
      return { ok: true, shell: existing, recipe: existing, stage: 'complete', generationMethod: existing.generationMethod };
    }
    recordShellStage('resolve-existing-shell', 'success', { detail: 'No matching existing shell' });
  } else {
    recordShellStage('resolve-existing-shell', 'skipped', { detail: 'forceRegenerate=true' });
  }

  setShellDependencies([
    { id: 'org-context', label: 'Organization context', status: 'resolved', waitingOn: null },
    { id: 'station', label: 'Station verification', status: 'resolved', waitingOn: 'org-context' },
    { id: 'preview-spec', label: 'Preview spec compile', status: 'outstanding', waitingOn: 'station' },
    { id: 'shell-generate', label: 'Shell generation', status: 'outstanding', waitingOn: 'preview-spec' },
    { id: 'shell-register', label: 'Ephemeral registration', status: 'outstanding', waitingOn: 'shell-generate' },
    { id: 'shell-verify', label: 'Mount verification', status: 'outstanding', waitingOn: 'shell-register' },
  ]);

  await traceShellAsync(
    'invalidate-prior-shell',
    'clearValidationPreviewSession',
    FILE,
    async () => {
      clearValidationPreviewSession(input.previewSessionId);
      logCompilerEvent('SHELL_INVALIDATED', 'validation-shell-pipeline.forceRegenerate', {
        detail: { previewSessionId: input.previewSessionId },
      });
    },
    { awaitLabel: 'clearValidationPreviewSession' }
  );

  let recipe: EnvironmentShellRecipe;
  try {
    recipe = await traceShellAsync(
      'compile-preview-spec',
      'buildEnvironmentShellRecipe',
      FILE,
      async () =>
        buildEnvironmentShellRecipe({
          companyId: input.companyId,
          conceptId: input.conceptId,
          projectId: input.projectId,
          previewSessionId: input.previewSessionId,
        }),
      { awaitLabel: 'buildEnvironmentShellRecipe', expectedTimeoutMs: 30_000 }
    );
    setShellDependencies([
      { id: 'org-context', label: 'Organization context', status: 'resolved', waitingOn: null },
      { id: 'station', label: 'Station verification', status: 'resolved', waitingOn: 'org-context' },
      { id: 'preview-spec', label: 'Preview spec compile', status: 'resolved', waitingOn: 'station' },
      { id: 'shell-generate', label: 'Shell generation', status: 'outstanding', waitingOn: 'preview-spec' },
      { id: 'shell-register', label: 'Ephemeral registration', status: 'outstanding', waitingOn: 'shell-generate' },
      { id: 'shell-verify', label: 'Mount verification', status: 'outstanding', waitingOn: 'shell-register' },
    ]);
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Preview spec compile failed';
    completeShellFoundationRun(false, detail);
    recordShellFunctionExit('runExperienceLabValidationShellPipeline', FILE, { ok: false });
    return {
      ok: false,
      shell: null,
      recipe: null,
      stage,
      errorCode: 'PREVIEW_SPEC_COMPILE_FAILED',
      errorDetail: detail,
    };
  }

  stage = 'generate-shell';
  input.onStageChange?.(stage);
  recordShellStateSnapshot('pipeline-stage', { pipelinePhase: stage, shellStatus: 'generating' });

  const generated = await traceShellAsync(
    'generate-shell',
    'generateShellPublicUrl',
    FILE,
    async () =>
      generateShellPublicUrl(
        recipe,
        {
          compileRunId: input.compileRunId,
          previewSessionId: input.previewSessionId,
          organizationId: input.companyId,
          departmentId: input.departmentId,
          stationId: input.stationId,
          projectId: input.projectId,
        },
        input.workspaceId
      ),
    { awaitLabel: 'generateShellPublicUrl', expectedTimeoutMs: 120_000 }
  );

  if (!generated) {
    completeShellFoundationRun(false, 'Shell generation failed');
    recordShellFunctionExit('runExperienceLabValidationShellPipeline', FILE, { ok: false });
    return {
      ok: false,
      shell: null,
      recipe,
      stage,
      errorCode: 'SHELL_GENERATION_FAILED',
      errorDetail: 'Could not generate environment shell from preview recipe (builder + canvas unavailable).',
    };
  }

  stage = 'register-ephemeral';
  input.onStageChange?.(stage);
  recordShellStateSnapshot('pipeline-stage', { pipelinePhase: stage, shellStatus: 'registering' });

  const now = new Date();
  const shell: ValidationEnvironmentShell = {
    ...recipe,
    publicUrl: generated.publicUrl,
    generatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SHELL_TTL_MS).toISOString(),
    registryScope: 'ephemeral-validation',
    generationMethod: generated.method,
    canonicalStatus: 'non_canonical',
  };

  await traceShellAsync(
    'register-ephemeral-shell',
    'registerValidationEnvironmentShell',
    FILE,
    async () => {
      registerValidationEnvironmentShell(shell);
    },
    { awaitLabel: 'registerValidationEnvironmentShell' }
  );

  recordShellStage('persist-shell', 'success', { detail: shell.previewSessionId });

  const verification = await traceShellAsync(
    'verify-shell',
    'verifyEphemeralShellMount',
    FILE,
    async () =>
      verifyEphemeralShellMount({
        previewSessionId: shell.previewSessionId,
        departmentId: shell.departmentId,
        projectId: shell.projectId,
        stationId: shell.stationId,
      }),
    { awaitLabel: 'verifyEphemeralShellMount' }
  );

  recordShellStateSnapshot('post-verify', {
    shellId: verification.shellId ?? shell.previewSessionId,
    shellStatus: verification.ok ? 'verified' : 'verify-failed',
    pipelinePhase: 'register-ephemeral',
  });

  if (!verification.ok) {
    completeShellFoundationRun(false, verification.detail ?? 'Post-registration lookup failed');
    recordShellFunctionExit('runExperienceLabValidationShellPipeline', FILE, { ok: false });
    return {
      ok: false,
      shell,
      recipe,
      stage: 'register-ephemeral',
      errorCode: verification.errorCode ?? 'SHELL_RECOVERY_LOOKUP_MISMATCH',
      errorDetail: `${verification.detail ?? 'Post-registration lookup failed.'} registration=${verification.registrationPreviewSessionId} lookup=${verification.lookupPreviewSessionId} shellId=${verification.shellId ?? 'none'} namespace=${verification.registryNamespace}`,
    };
  }

  if (!verification.mountReady) {
    completeShellFoundationRun(false, 'Shell registered but not mount-ready');
    recordShellFunctionExit('runExperienceLabValidationShellPipeline', FILE, { ok: false });
    return {
      ok: false,
      shell,
      recipe,
      stage: 'register-ephemeral',
      errorCode: 'SHELL_RECOVERY_LOOKUP_MISMATCH',
      errorDetail: `Shell registered but not mount-ready for preview ${shell.previewSessionId}.`,
    };
  }

  input.onStageChange?.('complete');
  completeShellFoundationRun(true, `method=${generated.method}`);
  recordShellFunctionExit('runExperienceLabValidationShellPipeline', FILE, { ok: true });

  return {
    ok: true,
    shell,
    recipe,
    stage: 'complete',
    generationMethod: generated.method,
  };
}
