/**
 * Static 2D mannequin asset triples used across Build-a-Wig sub-pages (`getWigViews` pattern)
 * and admin flows that must match the same references (e.g. Send offer → Generate unit).
 */

/** NOIR natural hairline — left (L); also Fal GPT2 color + styling input for `left`. */
export const NOIR_NATURAL_LEFT_MANNEQUIN_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(27).png';

/** NOIR natural hairline — front / middle (M) hero; also Fal GPT2 color + styling input for `front`. */
export const NOIR_NATURAL_FRONT_MANNEQUIN_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(26).png';

/** NOIR natural hairline — right (R); also Fal GPT2 color + styling input for `right`. */
export const NOIR_NATURAL_RIGHT_MANNEQUIN_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(28).png';

/** UI scale for NOIR natural front (M) mannequin overlay — tuned vs L/R framing (0.7 → 0.805 → 0.84525 → 0.8875125 → 0.931888125). */
export const NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE = 0.931888125;

function normalizedMannequinSrcPath(src: string): string {
  const raw = (src || '').split(/[?#]/)[0].trim();
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//')) {
      const u = new URL(raw.startsWith('//') ? `https:${raw}` : raw);
      return decodeURIComponent(u.pathname).toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return decodeURIComponent(raw).toLowerCase();
}

/** True for NOIR natural **left** mannequin overlay (Supabase or legacy `/assets/natural left.png`). */
export function isNoirNaturalLeftMannequinSrc(src: string): boolean {
  const norm = normalizedMannequinSrcPath(src);
  if (norm === normalizedMannequinSrcPath(NOIR_NATURAL_LEFT_MANNEQUIN_SRC)) return true;
  return norm.endsWith('/natural left.png');
}

/** True for NOIR natural **middle/front** mannequin overlay (Supabase or legacy `/assets/natural front.png`). */
export function isNoirNaturalFrontMannequinSrc(src: string): boolean {
  const norm = normalizedMannequinSrcPath(src);
  if (norm === normalizedMannequinSrcPath(NOIR_NATURAL_FRONT_MANNEQUIN_SRC)) return true;
  return norm.endsWith('/natural front.png');
}

/** True for NOIR natural **right** mannequin overlay (Supabase or legacy `/assets/natural right.png`). */
export function isNoirNaturalRightMannequinSrc(src: string): boolean {
  const norm = normalizedMannequinSrcPath(src);
  if (norm === normalizedMannequinSrcPath(NOIR_NATURAL_RIGHT_MANNEQUIN_SRC)) return true;
  return norm.endsWith('/natural right.png');
}

export function scaleNoirFrontMannequinDisplayPx(basePx: number): number {
  return basePx * NOIR_NATURAL_FRONT_MANNEQUIN_DISPLAY_SCALE;
}

/** NOIR natural L / M / R — order matches BAW `wigViews` (left, front, right). */
export const NOIR_NATURAL_MANNEQUIN_TRIPLE = [
  NOIR_NATURAL_LEFT_MANNEQUIN_SRC,
  NOIR_NATURAL_FRONT_MANNEQUIN_SRC,
  NOIR_NATURAL_RIGHT_MANNEQUIN_SRC,
] as const;

export function bawStaticMannequinTriplePathsFromUnitAndHairline(
  unitKey: string,
  hairlineRaw: string
): readonly [string, string, string] {
  const u = String(unitKey || '').trim().toUpperCase();
  const hairline = String(hairlineRaw || '').trim().toUpperCase();

  if (u === 'BLANCO') {
    return ['/assets/2D BLANCO LEFT.png', '/assets/2D BLANCO FRONT.png', '/assets/2D BLANCO RIGHT.png'] as const;
  }
  if (u === 'SOFT WAVE' || u === 'BEACH WAVE') {
    return ['/assets/2D WAVY LEFT.png', '/assets/2D WAVY FRONT.png', '/assets/2D WAVY RIGHT.png'] as const;
  }
  if (u === 'SOFT CURL' || u === 'OCEAN CURL') {
    return ['/assets/2D CURLY LEFT.png', '/assets/2D CURLY FRONT.png', '/assets/2D CURLY RIGHT.png'] as const;
  }

  const hasPeak = hairline.includes('PEAK');
  const hasLagos = hairline.includes('LAGOS');
  if (hasPeak) {
    return ['/assets/peak left.png', '/assets/peak front.png', '/assets/peak right.png'] as const;
  }
  if (hasLagos) {
    return ['/assets/lagos left.png', '/assets/lagos front.png', '/assets/lagos right.png'] as const;
  }
  return NOIR_NATURAL_MANNEQUIN_TRIPLE;
}

/** Front view path — same as BAW hero middle when using static (non-live) mannequins. */
export function bawStaticMannequinFrontReferencePathFromUnitAndHairline(
  unitKey: string,
  hairlineRaw: string
): string {
  return bawStaticMannequinTriplePathsFromUnitAndHairline(unitKey, hairlineRaw)[1];
}

/**
 * When **true**, the static front mannequin already matches the selected hairline (NOIR peak/lagos/natural),
 * so the generate-unit chain should not run a separate “hairline change” edit on top of the reference.
 * Blanco / wavy / curly use a single 2D set — we return **false** so lace/styling/etc. edits still apply as needed.
 */
export function bawStaticFrontReferenceMatchesHairlineSelection(
  unitKey: string,
  hairlineRaw: string,
  frontReferencePath: string
): boolean {
  const u = String(unitKey || '').trim().toUpperCase();
  if (u !== 'NOIR') return false;
  const h = String(hairlineRaw || '').trim().toUpperCase();
  const p = String(frontReferencePath || '').toLowerCase();
  if (p.includes('peak')) return h.includes('PEAK');
  if (p.includes('lagos')) return h.includes('LAGOS') && !h.includes('PEAK');
  if (p.includes('natural') || frontReferencePath === NOIR_NATURAL_FRONT_MANNEQUIN_SRC) {
    return !h.includes('PEAK') && !h.includes('LAGOS');
  }
  return false;
}
