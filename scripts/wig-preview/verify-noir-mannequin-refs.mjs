#!/usr/bin/env node
/**
 * Verify NOIR mannequin URLs: UI overlays vs Fal gray-brick scene refs.
 * Keep in sync with:
 *   - api/_lib/bawNoirFalMannequinUrls.ts
 *   - api/_lib/bawNoirNaturalMannequinUrls.ts
 *   - src/utils/bawStaticMannequinReferencePaths.ts
 *
 * Usage: npm run wig-preview:verify-noir-mannequins
 */

const UI_OVERLAY = {
  front: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(26).png',
  left: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(27).png',
  right: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(28).png',
};

const FAL_GRAY_BRICK = {
  front: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/fal-gray-brick-front.png',
  left: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/fal-gray-brick-left.png',
  right: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/fal-gray-brick-right.png',
};

const LEGACY_APP_ASSET_PATTERN = /\/assets\/natural%20(left|front|right)\.png/i;
const TRANSPARENT_OVERLAY_PATTERN = /\/noir\/image%20\(\d+\)\.png/i;

function envTrim(key) {
  return process.env[key]?.trim() || '';
}

function resolveFalUrl(angle) {
  const falKey = `WIG_PREVIEW_NOIR_FAL_MANNEQUIN_${angle.toUpperCase()}_URL`;
  const legacyKey = `WIG_PREVIEW_NOIR_MANNEQUIN_${angle.toUpperCase()}_URL`;
  return envTrim(falKey) || envTrim(legacyKey) || FAL_GRAY_BRICK[angle];
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

async function pngHasAlpha(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const colorType = buf[25];
    return colorType === 4 || colorType === 6;
  } catch {
    return null;
  }
}

function isLegacyAppAssetUrl(url) {
  return LEGACY_APP_ASSET_PATTERN.test(url) || /\/assets\/natural (left|front|right)\.png/i.test(url);
}

async function checkGroup(label, resolveUrl, { expectOpaqueForFal }) {
  console.log(`${label}\n`);
  let exitCode = 0;
  for (const angle of ['left', 'front', 'right']) {
    const url = resolveUrl(angle);
    const { ok, status, error } = await headOk(url);
    const alpha = ok ? await pngHasAlpha(url) : null;

    console.log(`[${angle.toUpperCase()}] ${url}`);
    if (!ok) {
      console.log(`  FAIL: HTTP ${status}${error ? ` (${error})` : ''}`);
      exitCode = 1;
    } else {
      console.log(`  OK: HTTP ${status}`);
      if (expectOpaqueForFal && url.includes('fal-gray-brick')) {
        console.log('  OK: gray-brick Fal scene ref');
      } else if (expectOpaqueForFal && alpha === true) {
        console.log('  WARN: transparent PNG used for Fal — use fal-gray-brick-* refs');
        exitCode = 1;
      } else if (expectOpaqueForFal && alpha === false) {
        console.log('  OK: opaque scene (good for Fal)');
      }
      if (!expectOpaqueForFal && alpha === true) {
        console.log('  OK: transparent overlay (expected for UI)');
      }
    }
    if (isLegacyAppAssetUrl(url)) {
      console.log('  WARN: legacy /assets/natural URL — not for Fal');
      exitCode = 1;
    }
    if (expectOpaqueForFal && TRANSPARENT_OVERLAY_PATTERN.test(url.toLowerCase())) {
      console.log('  WARN: transparent UI overlay URL — use fal-gray-brick-* for Fal');
      exitCode = 1;
    }
    console.log('');
  }
  return exitCode;
}

async function main() {
  let exitCode = 0;

  exitCode |= await checkGroup('UI overlays (hero/thumbs — transparent figure)', (a) => UI_OVERLAY[a], {
    expectOpaqueForFal: false,
  });

  exitCode |= await checkGroup('Fal GPT2 gray-brick refs (color + FLAT IRON geometry)', resolveFalUrl, {
    expectOpaqueForFal: true,
  });

  console.log('Fal defaults (leave WIG_PREVIEW_NOIR_FAL_MANNEQUIN_* unset after build script):');
  for (const angle of ['left', 'front', 'right']) {
    console.log(`  WIG_PREVIEW_NOIR_FAL_MANNEQUIN_${angle.toUpperCase()}_URL=${FAL_GRAY_BRICK[angle]}`);
  }
  console.log('\nBuild Fal refs: npm run wig-preview:build-noir-fal-gray-brick-refs');
  console.log('After deploy: regen color L/M/R — cached wig-preview-live WebPs do not auto-update.');

  process.exit(exitCode);
}

main();
