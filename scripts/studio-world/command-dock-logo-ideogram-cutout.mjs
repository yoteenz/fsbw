#!/usr/bin/env node
/**
 * Ideogram background removal for Experience Lab Command Dock logo.
 * Output: live-preview/Studio World/IMG_6220-cutout.png (public)
 */
import { createClient } from '@supabase/supabase-js';
import { fal } from '@fal-ai/client';

const BUCKET = 'live-preview';
const SOURCE_PATH = 'Studio World/IMG_6220.png';
const OUTPUT_PATH = 'Studio World/IMG_6220-cutout.png';
const IDEOGRAM_MODEL = 'fal-ai/ideogram/remove-background';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const falKey = process.env.FAL_KEY;

if (!supabaseUrl || !serviceKey || !falKey) {
  console.error('Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FAL_KEY');
  process.exit(1);
}

const sourceUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${encodeURI(SOURCE_PATH).replace(/%20/g, '%20')}`;

function extractUrl(result) {
  const data = result?.data ?? result;
  return data?.image?.url || data?.images?.[0]?.url || data?.url || null;
}

async function main() {
  console.log('Source:', sourceUrl);
  fal.config({ credentials: falKey });

  const cut = await fal.subscribe(IDEOGRAM_MODEL, {
    input: { image_url: sourceUrl },
    logs: false,
  });

  const cutUrl = extractUrl(cut);
  if (!cutUrl) throw new Error('Ideogram returned no cutout URL');

  const response = await fetch(cutUrl);
  if (!response.ok) throw new Error(`Download cutout failed (${response.status})`);
  const png = Buffer.from(await response.arrayBuffer());

  const supabase = createClient(supabaseUrl, serviceKey);
  const { error } = await supabase.storage.from(BUCKET).upload(OUTPUT_PATH, png, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw error;

  const publicUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${encodeURI(OUTPUT_PATH)}`;
  console.log('Uploaded:', publicUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
