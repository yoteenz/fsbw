/**
 * Static 2D mannequin asset triples used across Build-a-Wig sub-pages (`getWigViews` pattern)
 * and admin flows that must match the same references (e.g. Send offer → Generate unit).
 */

/** NOIR natural hairline — front / middle (M) hero; also Fal GPT2 color + styling input for `front`. */
export const NOIR_NATURAL_FRONT_MANNEQUIN_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Noir/image%20(26).png';

/** NOIR natural L / M / R — order matches BAW `wigViews` (left, front, right). */
export const NOIR_NATURAL_MANNEQUIN_TRIPLE = [
  '/assets/natural left.png',
  NOIR_NATURAL_FRONT_MANNEQUIN_SRC,
  '/assets/natural right.png',
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
