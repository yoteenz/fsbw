/**
 * Server-side Scene Stack™ reference law enforcement.
 * Approved generative layers must never re-enter FAL.
 */

export function assertSceneStackFalReferencesAllowed(input: {
  productionGroupId: string;
  referenceImageUrls?: string[];
}): { ok: true } | { ok: false; error: string } {
  const isSceneStack = input.productionGroupId.startsWith('scene-stack-');
  if (!isSceneStack) return { ok: true };

  const urls = (input.referenceImageUrls ?? []).filter((u) => typeof u === 'string' && u.startsWith('http'));

  if (urls.length > 1) {
    return {
      ok: false,
      error:
        'Scene Assembly Law: only one environment-shell placement URL allowed — never cumulative layer stack.',
    };
  }

  return { ok: true };
}
