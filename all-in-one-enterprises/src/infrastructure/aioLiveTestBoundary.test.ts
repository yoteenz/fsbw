import { describe, expect, it } from 'vitest';
import { effectiveDataMode } from '../config/env';
import { getAioSupabase } from '../data/supabase/client';

describe('AIO live Supabase test boundary', () => {
  it('when AIO_LIVE_SUPABASE_TEST=1, effectiveDataMode is supabase with configured URL/key', () => {
    if (process.env.AIO_LIVE_SUPABASE_TEST !== '1') {
      expect(process.env.VITE_AIO_DATA_MODE).toBe('demo');
      return;
    }
    expect(effectiveDataMode()).toBe('supabase');
    expect(getAioSupabase()).not.toBeNull();
  });
});
