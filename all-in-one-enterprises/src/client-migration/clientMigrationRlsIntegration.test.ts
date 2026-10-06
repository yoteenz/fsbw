import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;

describe.skipIf(!url || !anonKey)('client migration RLS — live Supabase', () => {
  it('anon cannot read migration batches', async () => {
    const client = createClient(url!, anonKey!);
    const { data } = await client.from('aio_archive_migration_batches').select('id').limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it('anon cannot read extracted facts', async () => {
    const client = createClient(url!, anonKey!);
    const { data } = await client.from('aio_client_extracted_facts').select('id').limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it('anon cannot read migration intake storage objects metadata via batch files', async () => {
    const client = createClient(url!, anonKey!);
    const { data } = await client.from('aio_archive_migration_batch_files').select('id').limit(1);
    expect(data ?? []).toHaveLength(0);
  });
});
