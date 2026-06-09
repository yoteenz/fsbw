#!/usr/bin/env node
/**
 * Composite transparent NOIR overlay PNGs onto leaf-brick → upload Fal gray-brick refs to Supabase.
 *
 * Sources (UI overlays):
 *   live-preview/Noir/image (27|26|28).png  — L / M / R
 * Brick: fsbw.vercel.app/assets/leaf-brick-resize.png
 *
 * Outputs (Fal GPT2 inputs):
 *   live-preview/Noir/fal-gray-brick-{left|front|right}.png
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (e.g. source .env.wig-preview)
 * Usage: npm run wig-preview:build-noir-fal-gray-brick-refs
 */

import { createClient } from '@supabase/supabase-js';
import { Jimp } from 'jimp';

const OUT_W = 1536;
const OUT_H = 2048;
const FRONT_MANNEQUIN_EXTRA_SCALE = 0.931888125;
const BOTTOM_MARGIN_PX = 48;

const OVERLAY_BY_ANGLE = {
  left: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(27).png',
  front:
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(26).png',
  right:
    'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(28).png',
};

const BRICK_URL = 'https://fsbw.vercel.app/assets/leaf-brick-resize.png';

const OUTPUT_PATH_BY_ANGLE = {
  left: 'Noir/fal-gray-brick-left.png',
  front: 'Noir/fal-gray-brick-front.png',
  right: 'Noir/fal-gray-brick-right.png',
};

async function compositeGrayBrickRef(overlayUrl, { frontScaled }) {
  const [brick, mannequin] = await Promise.all([Jimp.read(BRICK_URL), Jimp.read(overlayUrl)]);
  await brick.cover({ w: OUT_W, h: OUT_H });

  const targetH = Math.round(OUT_H * 0.82);
  await mannequin.resize({ h: targetH });
  if (frontScaled) {
    const scaledW = Math.max(1, Math.round(mannequin.width * FRONT_MANNEQUIN_EXTRA_SCALE));
    await mannequin.resize({ w: scaledW });
  }

  const mx = Math.round((OUT_W - mannequin.width) / 2);
  const my = OUT_H - mannequin.height - BOTTOM_MARGIN_PX;
  brick.composite(mannequin, mx, my);
  brick.scan(0, 0, brick.width, brick.height, function (_x, _y, idx) {
    this.bitmap.data[idx + 3] = 255;
  });
  return brick.getBuffer('image/png');
}

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.WIG_PREVIEW_STORAGE_BUCKET?.trim() || process.env.STORAGE_BUCKET?.trim() || 'live-preview';
  if (!url || !key) {
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. source .env.wig-preview)');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  for (const angle of ['left', 'front', 'right']) {
    const path = OUTPUT_PATH_BY_ANGLE[angle];
    console.log(`Building ${angle} → ${bucket}/${path}`);
    const png = await compositeGrayBrickRef(OVERLAY_BY_ANGLE[angle], {
      frontScaled: angle === 'front',
    });
    const { error } = await supabase.storage.from(bucket).upload(path, png, {
      contentType: 'image/png',
      upsert: true,
    });
    if (error) {
      console.error(`Upload failed for ${path}:`, error.message);
      process.exit(1);
    }
    const publicUrl = `${url}/storage/v1/object/public/${bucket}/${path}`;
    console.log(`  OK ${publicUrl} (${png.length} bytes)`);
  }

  console.log('\nDone. Set Vercel WIG_PREVIEW_NOIR_FAL_MANNEQUIN_* to these URLs (or leave unset for code defaults), redeploy, then regen color L/M/R.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
