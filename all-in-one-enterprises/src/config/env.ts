/**
 * All In One — isolated environment configuration.
 * NEVER use Frontal Slayer Supabase URL/keys here.
 */

import { FRONTAL_SLAYER_SUPABASE_PROJECT_ID } from '../data/constants';
import { isProductionDeployment } from '../infrastructure/environmentModel';

export type AioDataMode = 'demo' | 'local' | 'supabase';

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return value.trim();
}

function readDataMode(): AioDataMode {
  const raw = readEnv('VITE_AIO_DATA_MODE');
  if (raw === 'backend') return 'supabase';
  if (raw === 'local' || raw === 'supabase' || raw === 'demo') return raw;
  return 'demo';
}

export const aioEnv = {
  dataMode: readDataMode(),
  environment: readEnv('VITE_AIO_ENVIRONMENT') ?? 'debug',
  supabaseUrl: readEnv('VITE_AIO_SUPABASE_URL'),
  supabaseAnonKey: readEnv('VITE_AIO_SUPABASE_ANON_KEY'),
  siteUrl: readEnv('VITE_AIO_SITE_URL'),
  storageMode: readEnv('VITE_AIO_STORAGE_MODE') ?? 'demo',
  authMode: readEnv('VITE_AIO_AUTH_MODE') ?? 'demo',
} as const;

/** Server-only vars (not in import.meta.env) — documented for extraction */
export const aioServerEnvKeys = [
  'AIO_DATA_MODE',
  'AIO_SUPABASE_URL',
  'AIO_SUPABASE_ANON_KEY',
  'AIO_SUPABASE_SERVICE_ROLE_KEY',
  'AIO_SUPABASE_PROJECT_REF',
  'AIO_STORAGE_MODE',
  'AIO_AUTH_MODE',
  'AIO_ENVIRONMENT',
] as const;

export function isSupabaseConfigured(): boolean {
  return Boolean(aioEnv.supabaseUrl && aioEnv.supabaseAnonKey);
}

export function isFrontalSlayerSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes(FRONTAL_SLAYER_SUPABASE_PROJECT_ID) || lower.includes('hyycomvcaqxxvyrfupes');
}

export function validateAioEnvironment(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (aioEnv.dataMode === 'supabase') {
    if (!aioEnv.supabaseUrl) errors.push('AIO_DATA_MODE=supabase but VITE_AIO_SUPABASE_URL is missing');
    if (!aioEnv.supabaseAnonKey) errors.push('AIO_DATA_MODE=supabase but VITE_AIO_SUPABASE_ANON_KEY is missing');
    if (isFrontalSlayerSupabaseUrl(aioEnv.supabaseUrl)) {
      errors.push('VITE_AIO_SUPABASE_URL points to Frontal Slayer project — use dedicated All In One Supabase');
    }
  }

  return { ok: errors.length === 0, errors };
}

export function effectiveDataMode(): AioDataMode {
  const validation = validateAioEnvironment();
  if (aioEnv.dataMode === 'supabase') {
    if (validation.ok && isSupabaseConfigured()) return 'supabase';
    if (isProductionDeployment()) {
      throw new Error(
        validation.errors[0] ??
          'Production requires configured Supabase — silent demo fallback is disabled',
      );
    }
  }
  if (aioEnv.dataMode === 'local') return 'local';
  return 'demo';
}

/** @deprecated use effectiveDataMode === 'supabase' */
export function isBackendConfigured(): boolean {
  return effectiveDataMode() === 'supabase';
}

export function backendSetupMessage(): string | null {
  if (aioEnv.dataMode !== 'supabase') return null;
  const validation = validateAioEnvironment();
  if (validation.ok && isSupabaseConfigured()) return null;
  return validation.errors[0] ?? 'All In One Supabase configuration incomplete. Demo mode active until dedicated project is connected.';
}

export function getDataModeLabel(): string {
  const mode = effectiveDataMode();
  switch (mode) {
    case 'demo':
      return 'DEMO';
    case 'local':
      return 'LOCAL/TEST';
    case 'supabase':
      return import.meta.env.DEV ? 'SUPABASE DEV' : 'SUPABASE';
    default:
      return 'DEMO';
  }
}
