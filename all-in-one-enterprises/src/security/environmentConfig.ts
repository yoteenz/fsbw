import type { AioRuntimeEnvironment, SecuritySettings } from './securityTypes';

export type EnvVarClass = 'PUBLIC' | 'SERVER_ONLY' | 'SECRET' | 'BUILD_TIME' | 'RUNTIME';

export interface EnvVarSpec {
  name: string;
  classification: EnvVarClass;
  requiredInProduction: boolean;
  description: string;
}

/** Documented environment variable classification — no secrets in VITE_* prefix. */
export const AIO_ENV_SPECS: EnvVarSpec[] = [
  { name: 'VITE_AIO_SUPABASE_URL', classification: 'PUBLIC', requiredInProduction: true, description: 'AIO Supabase project URL (public)' },
  { name: 'VITE_AIO_SUPABASE_ANON_KEY', classification: 'PUBLIC', requiredInProduction: true, description: 'AIO anon key (RLS-bound)' },
  { name: 'AIO_SUPABASE_SERVICE_ROLE_KEY', classification: 'SECRET', requiredInProduction: true, description: 'Server-only service role' },
  { name: 'AIO_AUTH_STORAGE_KEY', classification: 'RUNTIME', requiredInProduction: false, description: 'Isolated auth storage key (default aio-auth-token)' },
  { name: 'AIO_ALLOWED_ORIGINS', classification: 'SERVER_ONLY', requiredInProduction: true, description: 'CORS allowlist for production API' },
];

export function resolveRuntimeEnvironment(settings?: Pick<SecuritySettings, 'environmentLabel' | 'demoModeActive'>): AioRuntimeEnvironment {
  if (settings?.environmentLabel === 'PRODUCTION' && !settings.demoModeActive) return 'production';
  if (settings?.environmentLabel === 'DEMO') return 'demo';
  return 'debug';
}

export function isDebugEnvironment(settings?: SecuritySettings): boolean {
  const env = resolveRuntimeEnvironment(settings);
  return env === 'debug' || env === 'demo';
}

export function validateStartupSecurity(settings: SecuritySettings): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (settings.environmentLabel === 'PRODUCTION') {
    if (settings.demoModeActive) errors.push('Demo mode cannot be active in production environment label');
    for (const spec of AIO_ENV_SPECS.filter((s) => s.requiredInProduction)) {
      if (spec.classification === 'SECRET' && typeof import.meta !== 'undefined') {
        // Client bundle cannot validate server secrets — documented boundary
        continue;
      }
    }
  }
  return { ok: errors.length === 0, errors };
}
