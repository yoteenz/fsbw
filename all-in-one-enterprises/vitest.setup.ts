/**
 * Vitest global setup — unit-test runtime boundary.
 * Unit layer forces demo mode so tests never initialize production Supabase via getAioSupabase().
 * Live CI steps set AIO_LIVE_SUPABASE_TEST=1 and preserve supabase credentials for *Live/*Integration tests.
 */
import { beforeEach } from 'vitest';
import { resetAioSupabaseClient } from './src/data/supabase/client';

const isLiveSupabaseTest = process.env.AIO_LIVE_SUPABASE_TEST === '1';

if (!isLiveSupabaseTest) {
  process.env.VITE_AIO_DATA_MODE = 'demo';
  process.env.VITE_AIO_SUPABASE_URL = '';
  process.env.VITE_AIO_SUPABASE_ANON_KEY = '';
} else {
  process.env.VITE_AIO_DATA_MODE = process.env.VITE_AIO_DATA_MODE ?? 'supabase';
  process.env.VITE_AIO_SUPABASE_URL =
    process.env.VITE_AIO_SUPABASE_URL ?? process.env.AIO_STAGING_SUPABASE_URL ?? '';
  process.env.VITE_AIO_SUPABASE_ANON_KEY =
    process.env.VITE_AIO_SUPABASE_ANON_KEY ?? process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? '';
}

beforeEach(() => {
  resetAioSupabaseClient();
});
