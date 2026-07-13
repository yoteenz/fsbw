import type { MunicipalValidationResult } from './contract';

export const UTILITY_INSPECTION_VERSION = 'utility-inspection.v1' as const;

export type UtilityInspectionInput = {
  organizationId: string;
  estimatedGpuMinutes: number;
  estimatedStorageMb: number;
  estimatedAiCredits: number;
  availableAiCredits: number;
  availableStorageMb: number;
  queueCapacity: number;
  currentQueueLoad: number;
  materialLibraryAvailable: boolean;
  brandAssetsResolved: boolean;
  permissionGraphValid: boolean;
  apiAvailable: boolean;
  workersAvailable: boolean;
  memoryHeadroomMb: number;
  minimumMemoryMb: number;
};

export type UtilityInspectionResult = {
  ok: boolean;
  engineVersion: typeof UTILITY_INSPECTION_VERSION;
  failures: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
};

export function runUtilityInspection(input: UtilityInspectionInput): UtilityInspectionResult {
  const failures: UtilityInspectionResult['failures'] = [];
  const warnings: UtilityInspectionResult['warnings'] = [];

  if (!input.materialLibraryAvailable) {
    failures.push({ code: 'MATERIAL_LIBRARY_UNAVAILABLE', message: 'Founder Material Library is not available.' });
  }
  if (!input.brandAssetsResolved) {
    failures.push({ code: 'BRAND_ASSETS_UNRESOLVED', message: 'Required brand assets are not resolved.' });
  }
  if (!input.permissionGraphValid) {
    failures.push({ code: 'PERMISSION_GRAPH_INVALID', message: 'Permission graph validation failed.' });
  }
  if (!input.apiAvailable) {
    failures.push({ code: 'API_UNAVAILABLE', message: 'Required generation APIs are unavailable.' });
  }
  if (!input.workersAvailable) {
    failures.push({ code: 'WORKERS_UNAVAILABLE', message: 'Required AI workers are unavailable.' });
  }
  if (input.estimatedAiCredits > input.availableAiCredits) {
    failures.push({ code: 'INSUFFICIENT_AI_CREDITS', message: 'Insufficient AI credits for forecasted construction.' });
  }
  if (input.estimatedStorageMb > input.availableStorageMb) {
    failures.push({ code: 'INSUFFICIENT_STORAGE', message: 'Insufficient storage for forecasted construction.' });
  }
  if (input.currentQueueLoad + 1 > input.queueCapacity) {
    failures.push({ code: 'QUEUE_CAPACITY_EXCEEDED', message: 'Construction queue capacity exceeded.' });
  }
  if (input.memoryHeadroomMb < input.minimumMemoryMb) {
    failures.push({ code: 'INSUFFICIENT_MEMORY', message: 'Insufficient memory headroom for construction.' });
  }
  if (input.estimatedGpuMinutes > 30) {
    warnings.push({ code: 'HIGH_GPU_FORECAST', message: 'GPU forecast exceeds 30 minutes.' });
  }

  return {
    ok: failures.length === 0,
    engineVersion: UTILITY_INSPECTION_VERSION,
    failures,
    warnings,
  };
}

export function validateUtilityInspection(input: UtilityInspectionInput): MunicipalValidationResult {
  const result = runUtilityInspection(input);
  if (result.ok) return { ok: true };
  return {
    ok: false,
    code: result.failures[0]?.code ?? 'UTILITY_INSPECTION_FAILED',
    message: result.failures[0]?.message ?? 'Utility inspection failed.',
  };
}
