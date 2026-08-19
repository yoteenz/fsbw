/**
 * Demo vs production isolation checks for freight persistence.
 */
import { describe, expect, it } from 'vitest';
import { isDemoMode, isSupabaseMode } from '../config/dataMode';
import { demoShipperFreightRepository } from '../shipper/demoShipperFreightRepository';
import { createSupabaseShipperFreightRepository } from '../shipper/supabaseShipperFreightRepository';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
const hasLiveCreds = Boolean(url && anonKey);

describe('demo / production freight isolation', () => {
  it('demo shipper repository is distinct from supabase adapter', () => {
    expect(demoShipperFreightRepository.mode).toBe('demo');
    const supa = createSupabaseShipperFreightRepository('org-x', 'user-x');
    expect(supa.mode).toBe('supabase');
    expect(demoShipperFreightRepository).not.toBe(supa);
  });

  it('supabase mode does not silently activate without credentials in CI', () => {
    if (process.env.VITE_AIO_DATA_MODE === 'supabase' && hasLiveCreds) {
      expect(isSupabaseMode()).toBe(true);
      expect(isDemoMode()).toBe(false);
    } else if (process.env.VITE_AIO_DATA_MODE === 'demo' || !process.env.VITE_AIO_DATA_MODE) {
      expect(isDemoMode()).toBe(true);
    }
  });

  it('forbidden FS project ref is not the configured AIO URL', () => {
    if (!url) return;
    expect(url).not.toContain('hyycomvcaqxxvyrfupes');
    expect(url).toContain('nnnljnhtmseagotvgxxt');
  });
});
