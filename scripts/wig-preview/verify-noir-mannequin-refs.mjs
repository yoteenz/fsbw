#!/usr/bin/env node
/**
 * Verify NOIR Fal GPT2 mannequin reference URLs (color + FLAT IRON geometry second ref).
 * Keep in sync with:
 *   - api/_lib/bawNoirNaturalMannequinUrls.ts
 *   - src/utils/bawStaticMannequinReferencePaths.ts
 *   - api/wig-preview/live-noir-color.ts (inlined defaults)
 *
 * Usage:
 *   node scripts/wig-preview/verify-noir-mannequin-refs.mjs
 *   WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL=... node scripts/wig-preview/verify-noir-mannequin-refs.mjs
 */

const CANONICAL = {
  front: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(26).png',
  left: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(27).png',
  right: 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(28).png',
};

const LEGACY_APP_ASSET_PATTERN = /\/assets\/natural%20(left|front|right)\.png/i;

function envUrl(key, fallback) {
  const v = process.env[key]?.trim();
  return v || fallback;
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

function isLegacyAppAssetUrl(url) {
  return LEGACY_APP_ASSET_PATTERN.test(url) || /\/assets\/natural (left|front|right)\.png/i.test(url);
}

async function main() {
  const resolved = {
    front: envUrl('WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL', CANONICAL.front),
    left: envUrl('WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL', CANONICAL.left),
    right: envUrl('WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL', CANONICAL.right),
  };

  console.log('NOIR Fal mannequin refs — resolved URLs (env overrides code defaults):\n');
  let exitCode = 0;

  for (const angle of ['left', 'front', 'right']) {
    const url = resolved[angle];
    const fromEnv = Boolean(process.env[`WIG_PREVIEW_NOIR_MANNEQUIN_${angle.toUpperCase()}_URL`]?.trim());
    const canonical = CANONICAL[angle];
    const matchesCanonical = url === canonical;
    const legacy = isLegacyAppAssetUrl(url);
    const { ok, status, error } = await headOk(url);

    console.log(`[${angle.toUpperCase()}] ${url}`);
    console.log(
      `  source: ${fromEnv ? 'WIG_PREVIEW_NOIR_MANNEQUIN_*_URL env' : 'code default (Supabase)'}`
    );
    if (fromEnv && !matchesCanonical) {
      console.log(`  note: differs from current code default`);
      if (legacy) {
        console.log('  WARN: legacy /assets/natural *.png — update Vercel env to Supabase URLs below');
        exitCode = 1;
      }
    }
    if (!ok) {
      console.log(`  FAIL: HTTP ${status}${error ? ` (${error})` : ''}`);
      exitCode = 1;
    } else {
      console.log(`  OK: HTTP ${status}`);
    }
    console.log('');
  }

  console.log('Canonical Supabase URLs (set in Vercel or leave env unset to use code defaults):');
  for (const angle of ['left', 'front', 'right']) {
    console.log(`  WIG_PREVIEW_NOIR_MANNEQUIN_${angle.toUpperCase()}_URL=${CANONICAL[angle]}`);
  }
  console.log('');
  console.log(
    'Production check: Vercel → Project → Settings → Environment Variables. Remove or update any'
  );
  console.log(
    'WIG_PREVIEW_NOIR_MANNEQUIN_* pointing at https://fsbw.vercel.app/assets/natural *.png'
  );
  console.log(
    'FLAT IRON (MIDDLE, no bangs) uses the same Supabase URLs via api/_lib/bawNoirNaturalMannequinUrls.ts'
  );
  console.log('(WIG_PREVIEW_PUBLIC_APP_ORIGIN is unused — removed from styling path).');

  process.exit(exitCode);
}

main();
