/**
 * Public NOIR natural mannequin URLs for Fal GPT2 live color/styling.
 * Keep in sync with `src/utils/bawStaticMannequinReferencePaths.ts`.
 */

export const NOIR_NATURAL_LEFT_MANNEQUIN_PUBLIC_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(27).png';

export const NOIR_NATURAL_FRONT_MANNEQUIN_PUBLIC_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(26).png';

export const NOIR_NATURAL_RIGHT_MANNEQUIN_PUBLIC_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(28).png';

export function noirNaturalMannequinPublicUrlForAngle(angle: 'front' | 'left' | 'right'): string {
  if (angle === 'left') return NOIR_NATURAL_LEFT_MANNEQUIN_PUBLIC_URL;
  if (angle === 'right') return NOIR_NATURAL_RIGHT_MANNEQUIN_PUBLIC_URL;
  return NOIR_NATURAL_FRONT_MANNEQUIN_PUBLIC_URL;
}
