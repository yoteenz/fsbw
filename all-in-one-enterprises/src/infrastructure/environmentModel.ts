/**
 * Sprint 23 — explicit environment model.
 * Never infer production from hostname alone; use AIO_ENVIRONMENT / VITE_AIO_ENVIRONMENT.
 */

import { FRONTAL_SLAYER_SUPABASE_PROJECT_ID } from '../data/constants';
import type { AioDeploymentEnvironment } from './types';

function readEnv(key: string): string | undefined {
  if (typeof import.meta === 'undefined') return undefined;
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return value.trim();
}

export function resolveDeploymentEnvironment(): AioDeploymentEnvironment {
  const raw = (readEnv('VITE_AIO_ENVIRONMENT') ?? readEnv('AIO_ENVIRONMENT') ?? 'local').toLowerCase();
  if (raw === 'production' || raw === 'prod') return 'production';
  if (raw === 'staging' || raw === 'stage') return 'staging';
  if (raw === 'demo' || raw === 'preview') return 'demo';
  return 'local';
}

export function isProductionDeployment(): boolean {
  return resolveDeploymentEnvironment() === 'production';
}

export function isStagingDeployment(): boolean {
  return resolveDeploymentEnvironment() === 'staging';
}

export function isDemoOrLocalDeployment(): boolean {
  const env = resolveDeploymentEnvironment();
  return env === 'demo' || env === 'local';
}

export interface BuildEnvValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/** Reject dangerous production build configuration */
export function validateProductionBuildConfig(): BuildEnvValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const deployment = resolveDeploymentEnvironment();
  const dataMode = (readEnv('VITE_AIO_DATA_MODE') ?? 'demo').toLowerCase();
  const authMode = (readEnv('VITE_AIO_AUTH_MODE') ?? 'demo').toLowerCase();
  const storageMode = (readEnv('VITE_AIO_STORAGE_MODE') ?? 'demo').toLowerCase();
  const supabaseUrl = readEnv('VITE_AIO_SUPABASE_URL');

  if (deployment === 'production') {
    if (dataMode === 'demo') {
      errors.push('ALL IN ONE CONFIGURATION ERROR: production deployment cannot use VITE_AIO_DATA_MODE=demo');
    }
    if (authMode === 'demo') {
      errors.push('ALL IN ONE CONFIGURATION ERROR: production deployment cannot use VITE_AIO_AUTH_MODE=demo');
    }
    if (storageMode === 'demo') {
      errors.push('ALL IN ONE CONFIGURATION ERROR: production deployment cannot use VITE_AIO_STORAGE_MODE=demo');
    }
    if (!readEnv('VITE_AIO_APP_URL')) {
      warnings.push('VITE_AIO_APP_URL not set — generated links may be incorrect');
    }
  }

  if (supabaseUrl?.includes(FRONTAL_SLAYER_SUPABASE_PROJECT_ID)) {
    errors.push('ALL IN ONE CONFIGURATION ERROR: VITE_AIO_SUPABASE_URL must not target Frontal Slayer project');
  }

  const stagingRef = readEnv('VITE_AIO_STAGING_PROJECT_REF');
  const prodRef = readEnv('VITE_AIO_PRODUCTION_PROJECT_REF');
  if (stagingRef && prodRef && stagingRef === prodRef) {
    errors.push('ALL IN ONE CONFIGURATION ERROR: staging and production Supabase project refs must differ');
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function assertSafeRuntimeMode(): void {
  const validation = validateProductionBuildConfig();
  if (!validation.ok && isProductionDeployment()) {
    throw new Error(validation.errors.join('; '));
  }
}
