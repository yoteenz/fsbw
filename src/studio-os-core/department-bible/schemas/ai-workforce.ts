import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';

export const AI_WORKFORCE_DIRECTORY_VERSION = 'ai-workforce-directory.v1' as const;

export type AiWorkerDefinition = {
  workerId: string;
  displayName: string;
  departmentId: CanonicalMainDepartmentId;
  responsibilities: string[];
  requiredCapabilities: string[];
};

export type AiWorkforceDirectory = {
  directoryVersion: typeof AI_WORKFORCE_DIRECTORY_VERSION;
  workers: AiWorkerDefinition[];
};
