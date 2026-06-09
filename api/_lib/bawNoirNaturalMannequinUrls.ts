/**
 * Public NOIR natural mannequin URLs for Fal GPT2 live color/styling.
 * Keep **`NOIR_NATURAL_FRONT_MANNEQUIN_PUBLIC_URL`** in sync with
 * `src/utils/bawStaticMannequinReferencePaths.ts` → `NOIR_NATURAL_FRONT_MANNEQUIN_SRC`.
 */

export const NOIR_NATURAL_FRONT_MANNEQUIN_PUBLIC_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(26).png';

export function noirNaturalMannequinPublicUrlForAngle(
  angle: 'front' | 'left' | 'right',
  appOrigin: string
): string {
  if (angle === 'front') return NOIR_NATURAL_FRONT_MANNEQUIN_PUBLIC_URL;
  const file = angle === 'left' ? 'natural%20left.png' : 'natural%20right.png';
  return `${appOrigin.replace(/\/$/, '')}/assets/${file}`;
}
