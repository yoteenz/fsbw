/**
 * All In One — isolated environment configuration.
 * NEVER use Frontal Slayer Supabase URL/keys here.
 */

export type AioDataMode = 'demo' | 'backend';

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return value.trim();
}

export const aioEnv = {
  dataMode: (readEnv('VITE_AIO_DATA_MODE') as AioDataMode | undefined) ?? 'demo',
  supabaseUrl: readEnv('VITE_AIO_SUPABASE_URL'),
  supabaseAnonKey: readEnv('VITE_AIO_SUPABASE_ANON_KEY'),
  siteUrl: readEnv('VITE_AIO_SITE_URL'),
} as const;

export function isBackendConfigured(): boolean {
  return Boolean(aioEnv.supabaseUrl && aioEnv.supabaseAnonKey);
}

export function effectiveDataMode(): AioDataMode {
  if (aioEnv.dataMode === 'backend' && isBackendConfigured()) return 'backend';
  return 'demo';
}

export function backendSetupMessage(): string | null {
  if (aioEnv.dataMode !== 'backend') return null;
  if (isBackendConfigured()) return null;
  return 'Backend mode is enabled but VITE_AIO_SUPABASE_URL and VITE_AIO_SUPABASE_ANON_KEY are not configured. Demo mode is active until a dedicated All In One Supabase project is connected.';
}
