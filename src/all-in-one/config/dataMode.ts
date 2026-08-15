import { aioEnv, backendSetupMessage, effectiveDataMode, type AioDataMode } from './env';

export type AioEnvironmentLabel = 'DEMO ENVIRONMENT' | 'STAGING' | 'PRODUCTION';

export function getDataMode(): AioDataMode {
  return effectiveDataMode();
}

export function isDemoMode(): boolean {
  return getDataMode() === 'demo';
}

export function isBackendMode(): boolean {
  return getDataMode() === 'backend';
}

/** Visual banner label for debug/staging builds. */
export function getEnvironmentLabel(): AioEnvironmentLabel | null {
  if (isDemoMode()) return 'DEMO ENVIRONMENT';
  if (import.meta.env.DEV) return 'STAGING';
  return null;
}

export function canResetDemoData(): boolean {
  return isDemoMode();
}

export function canEnterDemoOffice(): boolean {
  return isDemoMode();
}

export function getBackendSetupWarning(): string | null {
  return backendSetupMessage();
}

export const aioDataConfig = {
  mode: getDataMode(),
  env: aioEnv,
} as const;
