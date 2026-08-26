/**
 * Vitest global setup — unit-test runtime boundary.
 * Forces demo data mode so unit tests never initialize production Supabase via getAioSupabase().
 * Live production tests (*Live.test.ts, *Integration.test.ts) use createClient() directly
 * with credentials from process.env, not import.meta.env data mode.
 */
import { beforeEach } from 'vitest';
import { resetAioSupabaseClient } from './src/data/supabase/client';

process.env.VITE_AIO_DATA_MODE = 'demo';
process.env.VITE_AIO_SUPABASE_URL = '';
process.env.VITE_AIO_SUPABASE_ANON_KEY = '';

beforeEach(() => {
  resetAioSupabaseClient();
});
