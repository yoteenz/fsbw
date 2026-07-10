/**
 * PreviewCompileContext — immutable preview-scoped compile identity for Experience Lab.
 * One context per compile run; never inferred from global singletons.
 */

import type { CreativePreviewCompanyId } from '../creative-studio-preview/types';

export type PreviewRegistryMode = 'local-scene-stack' | 'ephemeral-validation';

export type PreviewCompileContext = {
  previewSessionId: string;
  departmentId: string;
  projectId: string;
  stationId: string;
  conceptId: 'a' | 'b' | 'c';
  companyId: CreativePreviewCompanyId;
  validationMode: boolean;
  registryMode: PreviewRegistryMode;
  compileRunId: string;
  compareGroupId?: string;
};

export type PreviewCompileContextInput = {
  previewSessionId: string;
  departmentId: string;
  projectId: string;
  stationId: string;
  conceptId: 'a' | 'b' | 'c';
  companyId: CreativePreviewCompanyId;
  compileRunId: string;
  compareGroupId?: string;
  validationMode?: boolean;
  registryMode?: PreviewRegistryMode;
};

export function buildPreviewSessionId(input: {
  companyId: CreativePreviewCompanyId;
  conceptId: 'a' | 'b' | 'c';
  departmentId: string;
  stationId: string;
  projectId: string;
}): string {
  return `${input.companyId}:${input.conceptId}:${input.departmentId}:${input.stationId}:${input.projectId}`;
}

export function buildPreviewCompileContext(input: PreviewCompileContextInput): PreviewCompileContext {
  const validationMode = input.validationMode ?? true;
  return Object.freeze({
    previewSessionId: input.previewSessionId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId: input.stationId,
    conceptId: input.conceptId,
    companyId: input.companyId,
    validationMode,
    registryMode: input.registryMode ?? (validationMode ? 'ephemeral-validation' : 'local-scene-stack'),
    compileRunId: input.compileRunId,
    compareGroupId: input.compareGroupId,
  });
}

export function assertPreviewSessionInvariant(
  registrationSessionId: string,
  lookupSessionId: string,
  compileRunId?: string
): void {
  if (registrationSessionId !== lookupSessionId) {
    throw new Error(
      `[SHELL_RECOVERY_LOOKUP_MISMATCH] previewSessionId mismatch. registration=${registrationSessionId} lookup=${lookupSessionId}${compileRunId ? ` compileRunId=${compileRunId}` : ''}`
    );
  }
}

export function ephemeralRegistryNamespace(previewSessionId: string): string {
  return `ephemeral-validation:${previewSessionId}`;
}
