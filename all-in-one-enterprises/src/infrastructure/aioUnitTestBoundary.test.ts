import { describe, expect, it } from 'vitest';
import { isDemoMode, isSupabaseMode } from '../config/dataMode';
import { effectiveDataMode } from '../config/env';
import { getAioSupabase } from '../data/supabase/client';

describe('AIO unit test runtime boundary', () => {
  it('vitest layer runs in demo data mode (not production Supabase adapter)', () => {
    expect(effectiveDataMode()).toBe('demo');
    expect(isDemoMode()).toBe(true);
    expect(isSupabaseMode()).toBe(false);
  });

  it('getAioSupabase stays null in demo unit-test layer', () => {
    expect(getAioSupabase()).toBeNull();
  });
});
