import { aioAppConfig } from './appConfig';
import { aioEnv } from './env';

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key];
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  return value.trim();
}

/** Build a public Supabase Storage object URL from the configured project URL. */
export function getAioPublicStorageUrl(objectPath: string): string {
  const override = readEnv('VITE_AIO_LOGIN_HERO_URL');
  if (override && objectPath === aioAppConfig.assets.loginHeroStoragePath) {
    return override;
  }

  const base = aioEnv.supabaseUrl?.replace(/\/$/, '');
  if (base) {
    return `${base}/storage/v1/object/public/${objectPath}`;
  }

  const storageBase = readEnv('VITE_AIO_PUBLIC_STORAGE_URL')?.replace(/\/$/, '');
  if (storageBase) {
    return `${storageBase}/${objectPath}`;
  }

  return '';
}

export function getAioLoginHeroImageUrl(): string {
  return getAioPublicStorageUrl(aioAppConfig.assets.loginHeroStoragePath);
}
