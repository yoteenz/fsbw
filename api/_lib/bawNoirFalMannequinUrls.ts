/**
 * **Fal GPT2 only** — gray-brick scene refs (mannequin + brick baked in).
 * UI transparent overlays live in `bawStaticMannequinReferencePaths.ts` / `bawNoirNaturalMannequinUrls.ts`.
 *
 * Build defaults: `npm run wig-preview:build-noir-fal-gray-brick-refs`
 */

const SUPABASE_NOIR_PUBLIC_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir';

export const NOIR_FAL_GRAY_BRICK_LEFT_MANNEQUIN_PUBLIC_URL = `${SUPABASE_NOIR_PUBLIC_BASE}/fal-gray-brick-left.png`;
export const NOIR_FAL_GRAY_BRICK_FRONT_MANNEQUIN_PUBLIC_URL = `${SUPABASE_NOIR_PUBLIC_BASE}/fal-gray-brick-front.png`;
export const NOIR_FAL_GRAY_BRICK_RIGHT_MANNEQUIN_PUBLIC_URL = `${SUPABASE_NOIR_PUBLIC_BASE}/fal-gray-brick-right.png`;

function envTrim(key: string): string {
  return process.env[key]?.trim() || '';
}

/** Fal gray-brick ref for an angle — env override, then baked Supabase default. */
export function noirFalGrayBrickMannequinPublicUrlForAngle(angle: 'front' | 'left' | 'right'): string {
  const envByAngle = {
    front: envTrim('WIG_PREVIEW_NOIR_FAL_MANNEQUIN_FRONT_URL') || envTrim('WIG_PREVIEW_NOIR_MANNEQUIN_FRONT_URL'),
    left: envTrim('WIG_PREVIEW_NOIR_FAL_MANNEQUIN_LEFT_URL') || envTrim('WIG_PREVIEW_NOIR_MANNEQUIN_LEFT_URL'),
    right: envTrim('WIG_PREVIEW_NOIR_FAL_MANNEQUIN_RIGHT_URL') || envTrim('WIG_PREVIEW_NOIR_MANNEQUIN_RIGHT_URL'),
  };
  if (angle === 'left') {
    return envByAngle.left || NOIR_FAL_GRAY_BRICK_LEFT_MANNEQUIN_PUBLIC_URL;
  }
  if (angle === 'right') {
    return envByAngle.right || NOIR_FAL_GRAY_BRICK_RIGHT_MANNEQUIN_PUBLIC_URL;
  }
  return envByAngle.front || NOIR_FAL_GRAY_BRICK_FRONT_MANNEQUIN_PUBLIC_URL;
}
