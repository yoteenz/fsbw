/**
 * 3D PDP mannequin front references per unit — passed to Fal as texture guides for
 * match thumbnails and client preview hair edits.
 */

const UNIT_3D_FRONT: Record<string, string> = {
  NOIR: '/assets/NOIR/noir front.png',
  'SOFT WAVE': '/assets/SOFT-WAVE FRONT.png',
  'BEACH WAVE': '/assets/BEACH WAVE FRONT.JPG',
  'SOFT CURL': '/assets/SOFT CURL FRONT.JPG',
  'OCEAN CURL': '/assets/OCEAN CURL FRONT.JPG',
  BLANCO: '/assets/BLANCO-FRONT.png',
};

export function hairstyleAnalysis3dMannequinFrontPath(unitKey: string): string {
  const u = String(unitKey || '').trim().toUpperCase();
  return UNIT_3D_FRONT[u] ?? UNIT_3D_FRONT.NOIR;
}

/** Client first name only — legacy; pill now shows TOP MATCH. */
export function clientFirstName(clientName: string): string {
  const trimmed = String(clientName || '').trim();
  if (!trimmed) return 'CLIENT';
  return trimmed.split(/\s+/)[0]!.toUpperCase();
}

/** Client first + last name — black header above overall score panel. */
export function clientFullName(clientName: string): string {
  const trimmed = String(clientName || '').trim();
  if (!trimmed) return 'CLIENT';
  return trimmed.toUpperCase();
}

export type MannequinRefIndex = {
  unit: string;
  path: string;
  /** 1-based index in Fal image_urls array */
  imageIndex: number;
};

/**
 * Unique units from top match + alternates, in stable order.
 * imageIndex starts at `startIndex` (first slot after template, client, stars).
 */
export function collectMannequinRefsForAnalysis(
  units: string[],
  startIndex: number
): MannequinRefIndex[] {
  const seen = new Set<string>();
  const refs: MannequinRefIndex[] = [];
  let next = startIndex;

  for (const raw of units) {
    const unit = String(raw || '').trim().toUpperCase();
    if (!unit || seen.has(unit)) continue;
    seen.add(unit);
    refs.push({
      unit,
      path: hairstyleAnalysis3dMannequinFrontPath(unit),
      imageIndex: next++,
    });
  }

  return refs;
}
