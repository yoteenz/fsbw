import { describe, expect, it } from 'vitest';
import { runFsIsolationSelfCheck } from '../../../src/security/fsIsolation';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
const serviceKey = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;
const hasLiveRls = Boolean(url && anonKey);
const hasLiveStorage = Boolean(url && (serviceKey || anonKey));

describe('Security, RLS, Storage, Demo isolation readiness', () => {
  it('passes Frontal Slayer isolation self-check', () => {
    expect(runFsIsolationSelfCheck().ok).toBe(true);
  });

  it('reports live RLS credential availability honestly', () => {
    if (!hasLiveRls) {
      expect(process.env.AIO_RLS_TEST_STAFF_JWT ?? '').toBe('');
    }
  });

  it('reports storage validation credential availability', () => {
    if (!hasLiveStorage) {
      expect(serviceKey ?? '').toBe('');
    }
  });

  it('forbids Frontal Slayer project ref in AIO URL when configured', () => {
    if (!url) return;
    expect(url).not.toContain('hyycomvcaqxxvyrfupes');
  });
});
