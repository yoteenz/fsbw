import { aioEnv, backendSetupMessage, effectiveDataMode, getDataModeLabel, type AioDataMode } from './env';

export type AioEnvironmentLabel = 'DEMO ENVIRONMENT' | 'STAGING' | 'PRODUCTION';

export function getDataMode(): AioDataMode {
  return effectiveDataMode();
}

export function isDemoMode(): boolean {
  return getDataMode() === 'demo';
}

export function isLocalTestMode(): boolean {
  return getDataMode() === 'local';
}

export function isSupabaseMode(): boolean {
  return getDataMode() === 'supabase';
}

/** @deprecated use isSupabaseMode */
export function isBackendMode(): boolean {
  return isSupabaseMode();
}

/** Visual banner label for debug/staging builds. */
export function getEnvironmentLabel(): AioEnvironmentLabel | null {
  if (isDemoMode()) return 'DEMO ENVIRONMENT';
  if (import.meta.env.DEV) return 'STAGING';
  return null;
}

export function canResetDemoData(): boolean {
  return isDemoMode() || isLocalTestMode();
}

export function canEnterDemoOffice(): boolean {
  return isDemoMode() || isLocalTestMode();
}

export function getBackendSetupWarning(): string | null {
  return backendSetupMessage();
}

export { getDataModeLabel };

export const aioDataConfig = {
  mode: getDataMode(),
  modeLabel: getDataModeLabel(),
  env: aioEnv,
} as const;
