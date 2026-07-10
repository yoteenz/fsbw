import { requireDepartmentPackage } from '../department-package';
import { requestStudioBuilderGenerate } from '../../services/studio/studioBuilder/api';
import {
  clearValidationPreviewSession,
  registerValidationEnvironmentShell,
  getValidationEnvironmentShell,
  EPHEMERAL_VALIDATION_TTL_MS,
} from '../scene-stack/ephemeral-validation-registry';
import { logCompilerEvent } from '../../studio-os/diagnostics/world-compiler-investigation';
import {
  buildEnvironmentShellRecipe,
  type EnvironmentShellRecipe,
  type ValidationEnvironmentShell,
} from './environment-shell';
import { renderValidationShellCanvas } from './validation-shell-canvas';
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

async function generateShellPublicUrl(
  recipe: EnvironmentShellRecipe,
  workspaceId?: string
): Promise<{ publicUrl: string; method: ValidationEnvironmentShell['generationMethod'] } | null> {
  const pkg = requireDepartmentPackage(recipe.departmentId);

  try {
    const api = await requestStudioBuilderGenerate({
      departmentId: recipe.departmentId,
      packageId: pkg.packageId,
      projectId: recipe.projectId,
      productionGroupId: recipe.shellPrompt.productionGroupId,
      heroAssetId: recipe.shellPrompt.heroAssetId,
      prompt: recipe.shellPrompt.primary,
      aspectRatio: recipe.aspectRatio,
      outputFormat: recipe.renderTarget.format,
      forceGenerate: true,
    });

    if (api.ok && api.publicUrl) {
      return { publicUrl: api.publicUrl, method: 'studio-builder' };
    }
  } catch {
    /* fall through to canvas */
  }

  void workspaceId;
  const dataUrl = renderValidationShellCanvas(recipe);
  if (!dataUrl) return null;
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
  workspaceId?: string;
  forceRegenerate?: boolean;
  onStageChange?: (stage: ValidationShellPipelineResult['stage']) => void;
}): Promise<ValidationShellPipelineResult> {
  let stage: ValidationShellPipelineResult['stage'] = 'compile-preview-spec';
  input.onStageChange?.(stage);

  if (!input.forceRegenerate) {
    const existing = getValidationEnvironmentShell(input.previewSessionId);
    if (existing && existing.companyId === input.companyId && existing.conceptId === input.conceptId) {
      return { ok: true, shell: existing, recipe: existing, stage: 'complete', generationMethod: existing.generationMethod };
    }
  }

  clearValidationPreviewSession(input.previewSessionId);
  logCompilerEvent('SHELL_INVALIDATED', 'validation-shell-pipeline.forceRegenerate', {
    detail: { previewSessionId: input.previewSessionId },
  });

  let recipe: EnvironmentShellRecipe;
  try {
    recipe = buildEnvironmentShellRecipe({
      companyId: input.companyId,
      conceptId: input.conceptId,
      projectId: input.projectId,
      previewSessionId: input.previewSessionId,
    });
  } catch (err) {
    return {
      ok: false,
      shell: null,
      recipe: null,
      stage,
      errorCode: 'PREVIEW_SPEC_COMPILE_FAILED',
      errorDetail: err instanceof Error ? err.message : 'Preview spec compile failed',
    };
  }

  stage = 'generate-shell';
  input.onStageChange?.(stage);
  const generated = await generateShellPublicUrl(recipe, input.workspaceId);
  if (!generated) {
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

  registerValidationEnvironmentShell(shell);
  input.onStageChange?.('complete');

  return {
    ok: true,
    shell,
    recipe,
    stage: 'complete',
    generationMethod: generated.method,
  };
}
