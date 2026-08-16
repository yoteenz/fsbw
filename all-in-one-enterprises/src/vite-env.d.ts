/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIO_DATA_MODE?: string;
  readonly VITE_AIO_ENVIRONMENT?: string;
  readonly VITE_AIO_SUPABASE_URL?: string;
  readonly VITE_AIO_SUPABASE_ANON_KEY?: string;
  readonly VITE_AIO_SITE_URL?: string;
  readonly VITE_AIO_STORAGE_MODE?: string;
  readonly VITE_AIO_AUTH_MODE?: string;
  readonly VITE_AIO_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
