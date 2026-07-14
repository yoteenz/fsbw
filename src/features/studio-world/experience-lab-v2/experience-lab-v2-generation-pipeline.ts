/**
 * Generation pipeline — state model, reset rules, breadcrumb builder.
 */

import type { ExperienceLabProgram } from './experience-lab-v2-program-registry';
import { programBreadcrumbLabel } from './experience-lab-v2-program-registry';
import type { StudioWorldDepartmentId } from './experience-lab-v2-department-registry';
import { resolveStudioWorldDepartment } from './experience-lab-v2-department-registry';
import { resolveIndustryPackSelectorEntry } from './experience-lab-v2-industry-pack-registry';
import {
  listIndustryPackEnvironments,
  listStudioWorldEnvironments,
  resolveEnvironmentLabel,
} from './experience-lab-v2-environment-registry';

export const GENERATION_PIPELINE_STORAGE_KEY = 'experience_lab_v2_generation_pipeline_v1';

export type GenerationPipelineState = {
  programId: ExperienceLabProgram;
  studioDepartmentId: StudioWorldDepartmentId | null;
  industryPackId: string | null;
  environmentId: string | null;
};

export type GenerationPipelineBreadcrumb = {
  segments: string[];
  display: string;
};

export type PipelineResetScope = 'program' | 'department' | 'pack' | 'environment';

export function applyPipelineReset(
  _state: GenerationPipelineState,
  scope: PipelineResetScope
): Partial<Pick<GenerationPipelineState, 'studioDepartmentId' | 'industryPackId' | 'environmentId'>> {
  switch (scope) {
    case 'program':
      return { studioDepartmentId: null, industryPackId: null, environmentId: null };
    case 'department':
    case 'pack':
      return { environmentId: null };
    case 'environment':
      return {};
    default:
      return {};
  }
}

export function buildGenerationPipelineBreadcrumb(input: {
  state: GenerationPipelineState;
  variantLabel?: string | null;
}): GenerationPipelineBreadcrumb {
  const { state, variantLabel } = input;
  const segments: string[] = [programBreadcrumbLabel(state.programId)];

  if (state.programId === 'studio-world') {
    const dept = resolveStudioWorldDepartment(state.studioDepartmentId);
    if (dept) segments.push(dept.label);
  } else {
    const pack = resolveIndustryPackSelectorEntry(state.industryPackId);
    if (pack) segments.push(pack.label);
  }

  const environments =
    state.programId === 'studio-world'
      ? listStudioWorldEnvironments(state.studioDepartmentId)
      : listIndustryPackEnvironments(state.industryPackId);

  const envLabel = resolveEnvironmentLabel(environments, state.environmentId);
  if (envLabel) segments.push(envLabel);

  if (variantLabel) segments.push(variantLabel.toUpperCase());

  return {
    segments,
    display: segments.join(' / '),
  };
}

export function pipelineCanonicalDepartmentId(state: GenerationPipelineState): string {
  if (state.programId === 'studio-world') {
    return resolveStudioWorldDepartment(state.studioDepartmentId)?.canonicalDepartmentId ?? 'experience-lab';
  }
  return 'experience-lab';
}

export function pipelineProgramActionsProfile(state: GenerationPipelineState): string {
  if (state.programId === 'studio-world') {
    return resolveStudioWorldDepartment(state.studioDepartmentId)?.programActionsProfile ?? 'studio-world-generation';
  }
  return 'industry-pack-generation';
}
