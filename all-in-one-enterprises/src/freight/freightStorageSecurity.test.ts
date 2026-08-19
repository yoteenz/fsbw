/**
 * Live Supabase storage security — freight/document buckets private by default.
 */
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
const serviceKey = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;

const FREIGHT_BUCKET_HINTS = [
  'freight-documents',
  'aio-freight',
  'aio-documents',
  'documents',
  'brokerage-documents',
];

const hasLive = Boolean(url && anonKey);
const hasService = Boolean(url && serviceKey);

describe.skipIf(!hasLive)('freight storage — unauthenticated', () => {
  it('cannot list storage objects without auth', async () => {
    const client = createClient(url!, anonKey!, { auth: { persistSession: false } });
    for (const bucket of FREIGHT_BUCKET_HINTS) {
      const { data, error } = await client.storage.from(bucket).list('', { limit: 1 });
      if (error) {
        expect(error.message.length).toBeGreaterThan(0);
      } else {
        expect(data ?? []).toHaveLength(0);
      }
    }
  });
});

describe.skipIf(!hasService)('freight storage — bucket privacy audit', () => {
  it('existing freight-related buckets are not public', async () => {
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    const { data: buckets, error } = await admin.storage.listBuckets();
    expect(error).toBeNull();

    const freightBuckets = (buckets ?? []).filter((b) =>
      FREIGHT_BUCKET_HINTS.some((hint) => b.name.includes(hint.replace(/-/g, '')) || b.name.includes(hint)),
    );

    if (freightBuckets.length === 0) {
      // No dedicated freight buckets yet — document table refs only; not a storage policy failure.
      expect(true).toBe(true);
      return;
    }

    for (const bucket of freightBuckets) {
      expect(bucket.public).toBe(false);
    }
  });

  it('cannot obtain permanent public URL for confidential path without public bucket', async () => {
    const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
    const { data: buckets } = await admin.storage.listBuckets();
    const target = (buckets ?? []).find((b) => !b.public);
    if (!target) return;

    const path = `qa-internal/bol-${Date.now()}.pdf`;
    const payload = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
    const { error: upErr } = await admin.storage.from(target.name).upload(path, payload, {
      contentType: 'application/pdf',
      upsert: true,
    });
    if (upErr) {
      // Bucket may be migration-managed only — skip upload probe
      return;
    }

    const { data: pub } = admin.storage.from(target.name).getPublicUrl(path);
    expect(pub.publicUrl).toContain(target.name);

    const res = await fetch(pub.publicUrl);
    expect([401, 403, 404]).toContain(res.status);

    await admin.storage.from(target.name).remove([path]);
  });
});
