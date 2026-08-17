import { aioEnv, backendSetupMessage, effectiveDataMode, getDataModeLabel, type AioDataMode } from './env';
import { isProductionDeployment, isStagingDeployment, resolveDeploymentEnvironment } from '../infrastructure/environmentModel';

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

/** Visual banner label for debug/staging builds. Production returns null (no demo banner). */
export function getEnvironmentLabel(): AioEnvironmentLabel | null {
  if (isProductionDeployment()) return null;
  if (isStagingDeployment()) return 'STAGING';
  if (isDemoMode()) return 'DEMO ENVIRONMENT';
  if (import.meta.env.DEV) return 'STAGING';
  return null;
}

export function shouldShowDebugBanner(): boolean {
  if (isProductionDeployment()) return false;
  if (typeof import.meta !== 'undefined' && import.meta.env.DEV) return true;
  const flag = typeof import.meta !== 'undefined' ? import.meta.env.VITE_AIO_DEBUG_UI : undefined;
  if (flag === 'true' || flag === '1') return true;
  if (flag === 'false' || flag === '0') return false;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('aio_debug') === '1') return true;
  }
  return false;
}

export function canResetDemoData(): boolean {
  if (isProductionDeployment()) return false;
  return isDemoMode() || isLocalTestMode();
}

export function canEnterDemoOffice(): boolean {
  if (isProductionDeployment()) return false;
  return isDemoMode() || isLocalTestMode();
}

export function getDeploymentEnvironmentLabel(): string {
  return resolveDeploymentEnvironment().toUpperCase();
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
